create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.member_credentials (
  member_id uuid primary key references public.members(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9._-]{2,29}$'),
  email text not null unique check (email = lower(email) and char_length(email) <= 254),
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.members enable row level security;
alter table public.member_credentials enable row level security;
revoke all on public.members, public.member_credentials from anon, authenticated;
grant select, insert, update, delete on public.members, public.member_credentials to service_role;

create or replace function public.create_caelum_account(
  account_name text,
  account_username text,
  account_email text,
  account_password_hash text
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_member_id uuid;
begin
  insert into public.members (name) values (account_name) returning id into new_member_id;
  insert into public.member_credentials (member_id, username, email, password_hash)
    values (new_member_id, account_username, account_email, account_password_hash);
  return new_member_id;
end;
$$;

revoke all on function public.create_caelum_account(text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_caelum_account(text, text, text, text) to service_role;