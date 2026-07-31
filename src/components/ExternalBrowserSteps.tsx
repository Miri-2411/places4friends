/**
 * Illustrated hint for in-app browsers: how to reopen the page in the real
 * browser. The mockups are drawn inline so the page stays self-contained.
 */

function MenuButtonMockup() {
  return (
    <svg viewBox="0 0 200 64" className="h-auto w-full" role="img" aria-label="Menü oben rechts">
      <rect x="1" y="1" width="198" height="62" rx="10" className="fill-white stroke-slate-200" />
      <rect x="14" y="24" width="120" height="16" rx="8" className="fill-slate-100" />
      <rect x="22" y="30" width="72" height="4" rx="2" className="fill-slate-300" />
      <circle cx="168" cy="32" r="17" className="fill-brand-green-100" />
      <circle cx="168" cy="25" r="2.2" className="fill-brand-green-700" />
      <circle cx="168" cy="32" r="2.2" className="fill-brand-green-700" />
      <circle cx="168" cy="39" r="2.2" className="fill-brand-green-700" />
    </svg>
  );
}

function MenuEntryMockup() {
  return (
    <svg
      viewBox="0 0 200 88"
      className="h-auto w-full"
      role="img"
      aria-label="Menüeintrag In externen Browser öffnen"
    >
      <rect x="1" y="1" width="198" height="86" rx="10" className="fill-white stroke-slate-200" />
      <rect x="12" y="12" width="90" height="5" rx="2.5" className="fill-slate-200" />
      <rect x="12" y="28" width="70" height="5" rx="2.5" className="fill-slate-200" />
      <rect x="8" y="46" width="184" height="30" rx="8" className="fill-brand-green-100" />
      <g className="stroke-brand-green-700" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M22 57.5v9a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-3" />
        <path d="M29.5 56h5.5v5.5" />
        <path d="M35 56l-7 7" />
      </g>
      <text
        x="44"
        y="65"
        className="fill-brand-green-700"
        fontSize="10"
        fontWeight="700"
        fontFamily="inherit"
      >
        In externen Browser öffnen
      </text>
    </svg>
  );
}

const STEPS = [
  {
    label: "Oben rechts auf die drei Punkte tippen",
    illustration: <MenuButtonMockup />,
  },
  {
    label: '"In externen Browser öffnen" wählen',
    illustration: <MenuEntryMockup />,
  },
];

export default function ExternalBrowserSteps() {
  return (
    <div className="mt-8 w-full max-w-[300px] rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left">
      <p className="text-[11px] font-bold text-slate-700">
        Der Store öffnet nicht? Du bist im Browser von Instagram und Co.
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        Öffne diese Seite im richtigen Browser, dann klappt es:
      </p>

      <ol className="mt-4 space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.label} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green-700 text-[10px] font-bold text-white">
                {index + 1}
              </span>
              <span className="text-[11px] font-semibold leading-snug text-slate-600">
                {step.label}
              </span>
            </div>
            <div className="overflow-hidden rounded-xl">{step.illustration}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
