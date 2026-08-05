-- ============================================================
-- Pandai Gadai OJT – Supabase Setup
-- Run this ONCE in the Supabase SQL Editor (supabase.com → project → SQL Editor)
-- ============================================================

-- ── 1. Tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_checklists (
  id               TEXT PRIMARY KEY,
  day              INTEGER NOT NULL,
  date             TEXT NOT NULL,
  fl_id            TEXT NOT NULL,
  milestone_id     TEXT,
  milestone_name   TEXT,
  items            JSONB,
  tasks            JSONB,
  status           TEXT NOT NULL DEFAULT 'not_started',
  submitted_at     TEXT,
  kanit_score      INTEGER,
  kanit_note       TEXT,
  kanit_scored_at  TEXT
);

CREATE TABLE IF NOT EXISTS penaksiran_records (
  id                  TEXT PRIMARY KEY,
  day                 INTEGER NOT NULL,
  date                TEXT NOT NULL,
  fl_id               TEXT NOT NULL,
  barang_type         TEXT NOT NULL,
  barang_description  TEXT NOT NULL,
  fl_estimate         NUMERIC NOT NULL,
  intools_value       NUMERIC,
  accuracy            NUMERIC,
  kanit_score         INTEGER,
  kanit_note          TEXT,
  kanit_scored_at     TEXT
);

CREATE TABLE IF NOT EXISTS assessments (
  id              TEXT PRIMARY KEY,
  fl_id           TEXT NOT NULL,
  day             INTEGER NOT NULL,
  date            TEXT NOT NULL,
  mastery_checks  JSONB DEFAULT '[]'::jsonb,
  answers         JSONB DEFAULT '[]'::jsonb,
  status          TEXT NOT NULL DEFAULT 'not_started',
  submitted_at    TEXT,
  mcq_score       INTEGER
);

CREATE TABLE IF NOT EXISTS final_evaluations (
  id              TEXT PRIMARY KEY,
  fl_id           TEXT NOT NULL,
  kanit_id        TEXT NOT NULL,
  submitted_at    TEXT NOT NULL,
  soft_skills     JSONB DEFAULT '[]'::jsonb,
  attitude_score  INTEGER NOT NULL DEFAULT 0,
  feedback        TEXT NOT NULL DEFAULT '',
  recommendation  TEXT NOT NULL DEFAULT 'tidak_lulus'
);

CREATE TABLE IF NOT EXISTS level2_unlocks (
  fl_id             TEXT PRIMARY KEY,
  kanit_id          TEXT NOT NULL,
  module_decisions  JSONB DEFAULT '{}'::jsonb,
  unlocked_at       TEXT NOT NULL
);

-- ── 2. Disable RLS (demo only) ─────────────────────────────

ALTER TABLE daily_checklists   DISABLE ROW LEVEL SECURITY;
ALTER TABLE penaksiran_records  DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments         DISABLE ROW LEVEL SECURITY;
ALTER TABLE final_evaluations   DISABLE ROW LEVEL SECURITY;
ALTER TABLE level2_unlocks      DISABLE ROW LEVEL SECURITY;

-- ── 3. Auth users (password: demo1234) ────────────────────
-- Creates 6 demo accounts: 5 OJT Frontliner + 1 Kepala Unit
-- NOTE: emails below use @ojt.demo, but Login.tsx's demo buttons currently
-- submit @pandaigadai.com addresses — check which domain your live Supabase
-- project's auth.users table actually has before relying on this list as-is.

DO $$
DECLARE
  rec RECORD;
  uid UUID;
BEGIN
  FOR rec IN (
    SELECT * FROM (VALUES
      ('andi@ojt.demo',  '{"userId":"fl-001"}'::jsonb),
      ('sari@ojt.demo',  '{"userId":"fl-002"}'::jsonb),
      ('budi@ojt.demo',  '{"userId":"fl-003"}'::jsonb),
      ('dewi@ojt.demo',  '{"userId":"fl-004"}'::jsonb),
      ('rizky@pandaigadai.com', '{"userId":"fl-005"}'::jsonb),
      ('melati@pandaigadai.com', '{"userId":"fl-006"}'::jsonb),
      ('kanit@ojt.demo', '{"userId":"kanit-001"}'::jsonb)
    ) AS t(email, meta)
  ) LOOP
    -- Skip if already exists
    SELECT id INTO uid FROM auth.users WHERE email = rec.email;
    IF uid IS NOT NULL THEN CONTINUE; END IF;

    uid := gen_random_uuid();

    INSERT INTO auth.users (
      id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at
    ) VALUES (
      uid, 'authenticated', 'authenticated', rec.email,
      crypt('demo1234', gen_salt('bf')), now(),
      rec.meta, now(), now()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), uid,
      jsonb_build_object('sub', uid::text, 'email', rec.email),
      'email', rec.email, now(), now(), now()
    );
  END LOOP;
END;
$$;

-- ── Done ───────────────────────────────────────────────────
-- Accounts created:
--   andi@ojt.demo    / demo1234  →  Andi Pratama (OJT, Hari 7)
--   sari@ojt.demo    / demo1234  →  Sari Dewi Lestari (OJT, Hari 8)
--   budi@ojt.demo    / demo1234  →  Budi Santoso (OJT, Hari 13)
--   dewi@ojt.demo    / demo1234  →  Dewi Rahmawati (OJT, Hari 13)
--   rizky@pandaigadai.com / demo1234  →  Rizky Ramadhan (OJT, Hari 10)
--   kanit@ojt.demo   / demo1234  →  Kepala Unit (Kanit)
--
-- Data is seeded automatically on first login via the app.
