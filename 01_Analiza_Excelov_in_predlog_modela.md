# AS system aplikacija — Analiza Excelov in predlog podatkovnega modela

**Datum:** 16. maj 2026
**Pripravil:** Claude (Cowork) za Claudio
**Status:** Predlog v pregled — pred postavitvijo Supabase/Next.js projekta potrebujem potrditev

---

## 1. Kaj sem našel v Excelih

Pregledala sem 6 datotek:

1. **Spremljanje Vijaki BoS 2026** — vijaki, razdeljeno po dimenzijah (5x13,5; 4,5x14,5; M4x6,5 …)
2. **Spremljanje PINI BoS 2026** — pini, razdeljeno po šifri izdelka (277-6190-000 …)
3. **Spremljanje Sidra BoS 2026** — sidra, po strojih (NDS AS, NDS ASM, Z-MAT1/2, Štanca)
4. **Spremljanje Sidra Gildemeister BoS 2026** — sidra Gildemeister (G706/708/709/710, ŠTANCA, BRT, Brusilni stroj)
5. **Spremljanje Žičniki BoS 2026** — žičniki (KOV1–4, VAL1–4)
6. **Tabela Odpada BoS PINI, VIJAKI, ŽIČNIKI 2026** — odpadni material po dnevih

### Vzorec, ki ga vsi spremljanji listi delijo

Vse 4 družine (Vijaki, PINI, Sidra, Žičniki) imajo enako strukturo listov:

| List | Kaj vsebuje |
|---|---|
| **Normativi** | Po stroju, po dnevu v letu: koda izmene (0=vikend, 1=1 izmena, 2=2 izmeni, 3/4=prestavljena izmena) + dnevna norma (npr. 120.000 kos/dan) |
| **Vrednosti** | Mesečni seštevki proizvodnje + letni plan + odmik od plana + dnevna podrobnost po izdelku/stroju in izmeni |
| **Skupen pregled** | Skupni pregled (večinoma izračunani sešteski) |
| **Zastoji XXX** | Zapis vsakega zastoja: datum, stroj, opis okvare, pogostost, opravljeno delo, kdo je popravil, trajanje (min), LOT materiala |
| **Po stroju XXX** | Sledenje proizvodnje po stroju (z istimi stolpci kot Zastoji) |

### Vzorec, ki ga ima tabela odpada

| List | Kaj vsebuje |
|---|---|
| **VIJAKI / PINI / ŽIČNIKI** | Vsak vnos: datum, stroj, izdelek, koda žice, žica (KG), napaka, delavec, LOT žice, nalog |
| **PODATKI** | Šifrant: stroji, izdelki, žice, delavci (master data) |

### Ključno opažanje

V trenutnem Excelu **dnevna proizvodnja NI vezana na konkretnega delavca** — samo na stroj in izmeno. Delavca vidiš le pri odpadu in zastojih. Aplikacija bo tukaj naredila korak naprej: vsak dnevni vnos bo imel delavca, kar omogoča vodjam in plačam realne podatke.

---

## 2. Predlog podatkovnega modela (Supabase tabele)

Razdelila sem ga na **šifrante** (master data — redko se spreminjajo) in **transakcijske tabele** (dnevni vnosi).

### A. Šifranti (master data)

#### `delavci`
Vsi delavci v proizvodnji (Matija Postružin, Simon Jagodič, Danijel Koren, Mitja Babič …)

```
id              uuid (PK)
ime             text
priimek         text
sifra           text (interna šifra, neobvezno)
oddelek         enum (proizvodnja_vijaki | proizvodnja_pini | proizvodnja_sidra | proizvodnja_zicniki | montaza)
aktiven         bool
ustvarjen_dne   timestamptz
```

#### `stroji`
Vsi stroji (214, 256, 6190, G710, NDS AS, KOV1, CS TP2C + EWM …)

```
id              uuid (PK)
sifra           text (npr. "214", "G710", "NDS AS")
ime             text (poln naziv)
druzina         enum (vijaki | pini | sidra | sidra_gildemeister | zicniki)
aktiven         bool
```

#### `izdelki`
Vse, kar se proizvaja: vijak 5x13,5; PIN 6190; sidro NDS AS; žičnik …

```
id              uuid (PK)
sifra           text (npr. "5x13,5", "277-6190-000")
ime             text (npr. "Vijak 5x13,5")
druzina         enum (vijaki | pini | sidra | sidra_gildemeister | zicniki)
enota           text (kos, kg)
aktiven         bool
```

#### `zice` (materiali)
Vse vrste žice (fi 3.20, K1346/3,41, K1275/2,75 …)

```
id              uuid (PK)
koda            text (npr. "K1346/3,41", "fi 3.20")
opis            text (neobvezno)
aktivna         bool
```

#### `tipi_napak`
Pogosti tipi napak (Odrez od špic, Zlaman glavač, Slabi komadi, čiščenje stroja …)

```
id              uuid (PK)
ime             text
za_druzino      enum (skupno za vse | vijaki | pini …) — neobvezno
```

### B. Plan in normativi

#### `normativi`
Norma na dan po stroju in dnevu (iz Normativi lista)

```
id              uuid (PK)
stroj_id        uuid → stroji.id
datum           date
koda_izmene     smallint (0=vikend, 1=1 izmena, 2=2 izmeni, 3/4=prestavljena)
norma_kos       integer (npr. 120000)
opomba          text
```

#### `letni_plan`
Letni plan po izdelku

```
id              uuid (PK)
izdelek_id      uuid → izdelki.id
leto            smallint
plan_kos        bigint
```

### C. Transakcijske tabele (dnevni vnosi)

#### `proizvodnja` — **GLAVNA TABELA** ★
Vsak vnos = en delavec, en stroj, en izdelek, ena izmena, en dan, koliko je naredil.

```
id              uuid (PK)
datum           date            — pomembno za tedensko poročilo
izmena          enum (1 | 2 | nadure)
delavec_id      uuid → delavci.id    ← novo! Trenutno Excel tega ne ima
stroj_id        uuid → stroji.id
izdelek_id      uuid → izdelki.id
zica_id         uuid → zice.id (neobvezno)
kolicina_kos    integer         — koliko je naredil
norma_kos       integer (auto)  — kopija norme za ta dan (zgodovinski podatek)
ucinkovitost    decimal (auto)  — kolicina / norma * 100
nalog           text (neobvezno) — delovni nalog (LOT/NALOG)
opombe          text
ustvarjen_dne   timestamptz
ustvaril        uuid → uporabniki.id
```

#### `odpad`
Odpadni material (iz tabele odpada)

```
id              uuid (PK)
datum           date
stroj_id        uuid → stroji.id
izdelek_id      uuid → izdelki.id
zica_id         uuid → zice.id
zica_kg         decimal         — teža odpada
tip_napake_id   uuid → tipi_napak.id
delavec_id      uuid → delavci.id
lot_zice        text
nalog           text
opombe          text
ustvarjen_dne   timestamptz
ustvaril        uuid → uporabniki.id
```

#### `zastoji`
Zastoji strojev (iz Zastoji listov)

```
id              uuid (PK)
datum           date
stroj_id        uuid → stroji.id
opis_okvare     text
pogostost       integer (default 1)
opravljeno_delo text
napako_odpravil_id uuid → delavci.id (neobvezno — lahko zunanji)
trajanje_min    integer
lot_materiala   text
opombe          text
ustvarjen_dne   timestamptz
ustvaril        uuid → uporabniki.id
```

#### `izmet`
Slabi komadi (Izmet) — za PINI in Sidra so vidni v Vrednosti listih

```
id              uuid (PK)
datum           date
izdelek_id      uuid → izdelki.id
stroj_id        uuid → stroji.id
kolicina_kos    integer
opombe          text
```

### D. Uporabniki in pravice

#### `uporabniki`
Kdo se prijavi v aplikacijo (Supabase Auth)

```
id              uuid (PK = auth.users.id)
ime             text
priimek         text
email           text
vloga           enum (admin | vodja_oddelka | delavec | komercialist | racunovodja)
oddelek         enum (proizvodnja | montaza | komerciala | racunovodstvo | kakovost | tehnolog | kadrovska | uprava | nabava)
povezan_delavec_id uuid → delavci.id (neobvezno — če je uporabnik tudi delavec)
aktiven         bool
```

### E. Tedensko poročilo (avtomatski view)

To **ni** posebna tabela, ampak Supabase **view** (samodejen izračun):

```
tedensko_porocilo_proizvodnja (view)
  oddelek
  teden_zacetek (ponedeljek)
  teden_konec (petek)
  delavec
  stroj
  izdelek
  skupaj_kosov
  skupaj_norma
  povprecna_ucinkovitost
  skupaj_odpad_kg
  skupaj_zastojev_min
```

Vodja oddelka samo odpre stran "Tedensko poročilo" in vidi avtomatsko sešteške za izbrani teden Pon–Pet.

---

## 3. Skica obrazca za vnos (mobile-friendly)

Ker bodo delavci vnašali s tablice/telefona, je ključno da je obrazec **kratek, z velikimi gumbi, večinoma izbirniki**.

### Obrazec "Dnevni vnos proizvodnje"

```
┌─────────────────────────────────────┐
│  📋 Vnos proizvodnje                │
├─────────────────────────────────────┤
│ Datum:        [16.5.2026]           │ ← privzeto danes
│ Izmena:       [1] [2] [Nadure]      │ ← veliki gumbi
│ Delavec:      [▾ Matija Postružin]  │ ← spustni meni
│ Stroj:        [▾ 214]               │
│ Izdelek:      [▾ Vijak 5x13,5]      │
│ Žica (mat.):  [▾ K1346/3,41]        │
│                                     │
│ Količina (kos): [120 000]           │ ← veliko polje
│ Norma (auto):   120 000             │ ← prikaže iz Normativi
│ Učinkovitost:   100 %               │ ← izračuna sproti
│                                     │
│ Nalog (neob.):  [20012]             │
│ Opombe:         [____________]      │
│                                     │
│      [    SHRANI VNOS    ]          │
└─────────────────────────────────────┘
```

### Obrazec "Zastoj"

```
┌─────────────────────────────────────┐
│  ⚠️ Vnos zastoja                    │
├─────────────────────────────────────┤
│ Datum:        [16.5.2026]           │
│ Stroj:        [▾ 214]               │
│ Opis okvare:  [Zlaman glavač]       │
│ Pogostost:    [1]                   │
│ Trajanje (min): [10]                │
│ Opravljeno delo: [Menjava glavača]  │
│ Napako odpravil: [▾ Postružin]      │
│ LOT materiala: [503285]             │
│                                     │
│      [    SHRANI ZASTOJ    ]        │
└─────────────────────────────────────┘
```

### Obrazec "Odpad"

```
┌─────────────────────────────────────┐
│  🗑️ Vnos odpada                     │
├─────────────────────────────────────┤
│ Datum:        [16.5.2026]           │
│ Stroj:        [▾ CS TP2C + EWM]     │
│ Izdelek:      [▾ Vijak 4x12]        │
│ Koda žice:    [▾ K1275/2,75]        │
│ Teža (kg):    [135]                 │
│ Tip napake:   [▾ Odrez od špic]     │
│ Delavec:      [▾ Matija Postružin]  │
│ LOT žice:     [503285]              │
│ Nalog:        [20012]               │
│                                     │
│      [    SHRANI ODPAD    ]         │
└─────────────────────────────────────┘
```

---

## 4. Tedensko poročilo (skica)

Vodja oddelka klikne "Tedensko poročilo" → izbere teden → dobi:

### Pregled tedna (Pon–Pet, 11.5.–15.5.2026)

**Skupna proizvodnja:** 2.450.000 kos
**Skupna norma:** 2.400.000 kos
**Učinkovitost:** 102 %
**Skupaj odpad:** 480 kg
**Skupaj zastoji:** 1.250 min (20,8 h)

### Po delavcih

| Delavec | Skupaj kos | Povp. učink. | Odpad (kg) | Zastoji (min) |
|---|---|---|---|---|
| Matija Postružin | 580.000 | 105 % | 95 | 300 |
| Simon Jagodič | 510.000 | 98 % | 130 | 450 |
| Danijel Koren | 470.000 | 99 % | 80 | 200 |
| … | | | | |

### Po strojih

| Stroj | Skupaj kos | Norma | Učink. | Št. zastojev | Trajanje |
|---|---|---|---|---|---|
| 214 | 600.000 | 580.000 | 103 % | 5 | 240 min |
| 256 | 540.000 | 500.000 | 108 % | 3 | 360 min |

### Po izdelkih (dimenzijah)

| Izdelek | Količina | Plan tedenski | Odmik |
|---|---|---|---|
| Vijak 5x13,5 | 600.000 | 600.000 | +0 % |
| Vijak 4,5x14,5 | 540.000 | 480.000 | +12 % |

### Top 3 vzroki zastojev

1. Zlaman glavač — 12× (skupaj 120 min)
2. Slab navoj — 4× (skupaj 330 min)
3. Žge vijake — 2× (skupaj 300 min)

### Eksport

Gumb "Izvozi v PDF" in "Pošlji v upravo (email)" — za uradno tedensko poročilo, ki ga vodja odda upravi.

---

## 5. Pravice po vlogi

| Vloga | Lahko vidi | Lahko vnaša |
|---|---|---|
| **Admin** | vse | vse |
| **Vodja oddelka (proizvodnja)** | vse v svojem oddelku | vse v svojem oddelku |
| **Delavec proizvodnje** | svoje dnevne vnose | svoj dnevni vnos + zastoji + odpad |
| **Vodje drugih oddelkov** | svoje + agregati proizvodnje | svoje |
| **Komercialist** | svoje | svoje (kasneje CRM) |

Supabase ima vgrajen Row Level Security (RLS), ki to omogoča avtomatsko brez dodatne kode na frontendu.

---

## 6. Kaj se zgodi v aplikaciji po fazah

### Faza 1 — Proizvodnja modul (najprej)
1. Šifranti (delavci, stroji, izdelki, žice, tipi napak) — uvozim iz lista PODATKI
2. Normativi — uvozim iz lista Normativi
3. Letni plan — uvozim iz Vrednosti (Letni plan vrstica)
4. Obrazci za vnos: proizvodnja, zastoj, odpad
5. Tedensko poročilo (avtomatsko)
6. Pregled vseh vnosov (z možnostjo popravkov za vodjo)
7. Eksport v Excel/PDF

### Faza 2 — širitev na druge oddelke
- Montaža (podoben model proizvodnji)
- Komerciala (CRM)
- Nabava
- Kakovost, Tehnolog, Kadrovska, Računovodstvo, Uprava

---

## 7. Kaj rabim od tebe pred kodiranjem

1. **Potrditev podatkovnega modela** — ali so vse tabele OK ali kaj manjka/odveč?
2. **Potrditev obrazcev** — ali bi delavec res dnevno vnašal proizvodnjo na sebe ali še vedno samo vodja?
3. **Kdo bo prvi pilot vodja?** — kdo bo testiral aplikacijo v živo
4. **Ali shranim ta dokument kot referenco?** — to je zdaj v tvoji mapi `ASsystem Aplikacija`

Ko potrdiš, naredim naslednje korake:
1. Postavim **Supabase projekt** (baza + auth)
2. Postavim **GitHub repo** in **Vercel deploy**
3. Uvozim šifrante iz Excelov
4. Zgradim prvo verzijo proizvodnega obrazca + tedensko poročilo
5. Pokažem ti živo na vercel.app URL-ju
6. Ko potrdiš da je v redu → postaviva domeno app.assystem.si
