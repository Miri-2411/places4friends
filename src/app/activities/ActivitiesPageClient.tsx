"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ActivitiesView from "@/components/ActivitiesView";
import AuthGate from "@/components/auth/AuthGate";
import { createClient } from "@/lib/supabase/client";
import {
  FEED_PAGE_SIZE,
  fetchActivitiesFeed,
  type FeedActivity,
} from "@/lib/activityFeed";

import { ActivitiesSkeleton } from "@/components/ui/Skeleton";

/**
 * The feed loads one page at a time and asks for the next only when the reader
 * scrolls to the bottom of the current one (see ActivitiesView's sentinel).
 *
 * It used to read every activity of every friend, plus every comment and
 * wishlist row belonging to them, on every mount — and again from scratch on
 * every realtime event. Both are now bounded: a realtime change re-reads only
 * the first page and merges it in, leaving the pages already scrolled past
 * alone.
 */
function ActivitiesContent({ user }: { user: User }) {
  const supabase = createClient();
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<string | null>(null);
  // Handed back to each follow-up page so scrolling does not re-read the
  // friendship table once per page.
  const friendIdsRef = useRef<string[] | undefined>(undefined);
  const isMountedRef = useRef(true);
  // One in-flight page at a time: the sentinel can fire again before the
  // previous request resolves.
  const isFetchingRef = useRef(false);

  const loadFirstPage = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const page = await fetchActivitiesFeed(user.id);
      if (!isMountedRef.current) return;
      friendIdsRef.current = page.friendIds;
      cursorRef.current = page.nextCursor;
      setHasMore(page.nextCursor !== null);
      setWishlistedIds(page.wishlistedIds);
      // Replace the first page in place rather than the whole list, so a
      // realtime refresh keeps the deeper pages the reader already scrolled
      // through. Everything the fresh page covers is dropped from those pages —
      // by id for rows that moved, and by cursor so a deleted row inside the
      // first page's range disappears too.
      setActivities((prev) => {
        const firstPageIds = new Set(page.items.map((item) => item.id));
        const boundary = page.nextCursor;
        const kept = prev.filter(
          (item) =>
            !firstPageIds.has(item.id) && boundary !== null && item.createdAt < boundary
        );
        return [...page.items, ...kept];
      });
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) setLoading(false);
    }
  }, [user.id]);

  const loadNextPage = useCallback(async () => {
    if (isFetchingRef.current || cursorRef.current === null) return;
    isFetchingRef.current = true;
    setIsLoadingMore(true);
    try {
      const page = await fetchActivitiesFeed(user.id, {
        before: cursorRef.current,
        friendIds: friendIdsRef.current,
      });
      if (!isMountedRef.current) return;
      cursorRef.current = page.nextCursor;
      setHasMore(page.nextCursor !== null);
      setActivities((prev) => {
        const known = new Set(prev.map((item) => item.id));
        return [...prev, ...page.items.filter((item) => !known.has(item.id))];
      });
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) setIsLoadingMore(false);
    }
  }, [user.id]);

  useEffect(() => {
    isMountedRef.current = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    // One write can raise several events, and a friend posting wakes every
    // reader at once. Coalesce a burst into a single refresh instead of one
    // round trip — and one set of image downloads — per event.
    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        void loadFirstPage();
      }, 400);
    };

    async function load() {
      await loadFirstPage();
      if (!isMountedRef.current) return;

      // The channel name carries a random suffix. Supabase returns the *same*
      // channel object for a name that is already subscribed, and adding a
      // `postgres_changes` callback to it then throws — which is exactly what a
      // Fast Refresh or React's double-invoked effect produces, because the
      // previous channel is still being torn down when this one is created.
      const suffix = Math.random().toString(36).slice(2);
      channel = supabase
        .channel(`activities-feed:${suffix}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "activities" },
          scheduleRefresh
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "friendships" },
          scheduleRefresh
        )
        .subscribe();
    }

    void load();
    return () => {
      isMountedRef.current = false;
      if (refreshTimer) clearTimeout(refreshTimer);
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [loadFirstPage, supabase, user.id]);

  if (loading) {
    return <ActivitiesSkeleton />;
  }

  return (
    <ActivitiesView
      activities={activities}
      initialWishlistedIds={wishlistedIds}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadNextPage}
      pageSize={FEED_PAGE_SIZE}
    />
  );
}

export default function ActivitiesPageClient() {
  return (
    <AuthGate
      context="activities"
      headerTitle="Aktivitäten"
      skeleton={<ActivitiesSkeleton />}
    >
      {(user) => <ActivitiesContent user={user} />}
    </AuthGate>
  );
}
