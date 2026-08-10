"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ActivityDetailView from "@/components/ActivityDetailView";
import AuthGate from "@/components/auth/AuthGate";
import { createClient } from "@/lib/supabase/client";
import { formatTimestamp, getUserColorClass } from "@/lib/auth/placeFormatting";
import { getAvatarUrl } from "@/lib/avatar";

import { ActivityDetailSkeleton } from "@/components/ui/Skeleton";

interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted";
}

function ActivityDetailContent({
  activityId,
  currentUserId,
}: {
  activityId: string;
  currentUserId: string;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [viewProps, setViewProps] = useState<Parameters<typeof ActivityDetailView>[0] | null>(
    null
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      // The author profile is embedded through `activities_user_id_profiles_fkey`
      // rather than resolved in a second request, and `save_count` comes off the
      // row: counting `wishlist` here could never be right, because its RLS only
      // exposes the viewer's own row, so the number was always 0 or 1.
      const { data: act, error: activityError } = await supabase
        .from("activities")
        .select(
          "id, user_id, place_name, place_address, latitude, longitude, is_superlike, description, created_at, categories, image_urls, save_count, author:profiles!activities_user_id_profiles_fkey(id, username, full_name, avatar_url)"
        )
        .eq("id", activityId)
        .single();

      if (!mounted) return;

      if (activityError || !act) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const creatorProfile = act.author as unknown as {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
      } | null;

      const creatorName =
        creatorProfile?.full_name ?? creatorProfile?.username ?? "Freund*in";
      const creatorInitials =
        creatorName
          .split(" ")
          .map((n: string) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || "?";

      const creatorAvatarUrl = getAvatarUrl(creatorProfile?.avatar_url);

      const isOwner = currentUserId === act.user_id;

      // None of these depends on the others, so they go out together instead of
      // one after the next.
      const [friendshipsRes, { data: wishlistData }, { data: commentsData }] =
        await Promise.all([
          isOwner
            ? Promise.resolve({ data: null })
            : supabase
                .from("friendships")
                .select("id, sender_id, receiver_id, status")
                .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`),
          supabase
            .from("wishlist")
            .select("id")
            .eq("user_id", currentUserId)
            .eq("activity_id", activityId)
            .maybeSingle(),
          supabase
            .from("activity_comments")
            .select(
              `
          id,
          activity_id,
          user_id,
          content,
          created_at,
          profiles:profiles!activity_comments_user_id_fkey(id, username, full_name, avatar_url)
        `
            )
            .eq("activity_id", activityId)
            .order("created_at", { ascending: true }),
        ]);

      const initialFriendship =
        ((friendshipsRes.data || []).find(
          (f) => f.sender_id === act.user_id || f.receiver_id === act.user_id
        ) as Friendship | undefined) ?? null;

      type CommentRow = {
        id: string;
        activity_id: string;
        user_id: string;
        content: string;
        created_at: string;
        profiles: {
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
        } | null;
      };

      const mappedComments = ((commentsData || []) as unknown as CommentRow[]).map((row) => {
        const profile = row.profiles;
        const name = profile?.full_name ?? profile?.username ?? "Nutzer";
        const initials =
          name
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "?";
        const avatarUrl = getAvatarUrl(profile?.avatar_url);

        return {
          id: row.id,
          activityId: row.activity_id,
          userId: row.user_id,
          userName: name,
          userInitials: initials,
          userColor: getUserColorClass(row.user_id),
          userAvatarUrl: avatarUrl,
          content: row.content,
          createdAt: row.created_at,
        };
      });

      if (!mounted) return;

      setViewProps({
        activity: {
          id: act.id,
          userId: act.user_id,
          placeName: act.place_name,
          placeAddress: act.place_address || null,
          latitude: act.latitude,
          longitude: act.longitude,
          isMustSee: act.is_superlike,
          description: act.description || "",
          categories: Array.isArray(act.categories) ? act.categories : [],
          imageUrls: Array.isArray(act.image_urls) ? act.image_urls : [],
          timestamp: formatTimestamp(act.created_at),
        },
        creator: {
          id: act.user_id,
          name: creatorName,
          username: creatorProfile?.username ?? "",
          initials: creatorInitials,
          color: getUserColorClass(act.user_id),
          avatarUrl: creatorAvatarUrl,
        },
        initialComments: mappedComments,
        initialWishlisted: !!wishlistData,
        initialSaveCount: act.save_count ?? 0,
        initialFriendship,
        isOwner,
        currentUserId,
      });
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [supabase, activityId, currentUserId]);

  if (loading) {
    return <ActivityDetailSkeleton />;
  }

  if (notFound || !viewProps) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold text-slate-900">Ort nicht gefunden</p>
        <p className="mt-2 text-xs text-slate-500">
          Diese Empfehlung existiert nicht oder ist nicht mehr verfügbar.
        </p>
      </div>
    );
  }

  return <ActivityDetailView {...viewProps} />;
}

export default function ActivityDetailPageClient({
  activityId,
}: {
  activityId: string;
}) {
  return (
    <AuthGate 
      context="activities" 
      headerTitle="Ort Details"
      skeleton={<ActivityDetailSkeleton />}
    >
      {(user: User) => (
        <ActivityDetailContent activityId={activityId} currentUserId={user.id} />
      )}
    </AuthGate>
  );
}
