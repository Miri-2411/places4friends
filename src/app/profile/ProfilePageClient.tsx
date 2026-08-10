"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ProfileView from "@/components/ProfileView";
import AuthGate from "@/components/auth/AuthGate";
import { createClient } from "@/lib/supabase/client";
import {
  fetchUserActivities,
  fetchWishlistPage,
  type FeedActivity,
  type WishlistEntry,
} from "@/lib/activityFeed";

import { ProfileSkeleton } from "@/components/ui/Skeleton";

type PlaceItem = NonNullable<Parameters<typeof ProfileView>[0]["places"]>[number];
type WishlistItem = NonNullable<Parameters<typeof ProfileView>[0]["wishlist"]>[number];

function toPlaceItem(activity: FeedActivity): PlaceItem {
  return {
    id: activity.id,
    name: activity.placeName,
    latitude: activity.latitude,
    longitude: activity.longitude,
    isMustSee: activity.isMustSee,
    review: activity.description,
    categories: activity.categories,
    imageUrls: activity.imageUrls,
    mapSnapshotUrl: activity.mapSnapshotUrl,
    commentCount: activity.commentCount,
    saveCount: activity.saveCount,
    timestamp: activity.timestamp,
  };
}

function toWishlistItem(entry: WishlistEntry): WishlistItem {
  return {
    id: entry.wishlistId,
    activityId: entry.id,
    name: entry.placeName,
    latitude: entry.latitude,
    longitude: entry.longitude,
    isMustSee: entry.isMustSee,
    review: entry.description,
    categories: entry.categories,
    imageUrls: entry.imageUrls,
    mapSnapshotUrl: entry.mapSnapshotUrl,
    commentCount: entry.commentCount,
    saveCount: entry.saveCount,
    timestamp: entry.timestamp,
    friend: entry.friend,
  };
}

/**
 * Both profile tabs page on scroll. Only the first page of each is fetched up
 * front — the wishlist's because switching tabs should not stall, and because
 * one page of either is what fits on screen anyway.
 *
 * The author profiles behind the wishlist cards ride along on the activity rows
 * (see `ACTIVITY_SELECT`), so this screen no longer resolves them in a separate
 * `profiles` query per load.
 */
function ProfileContent({ user }: { user: User }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
  } | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);

  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [hasMorePlaces, setHasMorePlaces] = useState(false);
  const [isLoadingMorePlaces, setIsLoadingMorePlaces] = useState(false);
  const placesCursorRef = useRef<string | null>(null);
  const placesFetchingRef = useRef(false);

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [hasMoreWishlist, setHasMoreWishlist] = useState(false);
  const [isLoadingMoreWishlist, setIsLoadingMoreWishlist] = useState(false);
  const wishlistCursorRef = useRef<string | null>(null);
  const wishlistFetchingRef = useRef(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      const [{ data: profile }, { count }, firstPlaces, firstWishlist] = await Promise.all([
        supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("id", user.id)
          .single(),
        supabase
          .from("friendships")
          .select("*", { count: "exact", head: true })
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq("status", "accepted"),
        fetchUserActivities(user.id),
        fetchWishlistPage(user.id),
      ]);

      if (!mountedRef.current) return;

      setUserData({
        id: user.id,
        email: user.email ?? "",
        name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        username: profile?.username ?? user.user_metadata?.username ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      });
      setFriendsCount(count ?? 0);

      placesCursorRef.current = firstPlaces.nextCursor;
      setPlaces(firstPlaces.items.map(toPlaceItem));
      setHasMorePlaces(firstPlaces.nextCursor !== null);

      wishlistCursorRef.current = firstWishlist.nextCursor;
      setWishlist(firstWishlist.items.map(toWishlistItem));
      setHasMoreWishlist(firstWishlist.nextCursor !== null);

      setLoading(false);
    }

    void load();
    return () => {
      mountedRef.current = false;
    };
  }, [supabase, user]);

  const loadMorePlaces = useCallback(async () => {
    if (placesFetchingRef.current || placesCursorRef.current === null) return;
    placesFetchingRef.current = true;
    setIsLoadingMorePlaces(true);
    try {
      const page = await fetchUserActivities(user.id, { before: placesCursorRef.current });
      if (!mountedRef.current) return;
      placesCursorRef.current = page.nextCursor;
      setHasMorePlaces(page.nextCursor !== null);
      setPlaces((prev) => {
        const known = new Set(prev.map((item) => item.id));
        return [...prev, ...page.items.map(toPlaceItem).filter((item) => !known.has(item.id))];
      });
    } finally {
      placesFetchingRef.current = false;
      if (mountedRef.current) setIsLoadingMorePlaces(false);
    }
  }, [user.id]);

  const loadMoreWishlist = useCallback(async () => {
    if (wishlistFetchingRef.current || wishlistCursorRef.current === null) return;
    wishlistFetchingRef.current = true;
    setIsLoadingMoreWishlist(true);
    try {
      const page = await fetchWishlistPage(user.id, { before: wishlistCursorRef.current });
      if (!mountedRef.current) return;
      wishlistCursorRef.current = page.nextCursor;
      setHasMoreWishlist(page.nextCursor !== null);
      setWishlist((prev) => {
        const known = new Set(prev.map((item) => item.id));
        return [
          ...prev,
          ...page.items.map(toWishlistItem).filter((item) => !known.has(item.id)),
        ];
      });
    } finally {
      wishlistFetchingRef.current = false;
      if (mountedRef.current) setIsLoadingMoreWishlist(false);
    }
  }, [user.id]);

  if (loading || !userData) {
    return <ProfileSkeleton />;
  }

  return (
    <ProfileView
      user={userData}
      friendsCount={friendsCount}
      places={places}
      wishlist={wishlist}
      hasMorePlaces={hasMorePlaces}
      isLoadingMorePlaces={isLoadingMorePlaces}
      onLoadMorePlaces={loadMorePlaces}
      hasMoreWishlist={hasMoreWishlist}
      isLoadingMoreWishlist={isLoadingMoreWishlist}
      onLoadMoreWishlist={loadMoreWishlist}
    />
  );
}

export default function ProfilePageClient() {
  return (
    <AuthGate
      context="profile"
      headerTitle="Mein Profil"
      titleClassName="text-sm font-bold text-slate-900"
      skeleton={<ProfileSkeleton />}
    >
      {(user) => <ProfileContent user={user} />}
    </AuthGate>
  );
}
