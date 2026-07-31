"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { AppleIcon, GooglePlayIcon } from "@/components/icons/StoreIcons";
import {
  BOTTOM_STACK_BASE_OFFSET,
  useBottomStackLayer,
  useBottomStackOffset,
} from "@/lib/bottomStack";

export const APP_PROMO_DISMISSED_KEY = "p4f_app_promo_dismissed";

const IOS_WEB_URL = "https://apps.apple.com/de/app/places4friends/id6785068552";
const ANDROID_WEB_URL = "https://play.google.com/store/apps/details?id=com.janickbraun.places4friends";
const ANDROID_NATIVE_URL = "market://details?id=com.janickbraun.places4friends";

/** Time we give the Play Store app to take over before falling back to the web link. */
const NATIVE_FALLBACK_MS = 900;

/** Legal pages stay free of the promo. */
const HIDDEN_PATHS = ["/impressum", "/datenschutz", "/agb"];

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  // iPadOS 13+ reports a desktop Safari UA, so check for touch support as well.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  return "other";
}

export default function AppPromoModal() {
  const [dismissed, setDismissed] = useState(true);
  const [platform, setPlatform] = useState<Platform>("other");
  const pathname = usePathname();

  const isHiddenPath = HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const visible = !dismissed && !isHiddenPath;

  const stackRef = useBottomStackLayer("appPromo", visible);
  const stackOffsetPx = useBottomStackOffset("appPromo");

  useEffect(() => {
    setPlatform(detectPlatform());
    try {
      if (!globalThis.localStorage?.getItem(APP_PROMO_DISMISSED_KEY)) {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      globalThis.localStorage?.setItem(APP_PROMO_DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
    setDismissed(true);
  }, []);

  /**
   * On Android we first try the native market:// scheme so the Play Store app
   * opens directly, and fall back to the web link if nothing took over.
   * The App Store button is a plain link.
   */
  const openPlayStore = (event: MouseEvent<HTMLAnchorElement>) => {
    if (platform !== "android") return;

    event.preventDefault();

    let fallbackTimer = 0;
    const cancelFallback = () => window.clearTimeout(fallbackTimer);

    fallbackTimer = window.setTimeout(() => {
      window.removeEventListener("pagehide", cancelFallback);
      if (document.visibilityState === "visible") {
        window.location.href = ANDROID_WEB_URL;
      }
    }, NATIVE_FALLBACK_MS);

    window.addEventListener("pagehide", cancelFallback, { once: true });
    window.location.href = ANDROID_NATIVE_URL;
  };

  if (!visible) return null;

  // Android devices get Google Play as the primary action, everyone else Apple.
  const primaryTarget: "ios" | "android" = platform === "android" ? "android" : "ios";
  const buttonBase =
    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]";
  const primaryButton = "bg-brand-green-700 hover:bg-brand-green-800 text-white";
  const secondaryButton = "border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white";

  return (
    <div
      ref={stackRef}
      role="dialog"
      aria-labelledby="app-promo-title"
      className="absolute left-4 right-4 z-[85] flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300"
      style={{
        bottom:
          stackOffsetPx > 0
            ? `calc(${BOTTOM_STACK_BASE_OFFSET} + ${stackOffsetPx}px)`
            : BOTTOM_STACK_BASE_OFFSET,
      }}
    >
      <div className="flex items-start gap-3">
        <img
          src="/logo-round.png"
          alt="places4friends"
          className="h-10 w-10 shrink-0 rounded-xl"
        />
        <div className="flex-1">
          <h3 id="app-promo-title" className="text-sm font-bold text-slate-900">
            places4friends gibt es als App
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Die App ist deutlich schneller und für dein Handy gemacht. Kostenlos laden - deine Orte
            und Freunde sind sofort da.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          aria-label="Hinweis schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <a
          href={IOS_WEB_URL}
          target={platform === "ios" ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={`${buttonBase} ${primaryTarget === "ios" ? primaryButton : secondaryButton}`}
        >
          <AppleIcon className="h-4 w-4" />
          App Store
        </a>
        <a
          href={ANDROID_WEB_URL}
          onClick={openPlayStore}
          target={platform === "android" ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={`${buttonBase} ${primaryTarget === "android" ? primaryButton : secondaryButton}`}
        >
          <GooglePlayIcon className="h-4 w-4" />
          Google Play
        </a>
      </div>
    </div>
  );
}
