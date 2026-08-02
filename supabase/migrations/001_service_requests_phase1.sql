-- Fix24 phase 1: client service requests
-- Non-destructive migration. It does not rename or remove existing tables.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'service_request_status') then
    create type public.service_request_status as enum (
      'draft',
      'open',
      'quoted',
      'booked',
      'in_progress',
      'awaiting_confirmation',
      'completed',
      'cancelled',
      'disputed',
      'resolved'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'service_request_urgency') then
    create type public.service_request_urgency as enum (
      'normal',
      'urgent',
      'emergency'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'pricing_preference') then
    create type public.pricing_preference as enum (
      'fixed_price',
      'on_site_check'
    );
  end if;
end $$;

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  description text not null,
  city text not null,
  area text,
  preferred_date date,
  preferred_time text,
  urgency public.service_request_urgency not null default 'normal',
  budget_min numeric(10, 2),
  budget_max numeric(10, 2),
  pricing_preference public.pricing_preference not null default 'on_site_check',
  status public.service_request_status not null default 'open',
  client_phone text,
  address_details text,
  selected_professional_id uuid,
  selected_offer_id uuid,
  completed_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_requests_budget_order check (
    budget_min is null
    or budget_max is null
    or budget_min <= budget_max
  )
);

create table if not exists public.service_request_photos (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (request_id, storage_path)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_service_requests_updated_at on public.service_requests;
create trigger set_service_requests_updated_at
before update on public.service_requests
for each row execute function public.set_updated_at();

create index if not exists service_requests_client_id_idx
  on public.service_requests(client_id);

create index if not exists service_requests_matching_idx
  on public.service_requests(category, city, status);

create index if not exists service_request_photos_request_id_idx
  on public.service_request_photos(request_id);

alter table public.service_requests enable row level security;
alter table public.service_request_photos enable row level security;

drop policy if exists "Clients can read own service requests" on public.service_requests;
create policy "Clients can read own service requests"
on public.service_requests
for select
to authenticated
using (client_id = auth.uid());

drop policy if exists "Clients can create own service requests" on public.service_requests;
create policy "Clients can create own service requests"
on public.service_requests
for insert
to authenticated
with check (client_id = auth.uid());

drop policy if exists "Clients can update own editable requests" on public.service_requests;
create policy "Clients can update own editable requests"
on public.service_requests
for update
to authenticated
using (
  client_id = auth.uid()
  and status in ('draft', 'open', 'cancelled')
)
with check (
  client_id = auth.uid()
);

drop policy if exists "Clients can read own request photos" on public.service_request_photos;
create policy "Clients can read own request photos"
on public.service_request_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.service_requests sr
    where sr.id = service_request_photos.request_id
      and sr.client_id = auth.uid()
  )
);

drop policy if exists "Clients can create own request photos" on public.service_request_photos;
create policy "Clients can create own request photos"
on public.service_request_photos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.service_requests sr
    where sr.id = service_request_photos.request_id
      and sr.client_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('request-photos', 'request-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "Clients can upload request photos" on storage.objects;
create policy "Clients can upload request photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'request-photos'
  and exists (
    select 1
    from public.service_requests sr
    where sr.client_id = auth.uid()
      and sr.id::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "Clients can read request photos" on storage.objects;
create policy "Clients can read request photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'request-photos'
  and exists (
    select 1
    from public.service_requests sr
    where sr.client_id = auth.uid()
      and sr.id::text = (storage.foldername(name))[1]
  )
);
