-- =====================================================================
-- AS system: 02_seed_sifranti.sql (verzija 2)
-- Datum: 2026-05-16
-- Vir: Borisov email z Mašinami BOS + popravljen seznam delavcev
--
-- KAKO UPORABITI:
--   Najprej moraš imeti 01_schema.sql že zagnan.
--   Nato:
--   1. Supabase Dashboard > SQL Editor > New query
--   2. Skopiraj vsebino te datoteke
--   3. Run
-- =====================================================================

-- DELAVCI -----------------------------------------------------------------
-- Iz Claudinega popravka (16. maj 2026): trenutni seznam aktivnih delavcev

insert into delavci (ime, priimek, oddelek, vloga_v_proizvodnji) values
  ('Boris',   'Černelč',     'proizvodnja', 'vodja_proizvodnje'),
  ('Janko',   'Augustinčič', 'proizvodnja', 'delavec'),
  ('Mitja',   'Babić',       'proizvodnja', 'delavec'),
  ('Dejan',   'Čutić',       'proizvodnja', 'delavec'),
  ('Danijel', 'Korenini',    'proizvodnja', 'delavec'),
  ('Gregor',  'Koritnik',    'proizvodnja', 'delavec'),
  ('Matija',  'Postružin',   'proizvodnja', 'delavec'),
  ('Danči',   'Šolinc',      'proizvodnja', 'delavec')
on conflict do nothing;

-- STROJI -----------------------------------------------------------------
-- Iz Borisove tabele "Mašine BOS" (16. maj 2026)
-- norma_kos_min je glavna; ostale norme triger izračuna avtomatsko ob INSERT.
-- Kjer norma_kos_min ni jasna, vpišemo 0 in vodja kasneje uredi.

-- === SEGMENT: VIJAKI ===

-- KOVANJE
insert into stroji (sifra, naziv, operacija, segment, norma_kos_min, tipi_izdelkov_opis, stanje) values
  ('201', 'SACMA SP01',         'kovanje', 'vijaki', 233, '4x15 PAN; 4x15; 4x12', 'aktiven'),
  ('202', 'CARLO SALVI TP2C',   'kovanje', 'vijaki', 150, 'M4x8; M4x6,5; M4x10', 'aktiven'),
  ('203', 'CARLO SALVI TP2C',   'kovanje', 'vijaki', 150, '4x15; 4x12; 3,5x20', 'aktiven'),
  ('204', 'CARLO SALVI TP2C',   'kovanje', 'vijaki', 150, '3,5x9; 5x8', 'aktiven'),
  ('205', 'CARLO SALVI TP2CL',  'kovanje', 'vijaki', 150, '4x15; 4x12; M4x8; M4x6,5; 3x40', 'aktiven'),
  ('206', 'CARLO SALVI TP2C',   'kovanje', 'vijaki', 150, 'M4x8; M4x6,5; M4x10', 'aktiven'),
  ('207', 'CARLO SALVI TP2C',   'kovanje', 'vijaki', 150, 'IVER Z 4x12; OKNA 4x20', 'aktiven'),
  ('208', 'CHUN ZU CH-6L',      'kovanje', 'vijaki', 210, 'SMREKCE DO 50MM', 'aktiven'),
  ('209', 'CHUN ZU CH-6LL',     'kovanje', 'vijaki', 210, 'SMREKCE DO 70MM', 'aktiven'),
  ('212', 'CARLO SALVI INTC',   'kovanje', 'vijaki', 133, 'M5x12,5; M5x15', 'aktiven'),
  ('213', 'DAHLIAN DL-1.5T',    'kovanje', 'vijaki', 142, '4,5x14,5', 'aktiven'),
  ('214', 'DAHLIAN DL-1.5T X',  'kovanje', 'vijaki', 130, '5x13,5', 'aktiven'),
  ('215', 'DAHLIAN DL-1.5T',    'kovanje', 'vijaki', 142, '4,5x14,5; 4x30; 3,5x20; OKNA 4x25', 'aktiven'),
  ('211', 'CARLO SALVI INTCL',  'kovanje', 'vijaki', 0,   '!V OKVARI!', 'okvara'),
  ('213b','CARLO SALVI INTCL',  'kovanje', 'vijaki', 0,   '!V OKVARI!', 'okvara')
on conflict do nothing;

-- VALJANJE (oznake stroji v 200 seriji, dodala sem v sifri "_v" da se loči od KOVANJE strojev)
insert into stroji (sifra, naziv, operacija, segment, norma_kos_min, tipi_izdelkov_opis, stanje) values
  ('213_v', 'EWM GW52',         'valjanje', 'vijaki', 133, 'VIJAKI DO L NAVOJA 30MM',  'aktiven'),
  ('215_v', 'EWM GW52',         'valjanje', 'vijaki', 133, 'VIJAKI DO L NAVOJA 30MM',  'aktiven'),
  ('223',   'EWM GW62',         'valjanje', 'vijaki', 133, 'VIJAKI DO L NAVOJA 30MM',  'aktiven'),
  ('202_v', 'EWM GW52',         'valjanje', 'vijaki', 133, 'VIJAKI DO L NAVOJA 30MM',  'aktiven'),
  ('204_v', 'EWM GW52',         'valjanje', 'vijaki', 133, 'VIJAKI DO L NAVOJA 30MM',  'aktiven'),
  ('206_v', 'EWM GW62',         'valjanje', 'vijaki', 133, 'VIJAKI DO L NAVOJA 30MM',  'aktiven'),
  ('208_v', 'EWM GW62',         'valjanje', 'vijaki', 133, 'VIJAKI DO L NAVOJA 50MM',  'aktiven'),
  ('209_v', 'EWM GW62',         'valjanje', 'vijaki', 133, 'VIJAKI DO L NAVOJA 50MM',  'aktiven'),
  ('210',   'HANREZ ROLVY.O',   'valjanje', 'vijaki', 333, NULL,                       'aktiven'),
  ('260',   'DAHLIAN DL-1.5I',  'valjanje', 'vijaki', 150, 'METRIČNI VIJAKI DO L NAVOJA 30MM', 'aktiven'),
  ('261',   'DAHLIAN DL-1.5I',  'valjanje', 'vijaki', 150, 'METRIČNI VIJAKI DO L NAVOJA 30MM', 'aktiven'),
  ('262',   'DAHLIAN DL-1.5I',  'valjanje', 'vijaki', 150, 'METRIČNI VIJAKI DO L NAVOJA 30MM', 'aktiven'),
  ('263',   'DAHLIAN DL-1.5I',  'valjanje', 'vijaki', 150, 'METRIČNI VIJAKI DO L NAVOJA 30MM', 'aktiven'),
  ('264',   'DAHLIAN DL-1.5I',  'valjanje', 'vijaki', 150, 'METRIČNI VIJAKI DO L NAVOJA 30MM', 'aktiven')
on conflict do nothing;

-- ŠPIČENJE
insert into stroji (sifra, naziv, operacija, segment, norma_kos_min, tipi_izdelkov_opis, stanje) values
  ('225', 'DAH LIAN-1606BL', 'spicenje', 'vijaki', 0, '!ŠE NE OBRATUJE!', 'se_ne_obratuje')
on conflict do nothing;

-- === SEGMENT: PINI ===

insert into stroji (sifra, naziv, operacija, segment, norma_kos_min, tipi_izdelkov_opis, stanje) values
  ('101', 'JERN YAO JBF-7B2S', 'kovanje',              'pini', 240, NULL,    'aktiven'),
  ('102', 'JERN YAO JBF-7B2S', 'kovanje',              'pini', 240, NULL,    'aktiven'),
  ('103', 'JERN YAO JBF-7B2S', 'kovanje_in_valjanje',  'pini', 240, 'PINI',  'aktiven'),
  ('104', 'JERN YAO JBF-7B2S', 'kovanje',              'pini', 240, NULL,    'aktiven'),
  ('105', 'JERN YAO JBF-7B2S', 'kovanje',              'pini', 240, NULL,    'aktiven')
on conflict do nothing;

-- === SEGMENT: SIDRA KOVANA ===

insert into stroji (sifra, naziv, operacija, segment, norma_kos_min, tipi_izdelkov_opis, stanje) values
  ('701', 'NEDSCHROEF NB416', 'kovanje_in_valjanje', 'sidra_kovana', 80,  'SIDRA M8-M16 L50-185MM', 'aktiven'),
  ('702', 'NEDSCHROEF NB416', 'kovanje_in_valjanje', 'sidra_kovana', 105, 'SIDRA M8-M26 L50-150MM', 'aktiven')
on conflict do nothing;

-- === SEGMENT: SIDRA STRUŽENA (ZMAT) ===
-- Borisova norma 0,7 kos/min — polje je zdaj decimal(8,2), shranimo natanko.

insert into stroji (sifra, naziv, operacija, segment, norma_kos_min, tipi_izdelkov_opis, stanje) values
  ('703', 'ZMAT', 'struzenje', 'sidra_struzena', 0.70, 'SIDRA M10-M20 DO L600MM', 'aktiven'),
  ('704', 'ZMAT', 'struzenje', 'sidra_struzena', 0.70, 'SIDRA M10-M20 DO L600MM', 'aktiven')
on conflict do nothing;

-- === SEGMENT: OBJEMKE ===

insert into stroji (sifra, naziv, operacija, segment, norma_kos_min, tipi_izdelkov_opis, stanje) values
  ('705', 'SANGIACOMO', 'stancanje', 'objemke', 90, 'OBJEMKE ZA SIDRA', 'aktiven')
on conflict do nothing;

-- === SEGMENT: SIDRA STRUŽENA (Gildemeister) ===

insert into stroji (sifra, naziv, operacija, segment, norma_kos_min, tipi_izdelkov_opis, stanje) values
  ('707', 'STRUŽNICA GILDEMEISTER', 'struzenje', 'sidra_gildemeister', 5, 'SIDRA M6-M16 DO L200MM', 'aktiven'),
  ('708', 'STRUŽNICA GILDEMEISTER', 'struzenje', 'sidra_gildemeister', 5, 'SIDRA M6-M16 DO L200MM', 'aktiven'),
  ('709', 'STRUŽNICA GILDEMEISTER', 'struzenje', 'sidra_gildemeister', 5, 'SIDRA M6-M16 DO L200MM', 'aktiven'),
  ('710', 'STRUŽNICA GILDEMEISTER', 'struzenje', 'sidra_gildemeister', 5, 'SIDRA M6-M16 DO L200MM', 'aktiven')
on conflict do nothing;

-- === SEGMENT: ŽIČNIKI ===
-- Vodi nekdo drug, ne Boris. Norme niso znane — privzeto 0, vodja žičnikov kasneje vpiše.
-- Imena strojev iz Excelov "Spremljanje Žičniki BoS 2026".

insert into stroji (sifra, naziv, operacija, segment, norma_kos_min, tipi_izdelkov_opis, stanje, opomba) values
  ('KOV1', 'Žičnik kovaški stroj 1', 'kovanje', 'zicniki', 0, NULL, 'aktiven', 'Norma rabi vnos vodje žičnikov'),
  ('KOV2', 'Žičnik kovaški stroj 2', 'kovanje', 'zicniki', 0, NULL, 'aktiven', 'Norma rabi vnos vodje žičnikov'),
  ('KOV3', 'Žičnik kovaški stroj 3', 'kovanje', 'zicniki', 0, NULL, 'aktiven', 'Norma rabi vnos vodje žičnikov'),
  ('KOV4', 'Žičnik kovaški stroj 4', 'kovanje', 'zicniki', 0, NULL, 'aktiven', 'Norma rabi vnos vodje žičnikov'),
  ('VAL1', 'Žičnik valjalnik 1',     'valjanje','zicniki', 0, NULL, 'aktiven', 'Norma rabi vnos vodje žičnikov'),
  ('VAL2', 'Žičnik valjalnik 2',     'valjanje','zicniki', 0, NULL, 'aktiven', 'Norma rabi vnos vodje žičnikov'),
  ('VAL3', 'Žičnik valjalnik 3',     'valjanje','zicniki', 0, NULL, 'aktiven', 'Norma rabi vnos vodje žičnikov'),
  ('VAL4', 'Žičnik valjalnik 4',     'valjanje','zicniki', 0, NULL, 'aktiven', 'Norma rabi vnos vodje žičnikov')
on conflict do nothing;

-- IZDELKI ----------------------------------------------------------------
-- Iz Borisove tabele "Tipi vijakov ki se izdelujejo" + iz tabele odpada

insert into izdelki (sifra, ime, segment) values
  -- Vijaki
  ('4x15 PAN',     'Vijak 4x15 PAN',         'vijaki'),
  ('4x15',         'Vijak 4x15',             'vijaki'),
  ('4x12',         'Vijak 4x12',             'vijaki'),
  ('4x12 TRI',     'Vijak 4x12 TRI',         'vijaki'),
  ('4x15 TRI',     'Vijak 4x15 TRI',         'vijaki'),
  ('4x12 IVER Z',  'Vijak 4x12 IVER Z',      'vijaki'),
  ('4x30',         'Vijak 4x30',             'vijaki'),
  ('3,5x9',        'Vijak 3,5x9',            'vijaki'),
  ('3,5x20',       'Vijak 3,5x20',           'vijaki'),
  ('3x40',         'Vijak 3x40',             'vijaki'),
  ('5x8',          'Vijak 5x8',              'vijaki'),
  ('5x13,5',       'Vijak 5x13,5',           'vijaki'),
  ('4,5x14,5',     'Vijak 4,5x14,5',         'vijaki'),
  ('M3x40',        'Vijak M3x40',            'vijaki'),
  ('M4x6,5',       'Vijak M4x6,5',           'vijaki'),
  ('M4x8',         'Vijak M4x8',             'vijaki'),
  ('M4x10',        'Vijak M4x10',            'vijaki'),
  ('M5x8',         'Vijak M5x8',             'vijaki'),
  ('M5x12',        'Vijak M5x12',            'vijaki'),
  ('M5x12,5',      'Vijak M5x12,5',          'vijaki'),
  ('M5x15',        'Vijak M5x15',            'vijaki'),
  ('IVER 3,5x9',   'Vijak IVER 3,5x9',       'vijaki'),
  ('4x45 Smrekica','Vijak 4x45 Smrekica',    'vijaki'),
  ('OKNA 4x20',    'Vijak OKNA 4x20',        'vijaki'),
  ('OKNA 4x25',    'Vijak OKNA 4x25',        'vijaki'),
  ('Smrekce 50mm', 'Smrekce do 50mm',        'vijaki'),
  ('Smrekce 70mm', 'Smrekce do 70mm',        'vijaki'),

  -- Pini (iz tabele odpada in spremljanja PINI)
  ('PIN 6155',     'PIN 6155 (277-6155-000)','pini'),
  ('PIN 6157',     'PIN 6157 (277-6157-000)','pini'),
  ('PIN 6169',     'PIN 6169 (277-6169-000)','pini'),
  ('PIN 6171',     'PIN 6171 (277-6171-000)','pini'),
  ('PIN 6172',     'PIN 6172 (277-6172-000)','pini'),
  ('PIN 6177',     'PIN 6177 (277-6177-000)','pini'),
  ('PIN 6189',     'PIN 6189 (277-6189-000)','pini'),
  ('PIN 6190',     'PIN 6190 (277-6190-000)','pini'),
  ('PIN 6191',     'PIN 6191 (277-6191-000)','pini'),
  ('PIN 6192',     'PIN 6192 (277-6192-000)','pini'),

  -- Kovana sidra
  ('SIDRO M8-M16 L50-185', 'Sidro M8-M16 L50-185mm', 'sidra_kovana'),
  ('SIDRO M8-M26 L50-150', 'Sidro M8-M26 L50-150mm', 'sidra_kovana'),

  -- Stružena sidra (ZMAT)
  ('SIDRO M10-M20 L600',   'Sidro M10-M20 do L600mm', 'sidra_struzena'),

  -- Stružena sidra (Gildemeister)
  ('SIDRO M6-M16 L200',    'Sidro M6-M16 do L200mm',  'sidra_gildemeister'),

  -- Objemke
  ('OBJEMKA-SIDRO',        'Objemka za sidra',        'objemke')
on conflict do nothing;

-- ŽICE -------------------------------------------------------------------
-- Iz tabele odpada (lista PODATKI in vnosov)

insert into zice (koda) values
  ('fi 3.20'),      ('fi 3.25'),      ('fi 3.46'),
  ('K1240/2,40'),   ('K1247/2,47'),   ('K1250/2,50'),
  ('K1261/2,60'),   ('K1275/2,75'),   ('K1287/2,87'),
  ('K1295/2,95'),   ('K1300/3'),      ('K1320/3,20'),
  ('K1320-1-1/3,20'), ('K1325/3,25'), ('K1346/3,41'),
  ('K1346/3,46'),   ('K1348/3,48'),   ('K1398-1/3,72'),
  ('K1430/4,36'),   ('K1436/4,36'),   ('K1439/4,36')
on conflict do nothing;

-- TIPI NAPAK -------------------------------------------------------------
-- Iz tabele odpada (NAPAKA stolpec) + iz Zastojev (Opis okvare)

insert into tipi_napak (ime, za_segment) values
  ('Odrez od špic',       'vijaki'),
  ('Slabi komadi',        'vijaki'),
  ('Zlaman glavač',       'vijaki'),
  ('Pokajo glave',        'vijaki'),
  ('Slab navoj',          'vijaki'),
  ('Slab navoj (DN)',     'vijaki'),
  ('Žge vijake',          'vijaki'),
  ('Zažgani vijaki',      'vijaki'),
  ('Pre dolgi komadi',    'vijaki'),
  ('Zabita proga',        'vijaki'),
  ('Zlaman šeraf',        'vijaki'),
  ('Ni olja v mašini',    NULL),
  ('Nastavitev stroja',   NULL),
  ('Čakanje mašine',      NULL),
  ('Ni vijakov za vstop', NULL),
  ('Menjava glavača',     NULL),
  ('Menjava noža',        NULL),
  ('Menjava valjčkov',    NULL),
  ('Dolivanje olja',      NULL),
  ('Čiščenje stroja',     NULL),
  ('Slabo rebričenje',    'pini')
on conflict do nothing;

-- =====================================================================
-- KONEC SEED v2
-- Skupaj: 8 delavcev, 46 strojev (38 Borisovih + 8 žičnikov), 42 izdelkov, 21 vrst žice, 21 tipov napak
-- =====================================================================
