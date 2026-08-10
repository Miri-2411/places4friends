"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type HintPlacement = "bottom-nav" | "top-right";

type StepDefinition = {
  id: string;
  title: string;
  description: string;
  bullets?: string[];
  action?: {
    label: string;
    href: string;
  };
  hint?: {
    text: string;
    placement: HintPlacement;
  };
};

const STEPS: StepDefinition[] = [
  {
    id: "welcome",
    title: "Willkommen bei places4friends",
    description:
      "Hier kannst du besondere Orte mit deinen Freund*innen teilen und ihre Empfehlungen erkunden. Auf einer gemeinsamen Karte behaltet ihr alle Orte im Überblick.",
  },
  
  {
    id: "map",
    title: "Die Karte verstehen",
    description:
      "Die Karte ist dein Radar. Filtere Empfehlungen, entdecke Highlights und öffne Details direkt am Pin.",
    bullets: [
      "Filtere nach Kategorien oder Freund*innen.",
      "Springe direkt zu deinem Standort.",
      "Klicke auf Pins, um Details und Kommentare zu sehen.",
    ],
    hint: {
      text: "Filter und Ebenen findest du oben in der Karte.",
      placement: "top-right",
    },
  },
  {
    id: "activities",
    title: "Aktivitäten verstehen",
    description:
      "Hier siehst du die neusten Empfehlungen deiner Freund*innen.",
    bullets: [
      "Klicke auf das Bookmark Symbol, um die Aktivität deiner Wishlist hinzuzufügen.",
      "Klicke auf das Kommentar Symbol, um einen Kommentar zu hinterlassen.",
      "Klicke auf das Navigations Button, um die Route zu öffnen.",
    ],
  },
  {
    id: "recommendations",
    title: "Empfehlungen abgeben",
    description:
      "Hier kannst du neue Empfehlungen hinzufügen.",
    bullets: [
      "Drücke auf die Karte, um einen Pin zu setzen.",
      "Alternativ kannst du auch in der Suchleiste nach einem Ort suchen und diesen auswählen.",
      "Füge dann weitere Details zu deiner Empfehlung hinzu.",
      "Füge bis zu 3 Bilder hinzu, um die besten Eindrücke zu teilen.",
      "Mit Klick auf Speichern erscheint deine Empfehlung in Karten.",
    ],
  },
  {
    id: "friends",
    title: "Freund*innen hinzufügen",
    description:
      "Folge Freund*innen, damit ihre Empfehlungen auf deiner Karte und im Aktivitäten-Feed auftauchen.",
    bullets: [
      "Suche nach Namen oder Benutzernamen.",
      "Freundschaftsanfragen findest du im Friends-Tab.",
      "Teile einen Einladungslink, um dich direkt mit Freund*innen zu verbinden.",
    ],
  },
  {
    id: "profile",
    title: "Profil bearbeiten",
    description:
      "Hier kannst du deine Daten verwalten und deine Empfehlungen verwalten.",
    bullets: [
      "Im Menü rechts oben kannst du unter Einstellungen deine Profil bearbeiten.",
      "Bei Meinen Empfehlungen kannst du deine Empfehlungen bearbeiten oder löschen.",
      "Unter Wishlist siehst du deine vorgemerkten Empfehlungen.",
      "Setze ein Profilbild, damit Freund*innen dich leichter erkennen können.",
    ],
  },
];

type Step = StepDefinition;

export default function OnboardingOverlay() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const storageKey = useMemo(() => {
    return userId ? `p4f_onboarding_step_${userId}` : "p4f_onboarding_step";
  }, [userId]);

  const activeStep: Step = STEPS[stepIndex] ?? STEPS[0];

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!active) return;
      if (userError || !data.user) {
        setIsVisible(false);
        setIsReady(true);
        setUserId(null);
        return;
      }

      const activeFlag = globalThis.localStorage?.getItem("p4f_onboarding_active") === "true";
      setUserId(data.user.id);
      setIsVisible(activeFlag);
      setIsReady(true);
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  // Reactively check active onboarding flag on route changes
  useEffect(() => {
    if (!userId) return;
    const activeFlag = globalThis.localStorage?.getItem("p4f_onboarding_active") === "true";
    setIsVisible(activeFlag);
  }, [pathname, userId]);

  useEffect(() => {
    if (!isVisible || !isReady) return;
    const raw = globalThis.localStorage?.getItem(storageKey);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed < STEPS.length) {
      setStepIndex(parsed);
    }
  }, [isReady, isVisible, storageKey]);

  useEffect(() => {
    if (!isVisible || !isReady) return;
    globalThis.localStorage?.setItem(storageKey, String(stepIndex));
  }, [isReady, isVisible, stepIndex, storageKey]);

  if (!isReady || !isVisible) {
    return null;
  }

  const getHintPosition = (placement?: HintPlacement) => {
    if (placement === "bottom-nav") {
      return "bottom-20 left-1/2 -translate-x-1/2";
    }
    if (placement === "top-right") {
      return "top-24 right-6";
    }
    return "bottom-20 left-1/2 -translate-x-1/2";
  };

  const completeOnboarding = () => {
    globalThis.localStorage?.removeItem("p4f_onboarding_active");
    globalThis.localStorage?.removeItem(storageKey);
    setIsVisible(false);
  };

  const handleNext = () => {
    if (stepIndex >= STEPS.length - 1) {
      completeOnboarding();
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleAction = () => {
    if (!activeStep.action) return;
    router.push(activeStep.action.href);
  };

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {activeStep.hint && (
        <div
          className={`fixed ${getHintPosition(activeStep.hint.placement)} pointer-events-none`}
        >
          <div className="relative rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
            {activeStep.hint.text}
            <span className="absolute -bottom-2 left-6 h-4 w-4 rotate-45 rounded-[3px] bg-white shadow-[6px_6px_14px_rgba(15,23,42,0.12)]" />
          </div>
        </div>
      )}

      <div className="fixed right-4 top-20 w-[320px] max-w-[86vw] pointer-events-auto sm:right-8 sm:top-24">
        <div className="rounded-3xl border border-slate-200/80 bg-white/98 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>
            Schritt {stepIndex + 1} von {STEPS.length}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
            disabled={isUpdating}
          >
            Überspringen
          </button>
        </div>

        <h2 className="mt-3 text-xl font-bold text-slate-900">{activeStep.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{activeStep.description}</p>

        {activeStep.bullets && (
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {activeStep.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-green-600" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {activeStep.action && (
          <button
            type="button"
            onClick={handleAction}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-brand-green-200 bg-brand-green-50 px-4 py-3 text-sm font-semibold text-brand-green-700 transition hover:bg-brand-green-100"
          >
            {activeStep.action.label}
          </button>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={stepIndex === 0 || isUpdating}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Zurück
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isUpdating}
            className="flex-1 rounded-xl bg-brand-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {stepIndex >= STEPS.length - 1 ? "Los geht's" : "Weiter"}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
