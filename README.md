# Keywriter 🚂

**Typing game sulle stazioni ferroviarie italiane.** Scegli una linea, digita il nome di ogni fermata: a ogni lettera corretta il trenino avanza sulla mappa. Arrivi al capolinea, il tabellone ti dice tempo, velocità e precisione.

**▶ Gioca subito: [keywriter-phi.vercel.app](https://keywriter-phi.vercel.app)**

Ispirato ai video di typing "stazione per stazione" sulle linee giapponesi — qui con le ferrovie italiane: dalla Circumvesuviana alle Cinque Terre, dalla Faentina alla tirrenica calabra.

---

## Come si gioca

1. Dal **tabellone partenze** scegli una delle 30 linee (raggruppate per area: Nord-Ovest, Nord-Est, Centro, Sud e Isole).
2. Sul **cartello blu** appare il nome della prossima stazione: digitalo. Non servono maiuscole, accenti o punteggiatura (`sant'ambrogio` = `sant ambrogio`).
3. Ogni lettera corretta fa avanzare il **trenino** lungo il binario. Stazione completata → si passa alla successiva, il binario percorso si colora.
4. Sbagli una lettera? Il cartello lampeggia rosso e le lettere da cancellare restano evidenziate in rosso, con il cursore sempre visibile.
5. Al capolinea: **tempo totale, WPM e precisione**.

## Screenshot

### Tabellone partenze
Le 30 linee in stile tabellone Solari, con numero di binario e conteggio fermate.

![Tabellone partenze](docs/tabellone.png)

### In viaggio
Mappa a tutto schermo, binario percorso colorato, stazioni che si accendono al passaggio, HUD con statistiche in tempo reale.

![Gameplay sulla Genova–La Spezia](docs/gameplay.png)

### Capolinea
![Schermata di arrivo](docs/capolinea.png)

## Le linee

30 linee reali con fermate locali, 454 stazioni totali. Qualche esempio:

- **Genova → La Spezia** — la riviera di levante e le Cinque Terre, 18 fermate
- **Napoli → Sorrento** — la Circumvesuviana, con Ercolano e Pompei Scavi
- **Verona → Brennero** — tutta la valle dell'Adige e dell'Isarco, 21 fermate
- **Brescia → Edolo** — il lago d'Iseo e la Val Camonica
- **Firenze → Faenza** — la Faentina, attraverso il Mugello
- **Roma → Lido di Ostia**, **Torino → Aosta**, **Palermo → Messina**, **Salerno → Sapri**…

> Le coordinate delle stazioni sono approssimate (±1–2 km): abbastanza precise per il gioco, non per la cartografia.

## Design

Estetica ispirata alla segnaletica ferroviaria italiana anni '70–'80:

- **Menu** = tabellone partenze a palette (fondo quasi nero, lettere ambra, righe che entrano a cascata)
- **Parola da digitare** = cartello di stazione blu smaltato con doppio bordo bianco
- **Statistiche** = pannello split-flap con scatto a ogni cambio di valore
- Font: [Archivo](https://fonts.google.com/specimen/Archivo) (segnaletica) + [Fragment Mono](https://fonts.google.com/specimen/Fragment+Mono) (tabelloni)
- Palette in OKLCH: blu segnaletica, avorio carta, ambra tabellone, rosso FS

## Stack

- [Next.js](https://nextjs.org) (App Router, Turbopack) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) con design token custom
- [Leaflet](https://leafletjs.com) + tile [CARTO Positron](https://carto.com/basemaps) su dati [OpenStreetMap](https://www.openstreetmap.org)
- Trenino animato con `requestAnimationFrame` e decelerazione esponenziale — nessuna libreria di animazione
- Nessun backend: tutto statico, deploy su Vercel

## Sviluppo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build di produzione
```

### Aggiungere una linea

Le linee vivono in [`lib/lines/`](lib/lines), un file per area geografica. Basta aggiungere un oggetto e inserirlo nell'array esportato:

```ts
{
  id: "bologna-porretta",
  label: "Bologna → Porretta Terme",
  region: "Nord-Est",
  color: "#92400e",            // colore del binario sulla mappa
  stations: [
    { name: "Bologna Centrale", lat: 44.5057, lng: 11.3428 },
    // ...in ordine di percorrenza
  ],
}
```

Nient'altro da toccare: menu, mappa e gioco si generano dal dataset.

### Rigenerare gli screenshot del README

```bash
npm run dev &
node scripts/screenshots.mjs   # usa il Chrome di sistema, salva in docs/
```
