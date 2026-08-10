"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppleIcon, GooglePlayIcon } from "@/components/icons/StoreIcons";
import ExternalBrowserSteps from "@/components/ExternalBrowserSteps";
import LegalFooter from "@/components/LegalFooter";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  detectPlatform,
  isInAppBrowser,
  type Platform,
} from "@/lib/appStores";

const buttonBase =
  "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98]";
const primaryButton =
  "bg-brand-green-700 text-white shadow-lg shadow-brand-green-900/10 hover:bg-brand-green-800";
const secondaryButton =
  "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50";

/**
 * Store hand-off page for bio links. Nothing opens automatically: in-app
 * browsers swallow scripted redirects, so the user taps the store link
 * themselves and gets illustrated instructions for the external browser.
 */
export default function DownloadRedirect() {
  // Rendered before detection runs, so the first paint has to work everywhere.
  const [platform, setPlatform] = useState<Platform>("other");
  const [inAppBrowser, setInAppBrowser] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInAppBrowser(isInAppBrowser());
  }, []);

  // Android gets Google Play as the primary action, everyone else Apple.
  const androidFirst = platform === "android";

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center page-transition">
      <img
        src="/logo-round.png"
        alt="places4friends"
        className="h-20 w-20 rounded-3xl shadow-lg shadow-slate-900/5"
      />

      <h1 className="mt-6 text-xl font-bold text-slate-900">places4friends laden</h1>
      <p className="mt-2 max-w-[300px] text-xs leading-relaxed text-slate-500">
        Hol dir die App für dein Handy - deine Orte und Freund*innen sind sofort da. Wähle deinen Store:
      </p>

      <div className="mt-8 flex w-full max-w-[300px] flex-col gap-3">
        <a
          href={APP_STORE_URL}
          className={`${buttonBase} ${androidFirst ? secondaryButton : primaryButton} ${
            androidFirst ? "order-2" : "order-1"
          }`}
        >
          <AppleIcon className="h-4 w-4" />
          Im App Store laden
        </a>
        <a
          href={PLAY_STORE_URL}
          className={`${buttonBase} ${androidFirst ? primaryButton : secondaryButton} ${
            androidFirst ? "order-1" : "order-2"
          }`}
        >
          <GooglePlayIcon className="h-4 w-4" />
          Bei Google Play laden
        </a>
      </div>

      {inAppBrowser && <ExternalBrowserSteps />}

      <Link
        href="/"
        className="mt-8 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-600"
      >
        Stattdessen im Web weiter
        <ArrowRight className="h-3 w-3" />
      </Link>

      {/* Leaves room for the bottom nav and the storage notice above it. */}
      <div className="w-full pb-24">
        <LegalFooter />
      </div>
    </div>
  );
}
