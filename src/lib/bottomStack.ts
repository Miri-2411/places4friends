"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * Shared layout for the floating cards above the bottom navigation.
 * Each layer reports its rendered height, so the layers above it can lift
 * themselves out of the way. Order is bottom to top.
 */
export const BOTTOM_STACK_LAYERS = ["appPromo", "storageNotice", "loginPrompt"] as const;

export type BottomStackLayer = (typeof BOTTOM_STACK_LAYERS)[number];

/** Gap between two stacked cards (px). */
export const BOTTOM_STACK_GAP_PX = 8;

/** Distance between the bottom nav and the lowest card. */
export const BOTTOM_STACK_BASE_OFFSET = "calc(64px + 8px + env(safe-area-inset-bottom))";

const heights: Record<BottomStackLayer, number> = {
  appPromo: 0,
  storageNotice: 0,
  loginPrompt: 0,
};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getOffset(layer: BottomStackLayer): number {
  let offset = 0;
  for (const current of BOTTOM_STACK_LAYERS) {
    if (current === layer) break;
    if (heights[current] > 0) {
      offset += heights[current] + BOTTOM_STACK_GAP_PX;
    }
  }
  return offset;
}

function setHeight(layer: BottomStackLayer, height: number) {
  if (heights[layer] === height) return;
  heights[layer] = height;
  listeners.forEach((listener) => listener());
}

/** Offset in px that a layer has to keep free below itself. */
export function useBottomStackOffset(layer: BottomStackLayer): number {
  return useSyncExternalStore(
    subscribe,
    () => getOffset(layer),
    () => 0
  );
}

/**
 * Ref callback that keeps the stack in sync with a layer's rendered height.
 * Pass `visible: false` (or leave the element unmounted) to release the space.
 */
export function useBottomStackLayer(layer: BottomStackLayer, visible: boolean) {
  const observerRef = useRef<ResizeObserver | null>(null);

  return useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || !visible) {
        setHeight(layer, 0);
        return;
      }

      setHeight(layer, node.offsetHeight);
      const observer = new ResizeObserver(() => setHeight(layer, node.offsetHeight));
      observer.observe(node);
      observerRef.current = observer;
    },
    [layer, visible]
  );
}
