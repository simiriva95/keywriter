"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTypingGame } from "@/lib/useTypingGame";
import { allLines, type Line } from "@/lib/lines";
import StationCard from "./StationCard";
import Scoreboard from "./Scoreboard";
import ResultScreen from "./ResultScreen";
import LineMenu from "./LineMenu";

// leaflet tocca window → niente SSR.
const RailMap = dynamic(() => import("./RailMap"), {
  ssr: false,
  loading: () => <div className="bg-avorio h-full w-full" />,
});

export default function Game() {
  const [line, setLine] = useState<Line | null>(null);

  if (!line) return <LineMenu lines={allLines} onSelect={setLine} />;
  // key = rimonta GameView (e resetta la partita) quando cambia linea
  return <GameView key={line.id} line={line} onExit={() => setLine(null)} />;
}

function GameView({ line, onExit }: { line: Line; onExit: () => void }) {
  const game = useTypingGame(line);

  // Ticker: forza il re-render mentre si gioca così il cronometro scorre.
  const [, tick] = useState(0);
  useEffect(() => {
    if (game.status !== "playing") return;
    const id = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [game.status]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Mappa a tutto schermo */}
      <div className="absolute inset-0">
        <RailMap line={line} pos={game.trainPos} />
      </div>

      {/* Barra alta: uscita + HUD solari */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between gap-3 p-3 sm:p-5 ${
          game.status === "done" ? "hidden" : ""
        }`}
      >
        <button
          onClick={onExit}
          className="bg-tabellone pointer-events-auto rounded-md px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-ambra shadow-[0_4px_16px_rgb(0_0_0/0.35)] ring-1 ring-black/40 hover:text-bianco-smalto"
        >
          ← Partenze
        </button>
        <Scoreboard stats={game.stats} />
        <span className="bg-tabellone hidden items-center gap-2 rounded-md px-4 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-ambra shadow-[0_4px_16px_rgb(0_0_0/0.35)] ring-1 ring-black/40 sm:flex">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: line.color }}
          />
          {line.label.replace("→", "·")}
        </span>
      </div>

      {/* Cartello stazione in basso */}
      <div
        className={`absolute inset-x-0 bottom-6 z-[500] flex justify-center px-4 sm:bottom-10 ${
          game.status === "done" ? "hidden" : ""
        }`}
      >
        <StationCard
          name={game.current.name}
          next={game.next?.name ?? null}
          typed={game.typed}
          hasTypo={game.hasTypo}
          onChange={game.setInput}
          index={game.index}
        />
      </div>

      {game.status === "done" && (
        <ResultScreen
          destination={line.stations[line.stations.length - 1].name}
          stats={game.stats}
          onReset={game.reset}
          onExit={onExit}
        />
      )}
    </main>
  );
}
