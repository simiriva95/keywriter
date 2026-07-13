"use client";

import { regions, type Line } from "@/lib/lines";

export default function LineMenu({
  lines,
  onSelect,
}: {
  lines: Line[];
  onSelect: (line: Line) => void;
}) {
  // Numero di binario progressivo su tutto il tabellone.
  let binario = 0;

  return (
    <main className="bg-tabellone min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-bianco-smalto sm:text-4xl">
              Keywriter
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.3em] text-ambra-fioca">
              digita ogni fermata · il treno parte con te
            </p>
          </div>
          <span className="font-mono text-sm uppercase tracking-[0.2em] text-ambra">
            Partenze
          </span>
        </header>

        {/* Intestazione colonne, come sul tabellone vero */}
        <div className="mb-1 flex items-baseline gap-4 px-2 font-mono text-[9px] uppercase tracking-[0.3em] text-bianco-smalto/30">
          <span className="w-2.5" />
          <span className="grow">destinazione</span>
          <span className="w-16 text-right">fermate</span>
          <span className="w-14 text-right">bin</span>
        </div>

        {regions.map((region) => {
          const group = lines.filter((l) => l.region === region);
          if (group.length === 0) return null;
          return (
            <section key={region} className="mb-8">
              <h2 className="mb-2 mt-4 px-2 font-mono text-[10px] uppercase tracking-[0.35em] text-bianco-smalto/40">
                {region}
              </h2>
              <ul>
                {group.map((line) => {
                  binario++;
                  return (
                    <li
                      key={line.id}
                      className="board-row"
                      style={{ animationDelay: `${binario * 30}ms` }}
                    >
                      <button
                        onClick={() => onSelect(line)}
                        className="group flex w-full items-baseline gap-4 border-b border-white/[0.06] px-2 py-3 text-left transition-colors hover:bg-white/[0.04]"
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 self-center rounded-full"
                          style={{ backgroundColor: line.color }}
                        />
                        <span className="grow font-mono text-sm uppercase tracking-[0.12em] text-ambra group-hover:text-bianco-smalto sm:text-base">
                          {line.label.replace("→", "·")}
                        </span>
                        <span className="w-16 shrink-0 text-right font-mono text-[11px] uppercase tracking-[0.15em] text-ambra-fioca">
                          {line.stations.length}
                        </span>
                        <span className="bg-tabellone-cella w-14 shrink-0 rounded-sm px-1.5 py-0.5 text-right font-mono text-[11px] tabular-nums text-bianco-smalto/80">
                          {String(binario).padStart(2, "0")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
