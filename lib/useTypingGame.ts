import { useCallback, useMemo, useReducer } from "react";
import type { Line, Station } from "./lines";

// Normalizza per confronto: minuscole, senza accenti, senza punteggiatura,
// spazi collassati. "Firenze S. M. Novella" ~ "firenze s m novella".
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritici
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type Status = "idle" | "playing" | "done";

type State = {
  index: number;
  typed: string;
  startTime: number | null;
  endTime: number | null;
  correctChars: number;
  totalKeystrokes: number;
  status: Status;
};

type Action =
  | { type: "input"; value: string; now: number }
  | { type: "reset" };

const initialState: State = {
  index: 0,
  typed: "",
  startTime: null,
  endTime: null,
  correctChars: 0,
  totalKeystrokes: 0,
  status: "idle",
};

function countNewCorrect(prev: string, next: string, target: string): number {
  // Conta i caratteri appena aggiunti che sono corretti (per la precisione).
  // Confronto normalizzato posizione per posizione.
  const nt = normalize(target);
  const pn = normalize(prev);
  const nn = normalize(next);
  let correct = 0;
  for (let i = pn.length; i < nn.length; i++) {
    if (nn[i] !== undefined && nn[i] === nt[i]) correct++;
  }
  return correct;
}

function reducer(stations: Station[]) {
  return (state: State, action: Action): State => {
    switch (action.type) {
      case "reset":
        return initialState;
      case "input": {
        if (state.status === "done") return state;
        const target = stations[state.index].name;
        const grew = action.value.length > state.typed.length;
        const startTime = state.startTime ?? action.now;

        const newCorrect = grew
          ? countNewCorrect(state.typed, action.value, target)
          : 0;
        const newKeystrokes = grew
          ? state.totalKeystrokes + (action.value.length - state.typed.length)
          : state.totalKeystrokes;

        // Stazione completata?
        if (normalize(action.value) === normalize(target)) {
          const nextIndex = state.index + 1;
          const done = nextIndex >= stations.length;
          return {
            ...state,
            index: done ? state.index : nextIndex,
            typed: "",
            startTime,
            endTime: done ? action.now : null,
            correctChars: state.correctChars + newCorrect,
            totalKeystrokes: newKeystrokes,
            status: done ? "done" : "playing",
          };
        }

        return {
          ...state,
          typed: action.value,
          startTime,
          correctChars: state.correctChars + newCorrect,
          totalKeystrokes: newKeystrokes,
          status: "playing",
        };
      }
      default:
        return state;
    }
  };
}

export type Stats = {
  elapsedMs: number;
  wpm: number;
  accuracy: number; // 0-100
  progress: number; // 0-1
  index: number;
  total: number;
};

export function useTypingGame(line: Line, now: () => number = Date.now) {
  const stations = line.stations;
  const [state, dispatch] = useReducer(reducer(stations), initialState);

  const setInput = useCallback(
    (value: string) => dispatch({ type: "input", value, now: now() }),
    [now]
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const stats: Stats = useMemo(() => {
    const end = state.endTime ?? now();
    const elapsedMs = state.startTime ? end - state.startTime : 0;
    const minutes = elapsedMs / 60000;
    const wpm = minutes > 0 ? state.correctChars / 5 / minutes : 0;
    const accuracy =
      state.totalKeystrokes > 0
        ? (state.correctChars / state.totalKeystrokes) * 100
        : 100;
    const completed = state.status === "done" ? stations.length : state.index;
    return {
      elapsedMs,
      wpm,
      accuracy,
      progress: completed / stations.length,
      index: completed,
      total: stations.length,
    };
    // ricalcolato ad ogni render (il timer scorre via re-render del Game)
  }, [state, stations.length, now]);

  // Posizione del treno in unità-stazione (es. 3.4 = 40% fra la 4ª e la 5ª):
  // avanza a ogni carattere corretto del prefisso digitato.
  const targetNorm = normalize(stations[state.index].name);
  const typedNorm = normalize(state.typed);
  let okPrefix = 0;
  while (okPrefix < typedNorm.length && typedNorm[okPrefix] === targetNorm[okPrefix]) {
    okPrefix++;
  }
  const charFraction = targetNorm.length ? okPrefix / targetNorm.length : 0;
  const trainPos =
    state.status === "done"
      ? stations.length - 1
      : Math.min(state.index + charFraction, stations.length - 1);
  const hasTypo = typedNorm.length > okPrefix;

  return {
    current: stations[state.index],
    next: stations[state.index + 1] ?? null,
    index: state.index,
    typed: state.typed,
    status: state.status,
    stations,
    trainPos,
    hasTypo,
    setInput,
    reset,
    stats,
  };
}
