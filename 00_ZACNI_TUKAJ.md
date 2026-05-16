# 🚀 AS system aplikacija — začetna navodila

**Datum:** 2026-05-16
**Status:** Faza 1 — postavitev temeljev

---

## 📁 Kaj imaš v tej mapi

```
ASsystem Aplikacija/
├── 00_ZACNI_TUKAJ.md                         ← tale dokument
├── 01_Analiza_Excelov_in_predlog_modela.md   ← celovita analiza Excelov in podatkovni model
└── supabase/
    ├── 01_schema.sql                          ← SQL za vse tabele, indekse, RLS
    └── 02_seed_sifranti.sql                   ← uvoz delavcev/strojev/izdelkov iz tvojih Excelov
```

---

## ✅ Koraki, ki jih opraviš **TI** (na svojem računalniku)

### 1. KORAK — Ustvari Supabase projekt (10 min)

1. Odpri [supabase.com/dashboard](https://supabase.com/dashboard) in se prijavi
2. Klikni zeleni gumb **New project**
3. **Organizacija:** izberi svojo (ali ustvari novo "AS system")
4. **Project name:** `assystem-app`
5. **Database password:** ustvari **močno geslo** (npr. uporabi password manager). **TO GESLO SHRANI — rabila ga boš.**
6. **Region:** izberi `Central EU (Frankfurt)` — najbližje Sloveniji
7. **Pricing plan:** Free (zadosti za začetek)
8. Klikni **Create new project** in počakaj ~2 min, da se postavi

> 💡 Ko se postavi, te bo dashboard pripeljal na "Project Home" stran. Ne zapri tega okna.

### 2. KORAK — Zaženi 01_schema.sql v Supabase (5 min)

1. V Supabase Dashboardu klikni levo navigacijo **SQL Editor** (ikona `</>`)
2. Klikni **+ New query**
3. Odpri datoteko `supabase/01_schema.sql` v svojem urejevalniku (lahko v VS Code, lahko v Notepadu)
4. **Označi vse** (Ctrl+A), **kopiraj** (Ctrl+C)
5. **Prilepi** v Supabase SQL Editor
6. Klikni zeleni gumb **Run** (ali Ctrl+Enter)
7. Spodaj se izpiše `Success. No rows returned` — odlično.

> ⚠️ Če dobiš napako, naredi **screenshot** in mi pošlji. Najpogostejša napaka: že obstoječa tabela. V tem primeru naredi nov projekt (točka 1) ali mi povej.

### 3. KORAK — Preveri 02_seed_sifranti.sql, preden ga zaženeš (10 min)

Ta datoteka uvozi **resnične podatke iz tvojih Excelov:**
- 10 delavcev
- 59 strojev
- 72 izdelkov
- 19 vrst žice
- 117 tipov napak

**ALI**: ker so podatki avtomatsko izvlečeni, jih je smiselno preveriti pred uvozom. Predvsem:

- **Imena delavcev** — preveri, da so pravilno razdeljena na ime + priimek. Primer: "Damir Hudina Hrnić" — ime=Damir, priimek="Hudina Hrnić" (dvojni priimek). Če vidiš napako, popraviš v `.sql` datoteki preden naložiš.
- **Družine strojev** — moja koda je nekatere stroje uvrstila v `pini` namesto v `zicniki` (KOVAŠKA, VALJALKA). Preveri če to ustreza tvoji organizaciji.
- **Izdelki vs stroji** — v lista PODATKI sem stroje in izdelke ločil, vendar so se nekateri nazivi morda zmešali.

> 💡 Najboljši pristop: pošlji `02_seed_sifranti.sql` vodji proizvodnje, naj jo preveri (10 min), in jo nato nalož.

Ko si zadovoljna z vsebino:

1. SQL Editor → **+ New query**
2. Kopiraj vsebino `02_seed_sifranti.sql`
3. Prilepi → **Run**
4. Spodaj se izpiše nekaj kot `Success. 10 rows … 59 rows …`

### 4. KORAK — Preveri da podatki obstajajo

1. V Supabase Dashboardu klikni levo **Table editor**
2. Klikni `delavci` — moraš videti 10 oseb
3. Klikni `stroji` — moraš videti 59 strojev
4. Klikni `izdelki` — moraš videti 72 izdelkov

Če vse to vidiš, **šifranti so v bazi** in baza je nared. 🎉

### 5. KORAK — Vzemi Supabase API ključe (potrebovala jih bom za aplikacijo)

1. V Supabase Dashboardu klikni levo dol ⚙️ **Project settings**
2. Klikni **API**
3. Vidiš:
   - **Project URL** (npr. `https://abcdef.supabase.co`)
   - **API Keys** → `anon public` (dolg niz)
   - **API Keys** → `service_role` (dolg niz, **TAJEN**)

**KOPIRAJ in mi pošlji:**
- ✅ Project URL
- ✅ anon public key

**NE pošlji `service_role` ključa** — to je gesla raven, drži ga skrito.

---

## 🔜 Kaj nadaljujem JAZ, ko mi pošlješ API ključe

Ko mi pošlješ Project URL in anon key, jaz:

1. Ustvarim **Next.js projekt** v tej mapi
2. Povežem ga s Supabase
3. Naredim **prijavno stran** (login z emailom + geslo)
4. Naredim **obrazec za vnos proizvodnje** (mobile-friendly)
5. Naredim **tedensko poročilo** (Pon–Pet, avtomatsko)
6. Ti razložim, kako:
   - Pushaš v GitHub (kreirava nov repo `assystem-app`)
   - Povežeš GitHub z Vercel (avtomatski deploy)
   - Dobiš javni URL kot `assystem-app.vercel.app`
   - Kasneje povežemo `app.assystem.si` na ta URL

---

## ❓ Pogosta vprašanja

**Q: Zakaj ne začnem kar zdaj graditi aplikacije, brez čakanja na API ključe?**
A: Lahko, vendar bi morala potem ti ročno povezati aplikacijo z bazo. Z ključi to naredim jaz in ti samo gledaš, kako deluje.

**Q: Kaj če napišem narobe SQL ali nekaj se pokvari?**
A: V Supabase lahko **kadarkoli izbrišeš tabele** in jih ustvariš znova (ponovno zaženeš `01_schema.sql`). Dokler še ni resničnih podatkov vnesenih, ni nevarnosti.

**Q: Koliko stane Supabase Free?**
A: 0 € do 500 MB baze in 50 000 prijav/mesec. Za AS system bo zadosti dolgo. Ko presežeš, je naslednji plan 25 USD/mesec.

**Q: Kaj če vodja proizvodnje vidi pomanjkljivosti v podatkovnem modelu?**
A: Vse tabele lahko **dodajamo, spreminjamo, brišemo** med razvojem. Zdaj smo v fazi prototipa — vse je elastično. Šele ko aplikacija živi z resničnimi podatki, postanejo spremembe težje.

---

## 📞 Naslednji korak

Po tem, ko opraviš zgornje korake (predvsem 5. — pošlji mi Project URL + anon key), mi napiši v naslednje sporočilo:

```
URL: https://xxx.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI...
```

In jaz takoj postavim Next.js + prve obrazce.

---

**P.S.** Pred zagonom 02_seed_sifranti.sql ti zelo priporočam, da pošlješ tale dokument (00_ZACNI_TUKAJ.md) + 01_Analiza_Excelov_in_predlog_modela.md vodji proizvodnje. Naj on/ona pove, ali manjka kakšna stvar, preden zaklene model.
