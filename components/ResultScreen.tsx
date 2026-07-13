"use client";

import type { Stats } from "@/lib/useTypingGame";
import { fmtTime } from "./Scoreboard";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-3xl tabular-nums text-ambra">{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ambra-fioca">
        {label}
      </span>
    </div>
  );
}

export default function ResultScreen({
  destination,
  stats,
  onReset,
  onExit,
}: {
  destination: string;
  stats: Stats;
  onReset: () => void;
  onExit: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-8 bg-inchiostro/70 px-6">
      {/* Cartello di arrivo */}
      <div className="bg-blu-fs rounded-lg px-10 py-6 shadow-[0_10px_40px_rgb(0_0_0/0.4)] ring-1 ring-black/20">
        <div className="rounded-md border-2 border-bianco-smalto/90 px-8 py-5 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-bianco-smalto/60">
            capolinea
          </div>
          <div className="mt-1 font-sans text-4xl font-black uppercase tracking-[0.06em] text-bianco-smalto sm:text-5xl">
            {destination}
          </div>
        </div>
      </div>

      {/* Tabellone dei risultati */}
      <div className="bg-tabellone flex gap-10 rounded-md px-10 py-5 shadow-[0_6px_24px_rgb(0_0_0/0.35)] ring-1 ring-black/40">
        <Stat label="Tempo" value={fmtTime(stats.elapsedMs)} />
        <Stat label="WPM" value={String(Math.round(stats.wpm))} />
        <Stat label="Precisione" value={`${Math.round(stats.accuracy)}%`} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="bg-blu-fs rounded-md px-6 py-3 font-sans font-bold uppercase tracking-[0.1em] text-bianco-smalto shadow hover:bg-blu-fs-scuro"
        >
          Rigioca
        </button>
        <button
          onClick={onExit}
          className="rounded-md bg-bianco-smalto/10 px-6 py-3 font-sans font-bold uppercase tracking-[0.1em] text-bianco-smalto ring-1 ring-bianco-smalto/30 hover:bg-bianco-smalto/20"
        >
          Tabellone
        </button>
      </div>
    </div>
  );
}
