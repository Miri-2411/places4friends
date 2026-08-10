"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `onLoadMore` when a sentinel element scrolls near the viewport.
 *
 * This is the web counterpart of the app's `onEndReached`: a list asks the
 * server for the next page only once the reader has actually worked their way
 * down to it, instead of fetching everything a friend has ever posted (plus
 * every image on it) the moment a tab opens.
 *
 * `rootMargin` gives the request a head start so the next page is usually there
 * before the spinner would be seen.
 *
 * Returns a ref to attach to an element rendered *after* the last item. Render
 * that element only while `hasMore` is true, so the observer disconnects itself
 * once the list is exhausted.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "400px",
}: {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}) {
  const sentinelRef = useRef<T | null>(null);
  // Read through a ref so a new callback identity each render does not tear the
  // observer down and set it up again.
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const canLoad = hasMore && !isLoading;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoad) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoad, rootMargin]);

  return sentinelRef;
}
