# 🚀 Deploy navodila — od kode do živega URL-ja

**Datum:** 2026-05-16
**Status:** Aplikacija je pripravljena za deploy

---

## Kaj je v mapi zdaj

Imaš popolno Next.js aplikacijo:

- `app/` — strani (prijava, dashboard, vnos proizvodnje, tedensko poročilo)
- `lib/supabase/` — povezava na tvojo bazo
- `lib/types/` — TypeScript tipi za bazo
- `middleware.ts` — varuje strani (kdor ni prijavljen → /login)
- `package.json` — knjižnice (Next.js, Supabase, Tailwind)
- `.env.local` — tvoja Supabase ključa (TAJNO, ne v GitHub)
- `.gitignore` — preprečuje commit `.env.local`, `node_modules` itd.

---

## Možnost A: deploy direktno preko Vercel (priporočeno, najhitreje)

Ne rabiš lokalnega zagona. Aplikacija gre direktno na Vercel + GitHub.

### 1. Ustvari GitHub repo (3 min)

1. Odpri [github.com/new](https://github.com/new)
2. **Repository name:** `assystem-app`
3. **Description:** `Interna poslovna aplikacija AS system`
4. Izberi **Private** (priporočeno, ker imaš tajne ključe v projektu)
5. NE označi "Add a README file" (že ga imamo)
6. NE označi gitignore (že ga imamo)
7. Klikni **Create repository**

GitHub ti pokaže stran z navodili — **shrani jo, takoj se vrni v naša navodila.**

### 2. Push kodo v GitHub

Imaš dve poti:

**A.1 — Z GitHub Desktop (najlažje, brez ukazne vrstice):**

1. Naloži [GitHub Desktop](https://desktop.github.com/) (Mac) če ga še nimaš
2. Odpri, prijavi se z GitHub računom
3. File → **Add Local Repository** → izberi mapo `ASsystem Aplikacija`
4. Če reče "Not a Git repository", klikni **"create a repository"** link
5. Repository name: `assystem-app`, klikni **Create Repository**
6. Klikni **Publish repository** zgoraj desno
7. Pomembno: **odznači** "Keep this code private" če želiš public (priporočam pustiti **kljukico** za privatno)
8. Klikni **Publish Repository**

GitHub Desktop bo pushal vse datoteke. Po nekaj sekundah preveri na github.com/tvoj-username/assystem-app — vidiš datoteke.

**A.2 — Z ukazno vrstico (če imaš git nameščen):**

```bash
cd "/Users/claudinka/Documents/Claude/Projects/ASsystem Aplikacija"
git init
git add .
git commit -m "Inicijalna verzija AS system aplikacije"
git branch -M main
git remote add origin https://github.com/TVOJ-USERNAME/assystem-app.git
git push -u origin main
```

> ⚠️ **Preveri** da `.env.local` NI v commitu (`.gitignore` to že izloči). Na GitHub strani v `assystem-app` repo NE smeš videti datoteke `.env.local`.

### 3. Deploy na Vercel (5 min)

1. Odpri [vercel.com/new](https://vercel.com/new) (prijavljena v Vercel)
2. Vidiš seznam svojih GitHub repov → najdi **`assystem-app`** → klikni **Import**
3. **Configure Project:**
   - **Project Name:** `assystem-app` (ali kar želiš)
   - **Framework Preset:** Next.js (samodejno zaznano)
   - **Root Directory:** pusti privzeto (./).
4. **Environment Variables** — zelo pomembno! Klikni razširi to sekcijo:
   - Dodaj prvo:
     - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
     - **Value:** `https://zcnpyiohclrbzpodjxzd.supabase.co`
   - Dodaj drugo:
     - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbnB5aW9oY2xyYnpwb2RqeHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NDA1MjMsImV4cCI6MjA5NDUxNjUyM30.AqtO0X44XjFffznfPYdqmdy_8CrN_ZwA4N83U7UyFdE`
5. Klikni **Deploy**

Vercel bo:
- naložil tvoje datoteke
- zagnal `npm install` (cca 1 min)
- zgradil aplikacijo (cca 1 min)
- objavil na javnem URL-ju

Dobiš nekaj kot `https://assystem-app.vercel.app`.

### 4. Prijavi se in testiraj (5 min)

1. Odpri tvoj Vercel URL
2. Boš preusmerjena na `/login`
3. Klikni **Ustvari nov račun**
4. Vpiši svoj email + geslo (min. 6 znakov)
5. Preveri svoj email — Supabase ti pošlje potrditveno povezavo
6. Klikni povezavo → spet vpiši email + geslo → **Prijava**
7. Si v aplikaciji! Klikni **Vnos proizvodnje**
8. Naredi testni vnos:
   - Datum: današnji
   - Izmena: 1. izmena
   - Delavec: Boris Černelč
   - Stroj: 201 — SACMA SP01
   - Izdelek: Vijak 4x15 PAN
   - Ure dela: 7
   - Količina: 95000
   - Klik **Shrani vnos**
9. Pojdi na **Tedensko poročilo** — videti moraš agregat

🎉 **AS system aplikacija je živa!**

---

## Možnost B: deploy z lokalnim zagonom prej (za vidne rezultate na svojem računalniku)

Če želiš najprej videti aplikacijo lokalno preden gre v svet:

```bash
cd "/Users/claudinka/Documents/Claude/Projects/ASsystem Aplikacija"
npm install   # ~1-2 min, naloži vse knjižnice
npm run dev   # zažene lokalni strežnik
```

Odpri http://localhost:3000

Ko si zadovoljna, sledi koraku 1 v Možnosti A (GitHub + Vercel).

---

## Pogosta vprašanja

**Q: Email potrditveno povezavo lahko izklopim?**
A: Da. V Supabase Dashboardu → Authentication → Providers → Email → odznači "Confirm email". Potem lahko takoj uporabiš nov račun brez čakanja na email.

**Q: Kako dodam še uporabnike?**
A: Vsak uporabnik klikne "Ustvari nov račun" na prijavni strani. Vsi prijavljeni dobijo enak dostop (za zdaj). Kasneje uvedemo vloge.

**Q: Kako pa app.assystem.si?**
A: Ko aplikacija deluje na vercel.app URL-ju in si zadovoljna, gremo na to. V Vercel projektu → Settings → Domains → dodam `app.assystem.si`, in pri tvojem registrarju ASsystem domene (npr. GoDaddy, Namecheap) dodava CNAME zapis. Po cca 1 uri DNS propagacije bo `app.assystem.si` kazal na tvojo aplikacijo. Naredim z ti, ko bomo prišli do tega koraka.

**Q: Vercel mi pokaže napako pri buildu.**
A: Skopiraj točen text napake in mi pošlji. Najpogosteje gre za manjkajočo env variablo ali typo. Hitro popravim.

**Q: Kaj pa odpad in zastoji? Niso v obrazcih.**
A: V tej prvi verziji imamo samo "Vnos proizvodnje" in "Tedensko poročilo". Odpad in zastoji bom dodala v naslednji iteraciji, ko boš preverila prvo verzijo. Tabele v bazi že obstajajo.

---

## Datoteke za nadaljevanje

- [00_ZACNI_TUKAJ.md](./00_ZACNI_TUKAJ.md) — kako si postavila Supabase (referenca)
- [01_Analiza_Excelov_in_predlog_modela.md](./01_Analiza_Excelov_in_predlog_modela.md) — celovita analiza
- [02_DEPLOY_NAVODILA.md](./02_DEPLOY_NAVODILA.md) — tale datoteka
