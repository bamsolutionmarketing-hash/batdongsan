-- M0/M1 — MVP schema (multi-tenant subset of MASTER_ROADMAP §6 / MVP §4)
-- org_id + RLS from day one so B2B expansion needs no refactor.

create extension if not exists "pgcrypto";

-- Organisations (one per brokerage/developer tenant) ------------------------
create table if not exists orgs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Profiles map auth.users -> org + role -------------------------------------
create table if not exists profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  org_id      uuid references orgs (id) on delete set null,
  role        text not null default 'member' check (role in ('admin', 'member')),
  created_at  timestamptz not null default now()
);

-- Projects (structured knowledge) -------------------------------------------
create table if not exists projects (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references orgs (id) on delete cascade,
  slug            text not null,
  name            text not null,
  developer       text,
  district        text,
  city            text,
  segment         text,
  status          text,
  price_per_sqm_m numeric,
  attributes      jsonb not null default '{}'::jsonb,   -- amenities[], highlights[]
  visibility      text not null default 'org' check (visibility in ('org', 'public')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (org_id, slug)
);

-- Uploaded source files ------------------------------------------------------
create table if not exists documents (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs (id) on delete cascade,
  project_id    uuid references projects (id) on delete cascade,
  storage_path  text not null,
  filename      text,
  mime          text,
  content_hash  text,
  status        text not null default 'pending' check (status in ('pending', 'parsed', 'error')),
  created_at    timestamptz not null default now()
);

-- Rule-based extraction results (with provenance) ---------------------------
create table if not exists extractions (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references orgs (id) on delete cascade,
  document_id  uuid not null references documents (id) on delete cascade,
  project_id   uuid references projects (id) on delete cascade,
  field        text not null,
  value        text,
  source_span  text,
  confidence   numeric,
  status       text not null default 'suggested' check (status in ('suggested', 'confirmed', 'rejected')),
  created_at   timestamptz not null default now()
);

-- Generated lead-gen content -------------------------------------------------
create table if not exists content_suggestions (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references orgs (id) on delete cascade,
  project_id     uuid not null references projects (id) on delete cascade,
  format         text not null,                 -- facebook_post | short_caption
  rendered       jsonb not null default '{}'::jsonb,
  used_facts     jsonb not null default '{}'::jsonb,
  missing_slots  text[] not null default '{}',
  status         text not null default 'suggested',
  edited_body    text,
  created_at     timestamptz not null default now()
);

-- Sales leads from the "contact to buy" form (manual billing) ---------------
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  org_name    text,
  contact     text not null,
  message     text,
  seats       int,
  created_at  timestamptz not null default now()
);

create index if not exists idx_projects_org on projects (org_id);
create index if not exists idx_documents_org on documents (org_id);
create index if not exists idx_extractions_doc on extractions (document_id);
create index if not exists idx_content_project on content_suggestions (project_id);
