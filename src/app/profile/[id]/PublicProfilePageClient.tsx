"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import PublicProfileView from "@/components/PublicProfileView";
import AuthGate from "@/components/auth/AuthGate";
import { createClient } from "@/lib/supabase/client";
import { getUserColorClass } from "@/lib/auth/placeFormatting";
import { fetchUserActivities, type FeedActivity } from "@/lib/activityFeed";

import { ProfileSkeleton } from "@/components/ui/Skeleton";

type PlaceItem = NonNullable<Parameters<typeof PublicProfileView>[0]["places"]>[number];

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

interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted";
}

function PublicProfileContent({
  friendId,
  inviteToken,
  currentUserId,
}: {
  friendId: string;
  inviteToken: string | null;
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [friendData, setFriendData] = useState<Parameters<
    typeof PublicProfileView
  >[0]["friend"] | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [hasMorePlaces, setHasMorePlaces] = useState(false);
  const [isLoadingMorePlaces, setIsLoadingMorePlaces] = useState(false);
  const placesCursorRef = useRef<string | null>(null);
  const placesFetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [friendship, setFriendship] = useState<Friendship | null>(null);

  useEffect(() => {
    if (currentUserId === friendId) {
      router.replace("/profile");
    }
  }, [currentUserId, friendId, router]);

  useEffect(() => {
    if (currentUserId === friendId) return;

    let mounted = true;
    mountedRef.current = true;

    async function load() {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", friendId)
        .single();

      if (!mounted) return;

      if (error || !profile) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Independent of each other, so they go out together instead of in four
      // sequential round trips. Only the first page of recommendations is read;
      // the rest follows on scroll.
      const [{ count }, firstPage, { data: wishlistData }, { data: friendshipsData }] =
        await Promise.all([
          supabase
            .from("friendships")
            .select("*", { count: "exact", head: true })
            .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
            .eq("status", "accepted"),
          fetchUserActivities(friendId),
          supabase.from("wishlist").select("activity_id").eq("user_id", currentUserId),
          supabase
            .from("friendships")
            .select("id, sender_id, receiver_id, status")
            .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`),
        ]);

      const matchedFriendship =
        (friendshipsData || []).find(
          (f) => f.sender_id === friendId || f.receiver_id === friendId
        ) || null;

      const name = profile.full_name ?? profile.username ?? "Freund*in";
      const initials =
        name
          .split(" ")
          .map((n: string) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || "?";

      if (!mounted) return;

      setFriendData({
        id: profile.id,
        name,
        username: profile.username,
        initials,
        color: getUserColorClass(profile.id),
        avatarUrl: profile.avatar_url ?? null,
      });
      setFriendsCount(count ?? 0);
      placesCursorRef.current = firstPage.nextCursor;
      setPlaces(firstPage.items.map(toPlaceItem));
      setHasMorePlaces(firstPage.nextCursor !== null);
      setWishlistedIds((wishlistData || []).map((w) => w.activity_id));
      setFriendship(matchedFriendship as Friendship | null);
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
      mountedRef.current = false;
    };
  }, [supabase, friendId, currentUserId]);

  const loadMorePlaces = useCallback(async () => {
    if (placesFetchingRef.current || placesCursorRef.current === null) return;
    placesFetchingRef.current = true;
    setIsLoadingMorePlaces(true);
    try {
      const page = await fetchUserActivities(friendId, { before: placesCursorRef.current });
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
  }, [friendId]);

  if (currentUserId === friendId) {
    return <ProfileSkeleton />;
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (notFound || !friendData) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold text-slate-900">Profil nicht gefunden</p>
        <p className="mt-2 text-xs text-slate-500">
          Dieses Profil existiert nicht oder ist nicht mehr verfügbar.
        </p>
      </div>
    );
  }

  return (
    <PublicProfileView
      friend={friendData}
      friendsCount={friendsCount}
      places={places}
      initialWishlistedIds={wishlistedIds}
      initialFriendship={friendship}
      currentUserId={currentUserId}
      inviteToken={inviteToken}
      hasMorePlaces={hasMorePlaces}
      isLoadingMorePlaces={isLoadingMorePlaces}
      onLoadMorePlaces={loadMorePlaces}
    />
  );
}

export default function PublicProfilePageClient({
  friendId,
  inviteToken,
}: {
  friendId: string;
  inviteToken: string | null;
}) {
  return (
    <AuthGate 
      context="profile" 
      headerTitle="Profil"
      skeleton={<ProfileSkeleton />}
    >
      {(user: User) => (
        <PublicProfileContent
          friendId={friendId}
          inviteToken={inviteToken}
          currentUserId={user.id}
        />
      )}
    </AuthGate>
  );
}
