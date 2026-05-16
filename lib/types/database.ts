// =====================================================================
// TypeScript tipi za Supabase bazo (AS system aplikacija)
// Sledi shemi v supabase/01_schema.sql
// =====================================================================

export type Oddelek =
  | "proizvodnja"
  | "montaza"
  | "komerciala"
  | "racunovodstvo"
  | "kakovost"
  | "tehnolog"
  | "kadrovska"
  | "uprava"
  | "nabava";

export type Segment =
  | "vijaki"
  | "pini"
  | "sidra_kovana"
  | "sidra_struzena"
  | "sidra_gildemeister"
  | "objemke"
  | "zicniki";

export const SEGMENT_LABELS: Record<Segment, string> = {
  vijaki: "Vijaki",
  pini: "Pini",
  sidra_kovana: "Sidra (kovana)",
  sidra_struzena: "Sidra (stružena ZMAT)",
  sidra_gildemeister: "Sidra (Gildemeister)",
  objemke: "Objemke",
  zicniki: "Žičniki",
};

export type Operacija =
  | "kovanje"
  | "valjanje"
  | "kovanje_in_valjanje"
  | "spicenje"
  | "stancanje"
  | "struzenje"
  | "brusenje"
  | "drugo";

export const OPERACIJA_LABELS: Record<Operacija, string> = {
  kovanje: "Kovanje",
  valjanje: "Valjanje",
  kovanje_in_valjanje: "Kovanje + valjanje",
  spicenje: "Špičenje",
  stancanje: "Štancanje",
  struzenje: "Struženje",
  brusenje: "Brušenje",
  drugo: "Drugo",
};

export type Izmena = "prva" | "druga" | "nadure";

export const IZMENA_LABELS: Record<Izmena, string> = {
  prva: "1. izmena",
  druga: "2. izmena",
  nadure: "Nadure",
};

export type StanjeStroja = "aktiven" | "okvara" | "se_ne_obratuje" | "ukinjen";

export type VlogaVProizvodnji = "vodja_proizvodnje" | "delavec";

export type Vloga =
  | "admin"
  | "vodja_oddelka"
  | "delavec"
  | "komercialist"
  | "racunovodja";

export interface Delavec {
  id: string;
  ime: string;
  priimek: string;
  sifra: string | null;
  oddelek: Oddelek;
  vloga_v_proizvodnji: VlogaVProizvodnji;
  aktiven: boolean;
  ustvarjen_dne: string;
}

export interface Stroj {
  id: string;
  sifra: string;
  naziv: string;
  operacija: Operacija;
  segment: Segment;
  norma_kos_min: number;
  norma_kos_h: number | null;
  norma_kos_7h: number | null;
  norma_kos_14h: number | null;
  norma_kos_5dni: number | null;
  norma_kos_22dni: number | null;
  norma_kos_letno: number | null;
  tipi_izdelkov_opis: string | null;
  stanje: StanjeStroja;
  opomba: string | null;
  ustvarjen_dne: string;
}

export interface Izdelek {
  id: string;
  sifra: string;
  ime: string;
  segment: Segment;
  enota: string;
  aktiven: boolean;
  ustvarjen_dne: string;
}

export interface Zica {
  id: string;
  koda: string;
  opis: string | null;
  aktivna: boolean;
  ustvarjena_dne: string;
}

export interface TipNapake {
  id: string;
  ime: string;
  za_segment: Segment | null;
  aktiven: boolean;
}

export interface Uporabnik {
  id: string;
  ime: string;
  priimek: string;
  email: string;
  vloga: Vloga;
  oddelek: Oddelek;
  povezan_delavec_id: string | null;
  aktiven: boolean;
  ustvarjen_dne: string;
}

export interface Proizvodnja {
  id: string;
  datum: string;
  izmena: Izmena;
  delavec_id: string;
  stroj_id: string;
  izdelek_id: string;
  zica_id: string | null;
  ure_dela: number;
  kolicina_kos: number;
  norma_kos: number;
  ucinkovitost: number | null;
  nalog: string | null;
  opombe: string | null;
  potrjeno: boolean;
  potrdil_id: string | null;
  potrjeno_dne: string | null;
  ustvarjen_dne: string;
  ustvaril_id: string | null;
}

export interface VnosTedenski {
  teden_zacetek: string;
  teden_konec: string;
  delavec_id: string;
  delavec_polno_ime: string;
  stroj_id: string;
  stroj_sifra: string;
  stroj_naziv: string;
  izdelek_id: string;
  izdelek_sifra: string;
  izdelek_ime: string;
  segment: Segment;
  skupaj_kos: number;
  skupaj_norma: number;
  skupaj_ur: number;
  povprecna_ucinkovitost: number | null;
  st_vnosov: number;
}
