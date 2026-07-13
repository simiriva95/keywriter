export type Station = {
  name: string;
  lat: number;
  lng: number;
};

export type Region = "Nord-Ovest" | "Nord-Est" | "Centro" | "Sud e Isole";

export type Line = {
  id: string;
  label: string;
  region: Region;
  color: string;
  stations: Station[];
};

import { nordOvest } from "./nord-ovest";
import { nordEst } from "./nord-est";
import { centro } from "./centro";
import { sud } from "./sud";

export const allLines: Line[] = [...nordOvest, ...nordEst, ...centro, ...sud];

export const regions: Region[] = ["Nord-Ovest", "Nord-Est", "Centro", "Sud e Isole"];
