"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  BOTTOM_STACK_BASE_OFFSET,
  useBottomStackLayer,
  useBottomStackOffset,
} from "@/lib/bottomStack";

export const STORAGE_NOTICE_DISMISSED_KEY = "p4f_storage_notice_dismissed";

export default function StorageNotice() {
  const [visible, setVisible] = useState(false);
  const stackRef = useBottomStackLayer("storageNotice", visible);
  const stackOffsetPx = useBottomStackOffset("storageNotice");

  useEffect(() => {
    try {
      const dismissed = globalThis.localStorage?.getItem(STORAGE_NOTICE_DISMISSED_KEY);
      if (!dismissed) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      globalThis.localStorage?.setItem(STORAGE_NOTICE_DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={stackRef}
      role="dialog"
      aria-label="Hinweis zu Cookies und lokaler Speicherung"
      className="absolute left-4 right-4 z-[90] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl transition-all duration-300"
      style={{
        bottom:
          stackOffsetPx > 0
            ? `calc(${BOTTOM_STACK_BASE_OFFSET} + ${stackOffsetPx}px)`
            : BOTTOM_STACK_BASE_OFFSET,
      }}
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 text-xs leading-relaxed text-slate-600">
          Wir verwenden technisch notwendige Session-Cookies sowie lokale Speicherung für Karte und
          Einführung. Details in der{" "}
          <Link href="/datenschutz" className="font-semibold text-brand-green-700 hover:underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Hinweis schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
