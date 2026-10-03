begin;

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  relationship text not null default '' check (char_length(relationship) <= 120),
  birth jsonb not null check (jsonb_typeof(birth) = 'object'),
  chart jsonb check (chart is null or jsonb_typeof(chart) = 'object'),
  consent_confirmed_at timestamptz not null,
  updated_at timestamptz not null default now()
);
create index if not exists people_owner_idx on public.people(member_id, updated_at desc);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  entry_date date not null,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 50000),
  tags text[] not null default '{}',
  sky jsonb check (sky is null or jsonb_typeof(sky) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists journal_owner_idx on public.journal_entries(member_id, entry_date desc, created_at desc);

alter table public.people enable row level security;
alter table public.journal_entries enable row level security;
revoke all on public.people, public.journal_entries from public, anon, authenticated;
grant select, insert, update, delete on public.people, public.journal_entries to service_role;

commit;