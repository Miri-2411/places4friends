/** Store links and the client-side detection shared by the promo and /download. */

export const APP_STORE_URL = "https://apps.apple.com/de/app/places4friends/id6785068552";
export const APP_STORE_NATIVE_URL =
  "itms-apps://apps.apple.com/de/app/places4friends/id6785068552";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.janickbraun.places4friends";
export const PLAY_STORE_NATIVE_URL = "market://details?id=com.janickbraun.places4friends";
/**
 * Android in-app browsers cannot resolve market://, but their webview hands
 * intent:// URLs to the system.
 */
export const PLAY_STORE_INTENT_URL =
  "intent://details?id=com.janickbraun.places4friends#Intent;scheme=market;package=com.android.vending;end";

/** Time we give the store app to take over before falling back to the web link. */
export const NATIVE_FALLBACK_MS = 900;

export type Platform = "ios" | "android" | "other";

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  // iPadOS 13+ reports a desktop Safari UA, so check for touch support as well.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  return "other";
}

/**
 * In-app browsers (Instagram, Facebook, TikTok, ...) render pages in their own
 * webview. It swallows target="_blank" and suppresses the universal link
 * handoff that would normally send apps.apple.com to the App Store.
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|TikTok|BytedanceWebview|Snapchat|Twitter|LinkedInApp|Pinterest|Line\//i.test(
    navigator.userAgent
  );
}

/**
 * Opens the Play Store app. In-app browsers get the intent:// URL through a
 * hidden iframe, so a webview that cannot resolve the scheme keeps its error
 * inside the frame instead of replacing the page with an error screen.
 * Returns a cleanup function for the pending fallback.
 */
export function openPlayStoreApp(inAppBrowser: boolean): () => void {
  let frame: HTMLIFrameElement | null = null;

  const cleanUp = () => {
    window.clearTimeout(fallbackTimer);
    frame?.remove();
  };

  const fallbackTimer = window.setTimeout(() => {
    window.removeEventListener("pagehide", cleanUp);
    frame?.remove();
    if (document.visibilityState === "visible") {
      window.location.href = PLAY_STORE_URL;
    }
  }, NATIVE_FALLBACK_MS);

  window.addEventListener("pagehide", cleanUp, { once: true });

  if (inAppBrowser) {
    frame = document.createElement("iframe");
    frame.style.display = "none";
    frame.src = PLAY_STORE_INTENT_URL;
    document.body.appendChild(frame);
  } else {
    window.location.href = PLAY_STORE_NATIVE_URL;
  }

  return cleanUp;
}
