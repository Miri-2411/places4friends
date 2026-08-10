import type { MapProfileInfo } from "@/lib/mapNetwork";

export interface MapPlacePin {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  userColor: string;
  userAvatarUrl: string | null;
  name: string;
  latitude: number;
  longitude: number;
  isMustSee: boolean;
}

export interface MapPlaceDetails {
  review: string;
  categories: string[];
  imageUrls: string[];
  createdAt: string;
}

export type MapPlace = MapPlacePin & MapPlaceDetails;

export interface MapOverviewPin {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  isMustSee: boolean;
  categories: string[];
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function emptyMapPlaceDetails(): MapPlaceDetails {
  return {
    review: "",
    categories: [],
    imageUrls: [],
    createdAt: "",
  };
}

export function mergeMapPlace(pin: MapPlacePin, details?: Partial<MapPlaceDetails>): MapPlace {
  const base = emptyMapPlaceDetails();
  return {
    ...pin,
    ...base,
    ...details,
  };
}

export function activityRowToPin(
  activity: {
    id: string;
    user_id: string;
    place_name: string;
    latitude: number;
    longitude: number;
    is_superlike: boolean;
  },
  profile: MapProfileInfo
): MapPlacePin {
  return {
    id: activity.id,
    userId: activity.user_id,
    userName: profile.name,
    userInitials: profile.initials,
    userColor: profile.color,
    userAvatarUrl: profile.avatarUrl,
    name: activity.place_name,
    latitude: activity.latitude,
    longitude: activity.longitude,
    isMustSee: activity.is_superlike,
  };
}

export function activityRowToDetails(activity: {
  description?: string | null;
  categories?: string[] | null;
  image_urls?: string[] | null;
  created_at: string;
}): MapPlaceDetails {
  return {
    review: activity.description || "",
    categories: Array.isArray(activity.categories) ? activity.categories : [],
    imageUrls: Array.isArray(activity.image_urls) ? activity.image_urls : [],
    createdAt: activity.created_at,
  };
}

/** Expands bounds slightly so panning does not immediately drop edge pins. */
export function expandMapBounds(bounds: MapBounds, paddingRatio = 0.25): MapBounds {
  const latSpan = bounds.north - bounds.south;
  const lngSpan = bounds.east - bounds.west;

  const centerLat = (bounds.north + bounds.south) / 2;
  const cosLat = Math.cos((centerLat * Math.PI) / 180);
  const cosLatSafe = Math.max(0.2, Math.abs(cosLat));

  // Ensure at least 8 km of buffer outside the viewport in all directions
  const minLatPad = 8 / 111.32;
  const minLngPad = 8 / (111.32 * cosLatSafe);

  const latPad = Math.max(latSpan * paddingRatio, minLatPad);
  const lngPad = Math.max(lngSpan * paddingRatio, minLngPad);

  return {
    north: Math.min(90, bounds.north + latPad),
    south: Math.max(-90, bounds.south - latPad),
    east: bounds.east + lngPad,
    west: bounds.west - lngPad,
  };
}

/**
 * Applies the map's three filters in memory.
 *
 * Generic over the pin, because the same filters run over the overview pins and
 * over the fully populated network pins the map draws — the filtering used to
 * be a query parameter, so every chip tap cost a request.
 */
export function filterOverviewPins<
  T extends { userId: string; isMustSee: boolean; categories: string[] },
>(
  pins: T[],
  options: {
    userId?: string | null;
    mustSee?: boolean;
    categories?: string[];
  }
): T[] {
  let next = pins;

  if (options.userId) {
    next = next.filter((pin) => pin.userId === options.userId);
  }

  if (options.mustSee) {
    next = next.filter((pin) => pin.isMustSee);
  }

  if (options.categories && options.categories.length > 0) {
    next = next.filter((pin) =>
      pin.categories.some((category) => options.categories!.includes(category))
    );
  }

  return next;
}

export function parseMapBounds(searchParams: URLSearchParams): MapBounds | null {
  const north = Number(searchParams.get("north"));
  const south = Number(searchParams.get("south"));
  const east = Number(searchParams.get("east"));
  const west = Number(searchParams.get("west"));

  if (
    [north, south, east, west].some(
      (value) => typeof value !== "number" || Number.isNaN(value)
    )
  ) {
    return null;
  }

  if (north <= south || east <= west) {
    return null;
  }

  return { north, south, east, west };
}
