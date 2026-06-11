-- 0018 Customers — the sale's lead pipeline. Persists what the discovery /
-- affordability engines compute (today it all evaporates on reload): contact,
-- lead score + tier (Nóng/Ấm/Nguội), income read, raw discovery answers and the
-- affordability snapshot, plus follow-up state so "khách nóng" never goes cold
-- silently. Owner-only rows (sale's private book — never shared, never public).
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  phone text,
  source text, -- zalo | facebook | tiktok | gioi_thieu | quang_cao | khac
  project_id uuid references projects(id) on delete set null,
  status text not null default 'moi'
    check (status in ('moi','dang_cham','da_hen','da_coc','da_chot','ngung')),
  lead_score int check (lead_score between 0 and 100),
  lead_tier text check (lead_tier in ('nong','am','nguoi')),
  income_low bigint,
  income_high bigint,
  discovery jsonb, -- {answers, summary, nextActions} from the discovery engine
  assessment jsonb, -- affordability snapshot (maxLoan, verdict…) when assessed
  note text,
  next_followup_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_customers_user_updated on customers(user_id, updated_at desc);
create index if not exists idx_customers_user_followup on customers(user_id, next_followup_at);

alter table customers enable row level security;
drop policy if exists customers_rw on customers;
create policy customers_rw on customers for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
