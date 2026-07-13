"use client";

import { useEffect, useRef } from "react";
import { normalize } from "@/lib/useTypingGame";

// Lettere del cartello: bianche se digitate giuste, rosse se sbagliate (da
// cancellare), semitrasparenti se ancora da digitare. Cursore lampeggiante
// alla posizione corrente, così dopo un errore si vede subito dove si è.
function renderSign(target: string, typed: string) {
  const nt = normalize(target);
  const nn = normalize(typed);
  let okPrefix = 0;
  while (okPrefix < nn.length && nn[okPrefix] === nt[okPrefix]) okPrefix++;

  const caretIdx = Math.min(nn.length, nt.length);
  const overflow = Math.max(0, nn.length - nt.length);
  const out: React.ReactNode[] = [];

  target.toUpperCase().split("").forEach((ch, i) => {
    // Mappa l'indice del testo originale su quello normalizzato (approssima 1:1,
    // sufficiente perché normalize preserva le lettere e gli spazi).
    if (i === caretIdx) out.push(<span key="caret" className="sign-caret" />);
    const cls =
      i < okPrefix
        ? "text-bianco-smalto"
        : i < nn.length
          ? "text-[oklch(0.72_0.2_27)] underline decoration-2 underline-offset-4"
          : "text-bianco-smalto/35";
    out.push(
      <span key={i} className={cls}>
        {ch}
      </span>
    );
  });
  if (caretIdx === nt.length) {
    // Digitato oltre la fine del nome: mostra quanti tasti extra cancellare.
    if (overflow > 0)
      out.push(
        <span key="overflow" className="text-[oklch(0.72_0.2_27)]">
          +{overflow}
        </span>
      );
    out.push(<span key="caret-end" className="sign-caret" />);
  }
  return out;
}

export default function StationCard({
  name,
  next,
  typed,
  hasTypo,
  onChange,
  index,
}: {
  name: string;
  next: string | null;
  typed: string;
  hasTypo: boolean;
  onChange: (v: string) => void;
  index: number;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [index]);

  return (
    <div
      className="relative cursor-text select-none"
      onClick={() => ref.current?.focus()}
    >
      {/* Cartello smaltato: doppio bordo bianco come la segnaletica reale */}
      <div
        className={`bg-blu-fs rounded-lg px-8 py-5 shadow-[0_6px_24px_rgb(0_0_0/0.28)] ring-1 ring-black/20 sm:px-12 sm:py-6 ${
          hasTypo ? "sign-error" : ""
        }`}
      >
        <div className="rounded-md border-2 border-bianco-smalto/90 px-6 py-4 sm:px-10 sm:py-5">
          <div className="text-center font-sans text-3xl font-black uppercase tracking-[0.08em] sm:text-5xl">
            {renderSign(name, typed)}
          </div>
          {hasTypo ? (
            <div className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-[oklch(0.78_0.17_27)] sm:text-xs">
              ⌫ cancella le lettere rosse
            </div>
          ) : (
            next && (
              <div className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-bianco-smalto/60 sm:text-xs">
                prossima fermata · {next}
              </div>
            )
          )}
        </div>
      </div>
      {/* Input invisibile: si scrive direttamente "sul cartello" */}
      <input
        ref={ref}
        value={typed}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => ref.current?.focus()}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label={`Digita: ${name}`}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
      />
    </div>
  );
}
