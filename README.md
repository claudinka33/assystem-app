# AS system aplikacija

Interna poslovna aplikacija za AS system d.o.o. (veleprodaja vijakov, ASfix, proizvodnja, montaža).

**Modul faze 1:** Proizvodnja.

## Tehnologija

- **Next.js 15** (App Router, TypeScript, Server Actions)
- **Supabase** (PostgreSQL baza, Auth, Row Level Security)
- **Tailwind CSS**
- **Vercel** (hosting + deploy)

## Lokalno zaganjanje (neobvezno)

Če želiš aplikacijo videti pred deployem na Vercel:

```bash
npm install
npm run dev
```

Aplikacija se zažene na `http://localhost:3000`.

## Strukture map

```
ASsystem Aplikacija/
├── app/
│   ├── (app)/           # zaščitene strani (rabi prijavo)
│   │   ├── dashboard/
│   │   └── proizvodnja/
│   │       ├── vnos/    # obrazec za vnos
│   │       └── tedensko/ # tedensko poročilo
│   ├── login/           # prijavna stran
│   └── layout.tsx
├── lib/
│   ├── supabase/        # baza klient (server + client + middleware)
│   └── types/           # TypeScript tipi
├── supabase/            # SQL skripte za bazo
│   ├── 01_schema.sql
│   └── 02_seed_sifranti.sql
├── middleware.ts        # auth middleware
└── package.json
```

## Vrednosti okolja (.env.local)

Že nastavljene. NIKOLI ne pushaj `.env.local` v GitHub (`.gitignore` to že preprečuje).

## Modul Proizvodnja

- **Vnos:** delavec, stroj, izdelek, žica (neobvezno), količina, ure dela. Norma se izračuna avtomatsko iz `stroj.norma_kos_min × 60 × ure`.
- **Tedensko poročilo:** agregati Pon–Pet po delavcu, stroju in izdelku. Navigacija med tedni.
- **Pravice:** Supabase RLS — za zdaj vsi prijavljeni berejo in vnašajo. Kasneje zožimo glede na vlogo.

## Prihodnji moduli

Montaža, CRM (prodaja), Nabava, Računovodstvo, Kakovost, Tehnolog, Kadrovska, Uprava.
