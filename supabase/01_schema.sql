-- =====================================================================
-- AS system aplikacija — Supabase shema (verzija 2)
-- Datum: 2026-05-16
-- Modul: Proizvodnja
--
-- KAKO UPORABITI:
--   1. Pojdi v Supabase Dashboard > tvoj projekt > SQL Editor
--   2. Klikni "New query"
--   3. Skopiraj VSEBINO te datoteke
--   4. Klikni "Run" (Ctrl+Enter)
--   5. Če gre vse v redu, zaženi še 02_seed_sifranti.sql za uvoz šifrantov
--
-- SPREMEMBE od v1:
--   - Stroji imajo norma_kos_min (osnova) + operacija + tipi_izdelkov_opis
--   - Razdelili smo segment: sidra → sidra_kovana / sidra_struzena
--   - Nov segment: objemke
--   - Delavci imajo vlogo (vodja/delavec)
-- =====================================================================

-- ČIST START -------------------------------------------------------------
-- Če si že prej zagnala kakšen del te skripte, naslednji blok očisti
-- staro stanje, da lahko poženeš znova brez napak.
-- (Ker še ni resničnih podatkov, je to varno.)

drop view if exists v_tedensko_proizvodnja cascade;

drop table if exists izmet cascade;
drop table if exists zastoji cascade;
drop table if exists odpad cascade;
drop table if exists proizvodnja cascade;
drop table if exists uporabniki cascade;
drop table if exists letni_plan cascade;
drop table if exists urnik cascade;
drop table if exists normativi cascade;            -- iz v1, če obstaja
drop table if exists tipi_napak cascade;
drop table if exists zice cascade;
drop table if exists stroj_izdelki cascade;
drop table if exists izdelki cascade;
drop table if exists stroji cascade;
drop table if exists delavci cascade;

drop function if exists preracunaj_norme_stroja() cascade;
drop function if exists teden_zacetek(date) cascade;

drop type if exists oddelek_enum cascade;
drop type if exists segment_enum cascade;
drop type if exists operacija_enum cascade;
drop type if exists vloga_enum cascade;
drop type if exists vloga_v_proizvodnji_enum cascade;
drop type if exists izmena_enum cascade;
drop type if exists stanje_stroja_enum cascade;
drop type if exists druzina_enum cascade;          -- iz v1, če obstaja

-- ENUMI -------------------------------------------------------------------

create type oddelek_enum as enum (
  'proizvodnja',
  'montaza',
  'komerciala',
  'racunovodstvo',
  'kakovost',
  'tehnolog',
  'kadrovska',
  'uprava',
  'nabava'
);

-- Razdelili sidra na kovana/stružena/gildemeister + dodali objemke
create type segment_enum as enum (
  'vijaki',
  'pini',
  'sidra_kovana',
  'sidra_struzena',
  'sidra_gildemeister',
  'objemke',
  'zicniki'
);

-- Operacija na stroju (iz Borisovega seznama)
create type operacija_enum as enum (
  'kovanje',
  'valjanje',
  'kovanje_in_valjanje',
  'spicenje',
  'stancanje',
  'struzenje',
  'brusenje',
  'drugo'
);

create type vloga_enum as enum (
  'admin',
  'vodja_oddelka',
  'delavec',
  'komercialist',
  'racunovodja'
);

create type vloga_v_proizvodnji_enum as enum (
  'vodja_proizvodnje',
  'delavec'
);

create type izmena_enum as enum (
  'prva',
  'druga',
  'nadure'
);

create type stanje_stroja_enum as enum (
  'aktiven',
  'okvara',
  'se_ne_obratuje',
  'ukinjen'
);

-- ŠIFRANTI ----------------------------------------------------------------

-- Delavci v proizvodnji/montaži
create table delavci (
  id uuid primary key default gen_random_uuid(),
  ime text not null,
  priimek text not null,
  sifra text unique,
  oddelek oddelek_enum not null default 'proizvodnja',
  vloga_v_proizvodnji vloga_v_proizvodnji_enum not null default 'delavec',
  aktiven boolean not null default true,
  ustvarjen_dne timestamptz not null default now()
);

create index idx_delavci_oddelek on delavci(oddelek);

-- Stroji
create table stroji (
  id uuid primary key default gen_random_uuid(),
  sifra text not null unique,             -- npr. "201", "G710"
  naziv text not null,                    -- npr. "SACMA SP01"
  operacija operacija_enum not null default 'drugo',
  segment segment_enum not null,
  norma_kos_min decimal(8,2) not null default 0,  -- OSNOVA: kosov na minuto (npr. 0.70 za ZMAT)
  norma_kos_h integer,                            -- npr. 14.000 (zaokroženo - lahko ročno)
  norma_kos_7h integer,                           -- 1 izmena
  norma_kos_14h integer,                          -- 2 izmeni
  norma_kos_5dni integer,                         -- teden
  norma_kos_22dni integer,                        -- mesec (delovni)
  norma_kos_letno integer,                        -- 220 delovnih dni
  tipi_izdelkov_opis text,                   -- npr. "4x15 PAN, 4x15, 4x12"
  stanje stanje_stroja_enum not null default 'aktiven',
  opomba text,
  ustvarjen_dne timestamptz not null default now()
);

create index idx_stroji_segment on stroji(segment);
create index idx_stroji_stanje on stroji(stanje);

-- Izdelki (vijak 5x13,5; PIN 6190; sidro M8x12; objemka za sidro …)
create table izdelki (
  id uuid primary key default gen_random_uuid(),
  sifra text not null unique,
  ime text not null,
  segment segment_enum not null,
  enota text not null default 'kos',
  aktiven boolean not null default true,
  ustvarjen_dne timestamptz not null default now()
);

create index idx_izdelki_segment on izdelki(segment);

-- Povezava: kateri stroj lahko proizvaja katere izdelke
-- (iz Borisovega stolpca "Tipi vijakov ki se izdelujejo")
create table stroj_izdelki (
  stroj_id uuid not null references stroji(id) on delete cascade,
  izdelek_id uuid not null references izdelki(id) on delete cascade,
  specificna_norma_kos_min integer, -- če stroj ima drugačno normo za ta izdelek
  primary key (stroj_id, izdelek_id)
);

-- Žica (materiali)
create table zice (
  id uuid primary key default gen_random_uuid(),
  koda text not null unique,
  opis text,
  aktivna boolean not null default true,
  ustvarjena_dne timestamptz not null default now()
);

-- Tipi napak (za odpad in zastoje)
create table tipi_napak (
  id uuid primary key default gen_random_uuid(),
  ime text not null unique,
  za_segment segment_enum,
  aktiven boolean not null default true
);

-- PLAN IN URNIK ----------------------------------------------------------

-- Urnik izmen po dnevih (iz lista Normativi: 0=vikend, 1=1 izmena, 2=2 izmeni)
-- En zapis = en dan za celotno proizvodnjo
create table urnik (
  datum date primary key,
  st_izmen smallint not null default 2, -- 0=vikend 1=1 izmena 2=2 izmeni
  opomba text
);

-- Letni plan po izdelku
create table letni_plan (
  id uuid primary key default gen_random_uuid(),
  izdelek_id uuid not null references izdelki(id) on delete restrict,
  leto smallint not null,
  plan_kos bigint not null default 0,
  unique (izdelek_id, leto)
);

-- UPORABNIKI --------------------------------------------------------------

create table uporabniki (
  id uuid primary key references auth.users(id) on delete cascade,
  ime text not null,
  priimek text not null,
  email text not null unique,
  vloga vloga_enum not null default 'delavec',
  oddelek oddelek_enum not null default 'proizvodnja',
  povezan_delavec_id uuid references delavci(id) on delete set null,
  aktiven boolean not null default true,
  ustvarjen_dne timestamptz not null default now()
);

create index idx_uporabniki_email on uporabniki(email);

-- TRANSAKCIJSKE TABELE ----------------------------------------------------

-- GLAVNA TABELA: dnevni vnos proizvodnje
create table proizvodnja (
  id uuid primary key default gen_random_uuid(),
  datum date not null,
  izmena izmena_enum not null,
  delavec_id uuid not null references delavci(id) on delete restrict,
  stroj_id uuid not null references stroji(id) on delete restrict,
  izdelek_id uuid not null references izdelki(id) on delete restrict,
  zica_id uuid references zice(id) on delete set null,
  ure_dela decimal(4,2) not null default 7.0,    -- koliko ur je delavec delal
  kolicina_kos integer not null default 0 check (kolicina_kos >= 0),
  norma_kos integer not null default 0,           -- norma za ta vnos (kos_min * 60 * ure)
  ucinkovitost decimal(6,2) generated always as (
    case when norma_kos > 0 then round(kolicina_kos::decimal / norma_kos * 100, 2) else null end
  ) stored,
  nalog text,
  opombe text,
  potrjeno boolean not null default false,        -- vodja potrdi vnos delavca
  potrdil_id uuid references uporabniki(id) on delete set null,
  potrjeno_dne timestamptz,
  ustvarjen_dne timestamptz not null default now(),
  ustvaril_id uuid references uporabniki(id) on delete set null
);

create index idx_proizvodnja_datum on proizvodnja(datum desc);
create index idx_proizvodnja_delavec on proizvodnja(delavec_id, datum);
create index idx_proizvodnja_stroj on proizvodnja(stroj_id, datum);
create index idx_proizvodnja_izdelek on proizvodnja(izdelek_id, datum);
create index idx_proizvodnja_potrjeno on proizvodnja(potrjeno) where potrjeno = false;

-- Odpad
create table odpad (
  id uuid primary key default gen_random_uuid(),
  datum date not null,
  stroj_id uuid not null references stroji(id) on delete restrict,
  izdelek_id uuid references izdelki(id) on delete restrict,
  zica_id uuid references zice(id) on delete set null,
  zica_kg decimal(10,2) not null check (zica_kg >= 0),
  tip_napake_id uuid references tipi_napak(id) on delete set null,
  napaka_opis text,
  delavec_id uuid references delavci(id) on delete set null,
  lot_zice text,
  nalog text,
  opombe text,
  ustvarjen_dne timestamptz not null default now(),
  ustvaril_id uuid references uporabniki(id) on delete set null
);

create index idx_odpad_datum on odpad(datum desc);
create index idx_odpad_stroj on odpad(stroj_id, datum);

-- Zastoji
create table zastoji (
  id uuid primary key default gen_random_uuid(),
  datum date not null,
  stroj_id uuid not null references stroji(id) on delete restrict,
  opis_okvare text not null,
  pogostost integer not null default 1,
  opravljeno_delo text,
  napako_odpravil_id uuid references delavci(id) on delete set null,
  napako_odpravil_zunanji text,
  trajanje_min integer not null default 0 check (trajanje_min >= 0),
  lot_materiala text,
  opombe text,
  ustvarjen_dne timestamptz not null default now(),
  ustvaril_id uuid references uporabniki(id) on delete set null
);

create index idx_zastoji_datum on zastoji(datum desc);
create index idx_zastoji_stroj on zastoji(stroj_id, datum);

-- Izmet (slabi komadi v proizvodnji)
create table izmet (
  id uuid primary key default gen_random_uuid(),
  datum date not null,
  izdelek_id uuid not null references izdelki(id) on delete restrict,
  stroj_id uuid references stroji(id) on delete set null,
  kolicina_kos integer not null check (kolicina_kos >= 0),
  opombe text,
  ustvarjen_dne timestamptz not null default now(),
  ustvaril_id uuid references uporabniki(id) on delete set null
);

create index idx_izmet_datum on izmet(datum desc);

-- POMOŽNA FUNKCIJA + VIEW -------------------------------------------------

-- Funkcija: vrne začetek tedna (ponedeljek) za podan datum
create or replace function teden_zacetek(d date) returns date as $$
  select d - ((extract(dow from d)::integer + 6) % 7);
$$ language sql immutable;

-- Pogled za tedensko poročilo proizvodnje
create or replace view v_tedensko_proizvodnja as
select
  teden_zacetek(p.datum) as teden_zacetek,
  teden_zacetek(p.datum) + 4 as teden_konec,
  d.id as delavec_id,
  d.ime || ' ' || d.priimek as delavec_polno_ime,
  s.id as stroj_id,
  s.sifra as stroj_sifra,
  s.naziv as stroj_naziv,
  i.id as izdelek_id,
  i.sifra as izdelek_sifra,
  i.ime as izdelek_ime,
  i.segment as segment,
  sum(p.kolicina_kos) as skupaj_kos,
  sum(p.norma_kos) as skupaj_norma,
  sum(p.ure_dela) as skupaj_ur,
  case when sum(p.norma_kos) > 0
    then round(sum(p.kolicina_kos)::decimal / sum(p.norma_kos) * 100, 2)
    else null
  end as povprecna_ucinkovitost,
  count(*) as st_vnosov
from proizvodnja p
join delavci d on d.id = p.delavec_id
join stroji s on s.id = p.stroj_id
join izdelki i on i.id = p.izdelek_id
where extract(dow from p.datum) between 1 and 5
group by 1,2,3,4,5,6,7,8,9,10,11;

-- TRIGGER: ko vstaviš normo_kos_min v stroje, samodejno izračunaj ostale --

create or replace function preracunaj_norme_stroja() returns trigger as $$
begin
  if NEW.norma_kos_min is not null and NEW.norma_kos_min > 0 then
    if NEW.norma_kos_h is null then
      NEW.norma_kos_h := round(NEW.norma_kos_min * 60)::integer;
    end if;
    if NEW.norma_kos_7h is null then
      NEW.norma_kos_7h := round(NEW.norma_kos_min * 60 * 7)::integer;
    end if;
    if NEW.norma_kos_14h is null then
      NEW.norma_kos_14h := round(NEW.norma_kos_min * 60 * 14)::integer;
    end if;
    if NEW.norma_kos_5dni is null then
      NEW.norma_kos_5dni := round(NEW.norma_kos_min * 60 * 14 * 5)::integer;
    end if;
    if NEW.norma_kos_22dni is null then
      NEW.norma_kos_22dni := round(NEW.norma_kos_min * 60 * 14 * 22)::integer;
    end if;
    if NEW.norma_kos_letno is null then
      NEW.norma_kos_letno := round(NEW.norma_kos_min * 60 * 14 * 220)::integer;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_preracunaj_norme
  before insert or update of norma_kos_min on stroji
  for each row execute function preracunaj_norme_stroja();

-- RLS (ROW LEVEL SECURITY) ------------------------------------------------

alter table delavci enable row level security;
alter table stroji enable row level security;
alter table izdelki enable row level security;
alter table stroj_izdelki enable row level security;
alter table zice enable row level security;
alter table tipi_napak enable row level security;
alter table urnik enable row level security;
alter table letni_plan enable row level security;
alter table uporabniki enable row level security;
alter table proizvodnja enable row level security;
alter table odpad enable row level security;
alter table zastoji enable row level security;
alter table izmet enable row level security;

-- Prijavljeni uporabniki berejo vse šifrante
create policy "berem delavce" on delavci for select using (auth.role() = 'authenticated');
create policy "berem stroje" on stroji for select using (auth.role() = 'authenticated');
create policy "berem izdelke" on izdelki for select using (auth.role() = 'authenticated');
create policy "berem stroj_izdelki" on stroj_izdelki for select using (auth.role() = 'authenticated');
create policy "berem zice" on zice for select using (auth.role() = 'authenticated');
create policy "berem tipi_napak" on tipi_napak for select using (auth.role() = 'authenticated');
create policy "berem urnik" on urnik for select using (auth.role() = 'authenticated');
create policy "berem letni_plan" on letni_plan for select using (auth.role() = 'authenticated');

create policy "berem proizvodnjo" on proizvodnja for select using (auth.role() = 'authenticated');
create policy "berem odpad" on odpad for select using (auth.role() = 'authenticated');
create policy "berem zastoje" on zastoji for select using (auth.role() = 'authenticated');
create policy "berem izmet" on izmet for select using (auth.role() = 'authenticated');

create policy "vpisujem proizvodnjo" on proizvodnja for insert with check (auth.role() = 'authenticated');
create policy "vpisujem odpad" on odpad for insert with check (auth.role() = 'authenticated');
create policy "vpisujem zastoje" on zastoji for insert with check (auth.role() = 'authenticated');
create policy "vpisujem izmet" on izmet for insert with check (auth.role() = 'authenticated');

create policy "berem svoj profil" on uporabniki for select using (id = auth.uid());

-- =====================================================================
-- KONEC SHEME v2
-- Naslednji korak: zaženi 02_seed_sifranti.sql za uvoz delavcev/strojev
-- =====================================================================
