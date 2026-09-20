-- Baseline for a new installation. Existing professional records and IDs are preserved.
create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text,
  profession text not null,
  category text,
  city text not null,
  phone text not null,
  email text,
  whatsapp text,
  years_experience integer,
  website text,
  facebook text,
  instagram text,
  profile_image text,
  cover_image text,
  description text,
  verified boolean not null default false,
  is_premium boolean not null default false,
  rating numeric not null default 0,
  reviews integer not null default 0,
  created_at timestamptz not null default now()
);
