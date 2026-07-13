"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Line } from "@/lib/lines";

// Interpola la posizione (in unità-stazione, es. 3.4) lungo la spezzata.
function posToLatLng(pts: L.LatLng[], pos: number): L.LatLng {
  const clamped = Math.max(0, Math.min(pos, pts.length - 1));
  const i = Math.min(Math.floor(clamped), pts.length - 2);
  const t = clamped - i;
  const a = pts[i];
  const b = pts[i + 1];
  return L.latLng(a.lat + (b.lat - a.lat) * t, a.lng + (b.lng - a.lng) * t);
}

function coveredPath(pts: L.LatLng[], pos: number): L.LatLng[] {
  const i = Math.min(Math.floor(Math.max(0, pos)), pts.length - 2);
  return [...pts.slice(0, i + 1), posToLatLng(pts, pos)];
}

// Locomotiva vista frontale in medaglione smaltato, colorata come la linea.
function trainHtml(color: string) {
  return `<svg width="42" height="42" viewBox="0 0 42 42" style="filter:drop-shadow(0 2px 6px rgb(0 0 0/0.4))">
    <circle cx="21" cy="21" r="19" fill="oklch(0.97 0.005 85)" stroke="${color}" stroke-width="3"/>
    <rect x="12" y="9" width="18" height="23" rx="4.5" fill="${color}"/>
    <rect x="14.5" y="12.5" width="13" height="7.5" rx="2" fill="oklch(0.97 0.005 85)" opacity="0.92"/>
    <circle cx="16.5" cy="27" r="2" fill="oklch(0.85 0.13 80)"/>
    <circle cx="25.5" cy="27" r="2" fill="oklch(0.85 0.13 80)"/>
    <rect x="18.5" y="5.5" width="5" height="4" rx="1.5" fill="${color}"/>
  </svg>`;
}

export default function RailMap({ line, pos }: { line: Line; pos: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(pos);

  useEffect(() => {
    targetRef.current = pos;
  }, [pos]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pts = line.stations.map((s) => L.latLng(s.lat, s.lng));

    const map = L.map(el, { zoomControl: false, scrollWheelZoom: true });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);
    map.fitBounds(L.latLngBounds(pts).pad(0.18));

    // Binario da percorrere: base scura + traversine bianche tratteggiate.
    L.polyline(pts, { color: "#8a8f98", weight: 6, opacity: 0.85 }).addTo(map);
    L.polyline(pts, {
      color: "#ffffff",
      weight: 2,
      dashArray: "7 9",
      opacity: 0.9,
    }).addTo(map);
    // Parte percorsa: alone bianco sotto + colore linea sopra (stacca dal fondo).
    const casing = L.polyline([pts[0]], {
      color: "#ffffff",
      weight: 11,
      opacity: 0.85,
      lineCap: "round",
    }).addTo(map);
    const covered = L.polyline([pts[0]], {
      color: line.color,
      weight: 6,
      opacity: 1,
      lineCap: "round",
    }).addTo(map);

    // Stazioni: grigie da raggiungere, si accendono del colore linea al passaggio.
    const markers = line.stations.map((s) =>
      L.circleMarker([s.lat, s.lng], {
        radius: 5,
        color: "#8a8f98",
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 1,
      })
        .bindTooltip(s.name, { direction: "top", offset: [0, -8] })
        .addTo(map)
    );
    const styleStations = (reached: number) => {
      markers.forEach((m, i) => {
        if (i <= reached) {
          m.setStyle({ color: line.color, fillColor: line.color, weight: 2 });
          m.setRadius(5);
        } else if (i === reached + 1) {
          // prossima fermata: anello colorato più grande, cuore bianco
          m.setStyle({ color: line.color, fillColor: "#ffffff", weight: 3 });
          m.setRadius(8);
        } else {
          m.setStyle({ color: "#8a8f98", fillColor: "#ffffff", weight: 2 });
          m.setRadius(5);
        }
      });
    };
    styleStations(-1);

    const train = L.marker(pts[0], {
      icon: L.divIcon({
        className: "train-icon",
        html: trainHtml(line.color),
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      }),
      zIndexOffset: 1000,
    }).addTo(map);

    // rAF: il treno insegue il target con decelerazione esponenziale (frenata).
    let current = 0;
    let lastReached = -1;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      const tgt = targetRef.current;
      if (Math.abs(tgt - current) > 0.0004) {
        current =
          Math.abs(tgt - current) < 0.001
            ? tgt
            : current + (tgt - current) * (1 - Math.exp(-7 * dt));
        const p = posToLatLng(pts, current);
        train.setLatLng(p);
        const path = coveredPath(pts, current);
        covered.setLatLngs(path);
        casing.setLatLngs(path);
        const reached = Math.floor(current + 0.001);
        if (reached !== lastReached) {
          lastReached = reached;
          styleStations(reached);
        }
        // Segue il treno se esce dal riquadro centrale.
        if (!map.getBounds().pad(-0.35).contains(p)) map.panTo(p);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      map.remove();
    };
  }, [line]);

  return <div ref={containerRef} className="h-full w-full" />;
}
