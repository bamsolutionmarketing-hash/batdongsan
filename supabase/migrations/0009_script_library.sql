-- 0009 Script Node Engine — template library tables (read-only mirror).
-- The engine's source of truth is the in-repo library (lib/script-engine/data);
-- these tables mirror it (seeded by 0010) for the spec's data-of-record,
-- admin editing, and the P2 done-condition. RLS: any authenticated user may
-- read; only admins write.

create table if not exists hook_templates (
  id text primary key,
  family text not null,
  text_template text not null,
  onscreen_text text,
  visual_directive text not null,
  duration_min numeric, duration_max numeric,
  word_min int, word_max int,
  requires_slots text[] not null default '{}',
  optional_slots text[] not null default '{}',
  promise_tags text[] not null default '{}',
  tone_tags text[] not null default '{}',
  platform_fit text[] not null default '{}',
  risk_level text not null default 'low',
  weight numeric not null default 1.0,
  status text not null default 'active'
);

create table if not exists node_templates (
  id text primary key,
  node_type text not null,
  text_template text not null,
  onscreen_text text,
  visual_directive text not null,
  duration_min numeric, duration_max numeric,
  word_min int, word_max int,
  requires_slots text[] not null default '{}',
  optional_slots text[] not null default '{}',
  delivers_tag text,
  funnel text,
  tone_tags text[] not null default '{}',
  platform_fit text[] not null default '{}',
  weight numeric not null default 1.0,
  status text not null default 'active'
);

create table if not exists recipes (
  id text primary key,
  name_vi text not null,
  pillar text not null,
  preferred_hooks text[] not null default '{}',
  allowed_hooks text[] not null default '{}',
  payoff_tags text[] not null default '{}',
  chain jsonb not null
);

create table if not exists compat_rules (
  hook_family text not null,
  content_type text not null references recipes(id) on delete cascade,
  level text not null check (level in ('preferred','allowed','blocked')),
  primary key (hook_family, content_type)
);

create table if not exists slot_registry (
  key text primary key,
  slot_group text not null,
  data_type text not null,
  source_path text,
  formatter text,
  computed_formula text,
  fallback_text text,
  requires_source boolean default false
);

alter table hook_templates enable row level security;
alter table node_templates enable row level security;
alter table recipes        enable row level security;
alter table compat_rules   enable row level security;
alter table slot_registry  enable row level security;

do $$ begin
  perform 1;
  -- readable by any signed-in user; writable by admins only
  drop policy if exists hook_read on hook_templates;
  create policy hook_read on hook_templates for select using (auth.uid() is not null);
  drop policy if exists hook_admin on hook_templates;
  create policy hook_admin on hook_templates for all using (is_admin()) with check (is_admin());

  drop policy if exists node_read on node_templates;
  create policy node_read on node_templates for select using (auth.uid() is not null);
  drop policy if exists node_admin on node_templates;
  create policy node_admin on node_templates for all using (is_admin()) with check (is_admin());

  drop policy if exists recipe_read on recipes;
  create policy recipe_read on recipes for select using (auth.uid() is not null);
  drop policy if exists recipe_admin on recipes;
  create policy recipe_admin on recipes for all using (is_admin()) with check (is_admin());

  drop policy if exists compat_read on compat_rules;
  create policy compat_read on compat_rules for select using (auth.uid() is not null);
  drop policy if exists compat_admin on compat_rules;
  create policy compat_admin on compat_rules for all using (is_admin()) with check (is_admin());

  drop policy if exists slot_read on slot_registry;
  create policy slot_read on slot_registry for select using (auth.uid() is not null);
  drop policy if exists slot_admin on slot_registry;
  create policy slot_admin on slot_registry for all using (is_admin()) with check (is_admin());
end $$;
