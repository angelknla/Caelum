begin;

create table if not exists public.birth_profiles (
  member_id uuid primary key references public.members(id) on delete cascade,
  birth jsonb not null check (jsonb_typeof(birth) = 'object'),
  chart jsonb check (chart is null or jsonb_typeof(chart) = 'object'),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.birth_profiles enable row level security;
revoke all on public.birth_profiles from public, anon, authenticated;
grant select, insert, update, delete on public.birth_profiles to service_role;

commit;