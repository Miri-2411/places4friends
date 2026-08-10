"use client";

import React, { useState } from "react";
import { activityThumbUrl } from "@/lib/activityImages";

/**
 * A recommendation photo as it appears in a card, a grid or a strip — never
 * full screen.
 *
 * Two things keep it off the network until it is actually needed: it requests
 * the small derivative instead of the stored full-size URL (see
 * [activityImages.ts](src/lib/activityImages.ts)), and it is `loading="lazy"`,
 * so a photo eight cards down the feed is not fetched before the user scrolls
 * to it.
 *
 * Not every image has a derivative — the website uploads only the original, and
 * posts predating them have none either — so a missing one is expected rather
 * than an error: the request 404s and we fall back to what we were given.
 *
 * Pass the **full-size** URL. Whatever opens a lightbox has to keep passing that
 * one too, or the enlarged view would show the small copy.
 */
export default function ActivityPhoto({
  url,
  alt,
  className = "",
  eager = false,
}: {
  url: string;
  alt: string;
  className?: string;
  /** Set on an above-the-fold hero image, where lazy loading only adds delay. */
  eager?: boolean;
}) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const thumb = activityThumbUrl(url);
  const src = thumb && !thumbFailed ? thumb : url;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setThumbFailed(true)}
    />
  );
}
