"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { AppleIcon, GooglePlayIcon } from "@/components/icons/StoreIcons";
import {
  APP_STORE_NATIVE_URL,
  APP_STORE_URL,
  PLAY_STORE_INTENT_URL,
  PLAY_STORE_URL,
  detectPlatform,
  isInAppBrowser,
  openPlayStoreApp,
  type Platform,
} from "@/lib/appStores";

const buttonBase =
  "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98]";
const primaryButton =
  "bg-brand-green-700 text-white shadow-lg shadow-brand-green-900/10 hover:bg-brand-green-800";
const secondaryButton =
  "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50";

/** After this the automatic attempt is treated as failed and the spinner goes. */
const HANDOFF_TIMEOUT_MS = 2500;

export default function DownloadRedirect() {
  // Rendered before detection runs, so the first paint has to work everywhere.
  const [platform, setPlatform] = useState<Platform>("other");
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [detected, setDetected] = useState(false);
  const [handoffPending, setHandoffPending] = useState(false);

  useEffect(() => {
    const currentPlatform = detectPlatform();
    const inApp = isInAppBrowser();
    setPlatform(currentPlatform);
    setInAppBrowser(inApp);
    setDetected(true);

    if (currentPlatform !== "other") {
      setHandoffPending(true);
      window.setTimeout(() => setHandoffPending(false), HANDOFF_TIMEOUT_MS);
    }

    // The automatic attempt covers regular browsers. In-app browsers usually
    // swallow it, which is why the buttons below stay on screen: a real tap on
    // an anchor is handed to the OS far more reliably than a scripted redirect.
    if (currentPlatform === "ios") {
      window.location.href = APP_STORE_NATIVE_URL;
      return;
    }
    if (currentPlatform === "android") {
      return openPlayStoreApp(inApp);
    }
  }, []);

  /** Keeps the Play Store fallback chain intact when the button is tapped. */
  const handlePlayStoreClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (platform !== "android") return;
    event.preventDefault();
    openPlayStoreApp(inAppBrowser);
  };

  const isIos = detected && platform === "ios";
  const isAndroid = detected && platform === "android";
  const showBoth = !isIos && !isAndroid;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16 text-center page-transition">
      <img
        src="/logo-round.png"
        alt="places4friends"
        className="h-20 w-20 rounded-3xl shadow-lg shadow-slate-900/5"
      />

      <h1 className="mt-6 text-xl font-bold text-slate-900">places4friends laden</h1>
      <p className="mt-2 max-w-[300px] text-xs leading-relaxed text-slate-500">
        {showBoth
          ? "Hol dir die App für dein Handy - deine Orte und Freunde sind sofort da."
          : "Wir öffnen den Store für dich. Falls nichts passiert, tippe auf den Button."}
      </p>

      {!showBoth && handoffPending && (
        <div className="mt-5 flex items-center gap-2 text-[11px] font-medium text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-green-700" />
          Store wird geöffnet
        </div>
      )}

      <div className="mt-8 w-full max-w-[300px] space-y-3">
        {(isIos || showBoth) && (
          <a
            href={isIos ? APP_STORE_NATIVE_URL : APP_STORE_URL}
            className={`${buttonBase} ${isAndroid ? secondaryButton : primaryButton}`}
          >
            <AppleIcon className="h-4 w-4" />
            Im App Store öffnen
          </a>
        )}

        {(isAndroid || showBoth) && (
          <a
            href={isAndroid ? PLAY_STORE_INTENT_URL : PLAY_STORE_URL}
            onClick={handlePlayStoreClick}
            className={`${buttonBase} ${isAndroid ? primaryButton : secondaryButton}`}
          >
            <GooglePlayIcon className="h-4 w-4" />
            Bei Google Play öffnen
          </a>
        )}
      </div>

      {!showBoth && (
        <a
          href={isIos ? APP_STORE_URL : PLAY_STORE_URL}
          className="mt-4 text-[11px] font-semibold text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
        >
          Store-Seite im Browser öffnen
        </a>
      )}

      {inAppBrowser && (
        <div className="mt-8 flex max-w-[300px] items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <p className="text-[11px] leading-relaxed text-slate-500">
            Du bist im integrierten Browser von Instagram und Co. Falls der Store nicht aufgeht,
            öffne diese Seite über das Menü oben rechts im richtigen Browser.
          </p>
        </div>
      )}

      <Link
        href="/"
        className="mt-8 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-600"
      >
        Stattdessen im Web weiter
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
