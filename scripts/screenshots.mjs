// Genera gli screenshot del README in docs/ usando il Chrome di sistema.
// Uso: node scripts/screenshots.mjs (dev server attivo su :3000)
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Cinque Terre: nomi in ordine, come li digiterebbe il giocatore.
const STATIONS = [
  "genova brignole", "genova nervi", "recco", "camogli san fruttuoso",
  "santa margherita ligure portofino", "rapallo", "zoagli", "chiavari",
  "lavagna", "sestri levante", "deiva marina", "levanto", "monterosso",
  "vernazza", "corniglia", "manarola", "riomaggiore", "la spezia centrale",
];

const browser = await puppeteer.launch({
  channel: "chrome",
  headless: true,
  args: ["--window-size=1600,900", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900 });

// 1. Tabellone partenze
await page.goto(BASE, { waitUntil: "networkidle0" });
await sleep(2000); // animazione board-in
await page.screenshot({ path: "docs/tabellone.png" });
console.log("✓ docs/tabellone.png");

// 2. Gameplay: 8 fermate della Cinque Terre
await page.$$eval("button", (btns) =>
  btns.find((b) => b.textContent.includes("Cinque Terre")).click()
);
await sleep(2500); // mappa + tile
for (const name of STATIONS.slice(0, 8)) {
  await page.keyboard.type(name, { delay: 10 });
  await sleep(120);
}
await sleep(1600); // il treno raggiunge la posizione
await page.screenshot({ path: "docs/gameplay.png" });
console.log("✓ docs/gameplay.png");

// 3. Capolinea
for (const name of STATIONS.slice(8)) {
  await page.keyboard.type(name, { delay: 8 });
  await sleep(80);
}
await sleep(1800);
await page.screenshot({ path: "docs/capolinea.png" });
console.log("✓ docs/capolinea.png");

await browser.close();
