"use client";

import type { Stats } from "@/lib/useTypingGame";

export function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-2 sm:px-6">
      <span
        key={value} // rimonta a ogni cambio → scatto di paletta
        className="flap bg-tabellone-cella rounded-sm px-2 py-0.5 font-mono text-lg tabular-nums text-ambra sm:text-2xl"
      >
        {value}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ambra-fioca sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

export default function Scoreboard({ stats }: { stats: Stats }) {
  return (
    <div className="bg-tabellone flex divide-x divide-white/10 rounded-md shadow-[0_4px_16px_rgb(0_0_0/0.35)] ring-1 ring-black/40">
      <Cell label="Tempo" value={fmtTime(stats.elapsedMs)} />
      <Cell label="WPM" value={String(Math.round(stats.wpm))} />
      <Cell label="Precisione" value={`${Math.round(stats.accuracy)}%`} />
      <Cell label="Stazioni" value={`${stats.index}/${stats.total}`} />
    </div>
  );
}
