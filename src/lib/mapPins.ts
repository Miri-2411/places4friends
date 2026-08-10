"use client";

import { createClient } from "@/lib/supabase/client";
import { getAvatarUrl } from "@/lib/avatar";
import {
  MAP_PIN_LIMIT,
  getUserColorClass,
  profileDisplayName,
  profileInitials,
} from "@/lib/mapNetwork";
import type { MapBounds, MapPlacePin } from "@/lib/mapPlaces";

/**
 * The map reads its pins **once per session, not once per viewport**.
 *
 * Panning, zooming, every filter chip and the friend selector used to be a
 * request each — one round trip per gesture, for a set of pins that fits in
 * memory many times over. This fetches everything the viewer is allowed to see
 * in a single query and lets the component answer all of that from what it
 * already holds.
 *
 * It asks for one row past the cap on purpose: getting it back means this
 * network has outgrown the approach, and the caller falls back to the
 * per-viewport path (`/api/map/pins`) for the rest of the session.
 */
export interface NetworkPin extends MapPlacePin {
  categories: string[];
}

export interface NetworkPinsResult {
  pins: NetworkPin[];
  /** `true` when the network exceeds MAP_PIN_LIMIT and this set is incomplete. */
  truncated: boolean;
}

interface PinRow {
  id: string;
  user_id: string;
  place_name: string;
  latitude: number | null;
  longitude: number | null;
  is_superlike: boolean;
  categories: string[] | null;
  author: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export async function fetchNetworkPins(
  allowedUserIds: string[]
): Promise<NetworkPinsResult> {
  if (allowedUserIds.length === 0) return { pins: [], truncated: false };

  const supabase = createClient();
  // The author profile is embedded through `activities_user_id_profiles_fkey`
  // instead of being resolved in a follow-up `profiles` query.
  const { data, error } = await supabase
    .from("activities")
    .select(
      "id, user_id, place_name, latitude, longitude, is_superlike, categories, author:profiles!activities_user_id_profiles_fkey(id, username, full_name, avatar_url)"
    )
    .in("user_id", allowedUserIds)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .limit(MAP_PIN_LIMIT + 1);

  if (error) throw error;

  const rows = (data ?? []) as unknown as PinRow[];
  const truncated = rows.length > MAP_PIN_LIMIT;

  const pins = rows
    .slice(0, MAP_PIN_LIMIT)
    .filter(
      (row): row is PinRow & { latitude: number; longitude: number } =>
        row.latitude !== null && row.longitude !== null
    )
    .map((row) => {
      const name = profileDisplayName(row.author);
      return {
        id: row.id,
        userId: row.user_id,
        userName: name,
        userInitials: profileInitials(name),
        userColor: getUserColorClass(row.user_id),
        userAvatarUrl: getAvatarUrl(row.author?.avatar_url),
        name: row.place_name,
        latitude: row.latitude,
        longitude: row.longitude,
        isMustSee: row.is_superlike,
        categories: Array.isArray(row.categories) ? row.categories : [],
      };
    });

  return { pins, truncated };
}

/** Every category that appears on a pin, for the filter panel. */
export function collectCategories(pins: NetworkPin[]): string[] {
  const seen = new Set<string>();
  pins.forEach((pin) => pin.categories.forEach((category) => seen.add(category)));
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

/** How many recommendations each person in the network has, for the chip row. */
export function countPinsByUser(pins: NetworkPin[]): Record<string, number> {
  const counts: Record<string, number> = {};
  pins.forEach((pin) => {
    counts[pin.userId] = (counts[pin.userId] ?? 0) + 1;
  });
  return counts;
}

/** Drops pins outside the drawn area, so panning does not grow the DOM. */
export function pinsWithinBounds<T extends { latitude: number; longitude: number }>(
  pins: T[],
  bounds: MapBounds
): T[] {
  return pins.filter(
    (pin) =>
      pin.latitude >= bounds.south &&
      pin.latitude <= bounds.north &&
      pin.longitude >= bounds.west &&
      pin.longitude <= bounds.east
  );
}
