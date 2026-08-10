"use client";

import { createClient } from "@/lib/supabase/client";
import { formatTimestamp, getUserColorClass } from "@/lib/auth/placeFormatting";
import { getAvatarUrl } from "@/lib/avatar";

/**
 * Paged reads for everything that renders a list of recommendations — the
 * activity feed, a profile's own places, and a profile's wishlist.
 *
 * These lists used to be unbounded: opening the feed fetched every activity
 * every friend had ever posted, plus every comment row and every wishlist row
 * belonging to them, plus the full-size images on all of it. This module is the
 * web port of the app's `src/lib/activities.ts`, and it is built on the same
 * three ideas:
 *
 * 1. **One page at a time**, requested only when the reader scrolls to it.
 * 2. **One request per page.** The author's profile is embedded on the activity
 *    row, and the comment/save counters are columns the database maintains, so
 *    a page costs a single round trip instead of three.
 * 3. **A keyset cursor, not an offset.** These lists gain rows at the top while
 *    they are being read, and `.range()` would then skip or repeat items.
 */

/** Rows per page. Roughly two screens' worth. */
export const FEED_PAGE_SIZE = 8;

/**
 * Every column a card needs, in one request.
 *
 * `author` is embedded through `activities_user_id_profiles_fkey` — the
 * constraint that exists so PostgREST can reach `profiles` from an activity at
 * all (`user_id`'s original foreign key points at `auth.users`, which is not an
 * exposed schema).
 *
 * `comment_count` / `save_count` are trigger-maintained columns rather than two
 * more count queries per page. The save count could never be correct
 * client-side anyway: wishlist RLS only exposes the viewer's own rows, so
 * counting them showed 0 or 1 instead of the real number.
 */
export const ACTIVITY_SELECT =
  "id, user_id, place_name, latitude, longitude, is_superlike, description, created_at, categories, image_urls, map_snapshot_url, comment_count, save_count, author:profiles!activities_user_id_profiles_fkey(id, username, full_name, avatar_url)";

export interface AuthorProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface ActivityRow {
  id: string;
  user_id: string;
  place_name: string;
  latitude: number | null;
  longitude: number | null;
  is_superlike: boolean;
  description: string | null;
  created_at: string;
  categories: string[] | null;
  image_urls: string[] | null;
  map_snapshot_url: string | null;
  comment_count: number | null;
  save_count: number | null;
  author: AuthorProfile | null;
}

export interface FeedFriend {
  id: string;
  name: string;
  username: string;
  initials: string;
  color: string;
  avatarUrl: string | null;
}

export interface FeedActivity {
  id: string;
  placeName: string;
  latitude: number | null;
  longitude: number | null;
  isMustSee: boolean;
  description: string;
  categories: string[];
  imageUrls: string[];
  mapSnapshotUrl: string | null;
  /** Raw `created_at`, kept so a list can be merged and pruned by cursor. */
  createdAt: string;
  timestamp: string;
  commentCount: number;
  saveCount: number;
  friend: FeedFriend;
}

/** A page of rows plus the cursor that asks for the one after it. */
export interface ActivityPage<T> {
  items: T[];
  /** Pass back as `before`; `null` once the list is exhausted. */
  nextCursor: string | null;
}

export interface PageOptions {
  before?: string | null;
  limit?: number;
}

export function toFeedFriend(profile: AuthorProfile | null, userId: string): FeedFriend {
  const name = profile?.full_name ?? profile?.username ?? "Freund*in";
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return {
    id: userId,
    name,
    username: profile?.username ?? "",
    initials,
    color: getUserColorClass(userId),
    // Deliberately not cache-busted: a `?t=<now>` on every read makes each
    // avatar a fresh URL to the browser, so the same handful of faces is
    // re-downloaded on every page of every list.
    avatarUrl: getAvatarUrl(profile?.avatar_url),
  };
}

export function mapActivityRow(row: ActivityRow): FeedActivity {
  return {
    id: row.id,
    placeName: row.place_name,
    latitude: row.latitude,
    longitude: row.longitude,
    isMustSee: row.is_superlike,
    description: row.description ?? "",
    categories: Array.isArray(row.categories) ? row.categories : [],
    imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
    mapSnapshotUrl: row.map_snapshot_url,
    createdAt: row.created_at,
    timestamp: formatTimestamp(row.created_at),
    commentCount: row.comment_count ?? 0,
    saveCount: row.save_count ?? 0,
    friend: toFeedFriend(row.author, row.user_id),
  };
}

/** The cursor for the next page, or `null` when this page was the last one. */
function cursorAfter(rows: { created_at: string }[], limit: number): string | null {
  return rows.length === limit ? rows[rows.length - 1].created_at : null;
}

export interface FeedPageOptions extends PageOptions {
  /**
   * The accepted-friend ids the previous page was filtered by. Supplying them
   * skips the friendship read; leave it out (page 0) to resolve them fresh,
   * which is what picks up a newly accepted friend.
   */
  friendIds?: string[];
}

export interface FeedPage extends ActivityPage<FeedActivity> {
  /** The viewer's wishlist. Per-user and unchanged while paging, so page 0 only. */
  wishlistedIds: string[];
  /** The friend ids this page was filtered by, to hand to the next one. */
  friendIds: string[];
}

/**
 * One page of accepted friends' recommendations, newest first.
 *
 * RLS already scopes `activities` to the viewer's network, but it also lets the
 * viewer's *own* posts through — the feed shows only other people's, so the
 * friend ids are still needed for the filter.
 */
export async function fetchActivitiesFeed(
  userId: string,
  options: FeedPageOptions = {}
): Promise<FeedPage> {
  const supabase = createClient();
  const { before = null, limit = FEED_PAGE_SIZE, friendIds: knownFriendIds } = options;

  // Everything that depends only on `userId` goes out together, and none of it
  // is re-read while paging.
  const [friendshipsRes, wishlistRes] = await Promise.all([
    knownFriendIds
      ? Promise.resolve(null)
      : supabase
          .from("friendships")
          .select("sender_id, receiver_id")
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .eq("status", "accepted"),
    before
      ? Promise.resolve({ data: null })
      : supabase.from("wishlist").select("activity_id").eq("user_id", userId),
  ]);

  const friendIds =
    knownFriendIds ??
    (friendshipsRes?.data ?? []).map((row) =>
      row.sender_id === userId ? row.receiver_id : row.sender_id
    );

  let items: FeedActivity[] = [];
  let nextCursor: string | null = null;

  if (friendIds.length > 0) {
    let query = supabase
      .from("activities")
      .select(ACTIVITY_SELECT)
      .in("user_id", friendIds)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (before) query = query.lt("created_at", before);

    const { data } = await query;
    const rows = (data ?? []) as unknown as ActivityRow[];
    nextCursor = cursorAfter(rows, limit);
    items = rows.map(mapActivityRow);
  }

  return {
    items,
    nextCursor,
    wishlistedIds: (wishlistRes.data ?? []).map((row) => row.activity_id),
    friendIds,
  };
}

/** One page of a single user's own recommendations, newest first. */
export async function fetchUserActivities(
  userId: string,
  options: PageOptions = {}
): Promise<ActivityPage<FeedActivity>> {
  const supabase = createClient();
  const { before = null, limit = FEED_PAGE_SIZE } = options;

  let query = supabase
    .from("activities")
    .select(ACTIVITY_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) query = query.lt("created_at", before);

  const { data } = await query;
  const rows = (data ?? []) as unknown as ActivityRow[];
  return { items: rows.map(mapActivityRow), nextCursor: cursorAfter(rows, limit) };
}

export interface WishlistEntry extends FeedActivity {
  /** The wishlist row's own id, which is what the remove button deletes. */
  wishlistId: string;
}

/**
 * One page of the viewer's saved places, newest save first.
 *
 * The cursor here is the *wishlist* row's `created_at` — the order is when it
 * was saved, not when it was posted.
 */
export async function fetchWishlistPage(
  userId: string,
  options: PageOptions = {}
): Promise<ActivityPage<WishlistEntry>> {
  const supabase = createClient();
  const { before = null, limit = FEED_PAGE_SIZE } = options;

  let query = supabase
    .from("wishlist")
    .select(`id, created_at, activity:activities(${ACTIVITY_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) query = query.lt("created_at", before);

  const { data } = await query;
  const rows = (data ?? []) as unknown as {
    id: string;
    created_at: string;
    activity: ActivityRow | null;
  }[];

  const items = rows
    .filter((row): row is typeof row & { activity: ActivityRow } => row.activity !== null)
    .map((row) => ({
      ...mapActivityRow(row.activity),
      wishlistId: row.id,
      // The saved-at time is what this list is ordered by, so it is what the
      // card shows.
      timestamp: formatTimestamp(row.created_at),
    }));

  return { items, nextCursor: cursorAfter(rows, limit) };
}
