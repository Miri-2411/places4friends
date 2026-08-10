import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 py-16 text-center page-transition">
      {/* Icon with a pulse animation */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-green-100 to-brand-green-200 text-brand-green-700 mb-6 shadow-sm shadow-brand-green-500/10">
        <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: "10s" }} />
      </div>

      <h1 className="text-xl font-bold text-slate-900">404 - Wegbeschreibung verloren</h1>
      
      <p className="mt-3 text-sm text-slate-500 max-w-[280px] leading-relaxed">
        Dieser Ort existiert nicht - wahrscheinlich haben deine Freund*innen ihn vor dir versteckt, um die besten Plätze für sich zu behalten.
      </p>

      {/* Action Button */}
      <div className="mt-8 w-full max-w-[240px]">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-green-900/10 transition-all hover:bg-brand-green-800 active:scale-[0.98]"
        >
          <Home className="h-4 w-4" />
          Zurück zur Karte
        </Link>
      </div>
    </div>
  );
}
