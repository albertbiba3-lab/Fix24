-- Fix24 phase 2: auth roles and profile ownership
-- Non-destructive migration. Existing professionals remain untouched.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('client', 'professional', 'admin');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'professional_verification_status') then
    create type public.professional_verification_status as enum (
      'unverified',
      'pending',
      'approved',
      'rejected',
      'suspended'
    );
  end if;
end $$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'client',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can update own basic profile" on public.user_profiles;
create policy "Users can update own basic profile"
on public.user_profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select role from public.user_profiles where id = auth.uid())
);

drop policy if exists "Users can create own profile" on public.user_profiles;
create policy "Users can create own profile"
on public.user_profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role in ('client', 'professional')
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
on public.user_profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update all profiles" on public.user_profiles;
create policy "Admins can update all profiles"
on public.user_profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  requested_role := case
    when new.raw_user_meta_data->>'role' = 'professional' then 'professional'::public.app_role
    else 'client'::public.app_role
  end;

  insert into public.user_profiles (id, role, full_name, phone)
  values (
    new.id,
    requested_role,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

do $$
begin
  if to_regclass('public.professionals') is not null then
    alter table public.professionals
      add column if not exists user_id uuid references auth.users(id) on delete set null;

    alter table public.professionals
      add column if not exists verification_status public.professional_verification_status
      not null default 'unverified';

    alter table public.professionals
      add column if not exists is_active boolean not null default true;
  end if;
end $$;

create index if not exists user_profiles_role_idx
  on public.user_profiles(role);

do $$
begin
  if to_regclass('public.professionals') is not null then
    execute 'create index if not exists professionals_user_id_idx on public.professionals(user_id)';
  end if;
end $$;
