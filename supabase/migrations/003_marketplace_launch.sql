begin;
-- Additive data changes; legacy professional IDs and records remain intact.
alter table public.professionals add column if not exists verified boolean not null default false;
alter table public.professionals add column if not exists is_premium boolean not null default false;
alter table public.professionals add column if not exists rating numeric not null default 0;
alter table public.professionals add column if not exists reviews integer not null default 0;
alter table public.professionals alter column verified set default false;
alter table public.professionals alter column is_premium set default false;
alter table public.professionals alter column rating type numeric using rating::numeric;
alter table public.professionals alter column rating set default 0;
alter table public.professionals alter column reviews set default 0;
create unique index if not exists professionals_owner_unique on public.professionals(user_id) where user_id is not null;
alter table public.service_requests add column if not exists selected_provider_user_id uuid references auth.users(id);

create table if not exists public.service_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  professional_user_id uuid not null references auth.users(id),
  amount numeric(10,2) not null check(amount > 0),
  message text not null check(length(trim(message)) between 10 and 2000),
  created_at timestamptz not null default now(),
  unique(request_id, professional_user_id)
);
create table if not exists public.service_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id),
  professional_user_id uuid not null references auth.users(id),
  client_id uuid not null references auth.users(id),
  rating integer not null check(rating between 1 and 5),
  comment text not null check(length(trim(comment)) between 10 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists offers_provider_idx on public.service_offers(professional_user_id);
create index if not exists requests_provider_idx on public.service_requests(selected_provider_user_id);
create index if not exists reviews_provider_idx on public.service_reviews(professional_user_id);

-- Backfill account rows for existing users; never trust a metadata admin claim.
insert into public.user_profiles(id,role,full_name,phone)
select id, case when raw_user_meta_data->>'role'='professional' then 'professional'::public.app_role else 'client'::public.app_role end,
raw_user_meta_data->>'full_name', raw_user_meta_data->>'phone' from auth.users
on conflict(id) do nothing;

-- Remove obsolete table policies so permissive legacy policies cannot bypass ownership.
do $$ declare p record; begin
  for p in select tablename, policyname from pg_policies where schemaname='public'
    and tablename in ('professionals','user_profiles','service_requests','service_request_photos','service_offers','service_reviews')
  loop execute format('drop policy %I on public.%I',p.policyname,p.tablename); end loop;
end $$;
alter table public.professionals enable row level security;
alter table public.service_offers enable row level security;
alter table public.service_reviews enable row level security;
create policy profiles_read on public.user_profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy profiles_edit on public.user_profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
revoke all on public.user_profiles from anon,authenticated;
grant select on public.user_profiles to authenticated;
grant update(full_name,phone) on public.user_profiles to authenticated;

create policy professionals_read on public.professionals for select to anon,authenticated
 using((is_active and verification_status<>'suspended') or user_id=auth.uid() or public.is_admin());
create policy professionals_insert on public.professionals for insert to authenticated
 with check(user_id=auth.uid() and is_active and not verified and not is_premium and verification_status='unverified' and coalesce(rating,0)=0 and coalesce(reviews,0)=0);
create policy professionals_edit on public.professionals for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
revoke all on public.professionals from anon,authenticated;
grant select on public.professionals to anon,authenticated;
grant insert(user_id,name,company_name,profession,category,city,phone,email,whatsapp,years_experience,website,facebook,instagram,profile_image,cover_image,description) on public.professionals to authenticated;
grant update(name,company_name,profession,category,city,phone,email,whatsapp,years_experience,website,facebook,instagram,profile_image,cover_image,description) on public.professionals to authenticated;
-- Support existing integer IDs as well as UUID IDs.
do $$ declare seq text; begin seq:=pg_get_serial_sequence('public.professionals','id'); if seq is not null then execute format('grant usage on sequence %s to authenticated',seq); end if; end $$;

create policy requests_read on public.service_requests for select to authenticated using(client_id=auth.uid() or selected_provider_user_id=auth.uid());
create policy requests_insert on public.service_requests for insert to authenticated
 with check(client_id=auth.uid() and status='open' and selected_provider_user_id is null and selected_offer_id is null and selected_professional_id is null and completed_confirmed_at is null);
revoke all on public.service_requests from anon,authenticated;
grant select on public.service_requests to authenticated;
grant insert(client_id,category,title,description,city,area,preferred_date,preferred_time,urgency,budget_min,budget_max,pricing_preference,status,client_phone,address_details) on public.service_requests to authenticated;
create policy photos_read on public.service_request_photos for select to authenticated using(exists(select 1 from public.service_requests r where r.id=request_id and (r.client_id=auth.uid() or r.selected_provider_user_id=auth.uid())));
create policy photos_insert on public.service_request_photos for insert to authenticated with check(exists(select 1 from public.service_requests r where r.id=request_id and r.client_id=auth.uid() and r.status in ('open','quoted')) and split_part(storage_path,'/',1)=request_id::text);
revoke all on public.service_request_photos from anon,authenticated;
grant select,insert on public.service_request_photos to authenticated;
create policy offers_read on public.service_offers for select to authenticated using(professional_user_id=auth.uid() or exists(select 1 from public.service_requests r where r.id=request_id and r.client_id=auth.uid()));
revoke all on public.service_offers from anon,authenticated;
grant select on public.service_offers to authenticated;
create policy reviews_read on public.service_reviews for select to anon,authenticated using(true);
revoke all on public.service_reviews from anon,authenticated;
grant select(id,request_id,professional_user_id,rating,comment,created_at) on public.service_reviews to anon,authenticated;

create or replace function public.fix24_normalize(value text) returns text language sql immutable set search_path=public as $$ select lower(trim(translate(coalesce(value,''),'ëËçÇ','eEcC'))) $$;
create or replace function public.validate_fix24_request() returns trigger language plpgsql set search_path=public as $$
begin
 if length(trim(new.title)) not between 8 and 160 or length(trim(new.description)) not between 20 and 3000 or length(trim(new.city)) not between 1 and 80 or new.category not in ('Elektricist','Hidraulik','Mekanik','Bojaxhi') then raise exception 'FIX24: Plotëso të dhënat e kërkesës.'; end if;
 if coalesce(new.budget_min,0)<0 or coalesce(new.budget_max,0)<0 then raise exception 'FIX24: Buxheti nuk mund të jetë negativ.'; end if;
 return new;
end $$;
drop trigger if exists validate_fix24_request on public.service_requests;
create trigger validate_fix24_request before insert on public.service_requests for each row execute function public.validate_fix24_request();

-- Matching deliberately omits client identity, phone, address and photo paths.
create or replace function public.matching_requests() returns table(
 id uuid,title text,description text,category text,city text,area text,preferred_date date,preferred_time text,urgency public.service_request_urgency,budget_min numeric,budget_max numeric,status public.service_request_status,created_at timestamptz
) language sql stable security definer set search_path=public as $$
 select r.id,r.title,r.description,r.category,r.city,r.area,r.preferred_date,r.preferred_time,r.urgency,r.budget_min,r.budget_max,r.status,r.created_at
 from public.service_requests r where r.status in ('open','quoted') and r.client_id<>auth.uid()
 and exists(select 1 from public.professionals p where p.user_id=auth.uid() and p.is_active and p.verification_status<>'suspended'
 and public.fix24_normalize(p.city)=public.fix24_normalize(r.city) and public.fix24_normalize(p.profession)=public.fix24_normalize(r.category)) order by r.created_at desc;
$$;
create or replace function public.submit_offer(request_id uuid,offer_amount numeric,offer_message text) returns uuid language plpgsql security definer set search_path=public as $$
declare r public.service_requests; offer uuid; begin
 select * into r from public.service_requests where id=request_id for update;
 if auth.uid() is null or r.id is null or r.client_id=auth.uid() or r.status not in ('open','quoted') then raise exception 'FIX24: Kërkesa nuk pranon oferta.'; end if;
 if not exists(select 1 from public.professionals p where p.user_id=auth.uid() and p.is_active and p.verification_status<>'suspended' and public.fix24_normalize(p.city)=public.fix24_normalize(r.city) and public.fix24_normalize(p.profession)=public.fix24_normalize(r.category)) then raise exception 'FIX24: Kërkesa nuk përputhet me profilin tënd.'; end if;
 if offer_amount is null or offer_amount<=0 or offer_amount>99999999 or length(trim(coalesce(offer_message,''))) not between 10 and 2000 then raise exception 'FIX24: Vendos çmimin dhe përshkrimin e ofertës.'; end if;
 insert into public.service_offers(request_id,professional_user_id,amount,message) values(r.id,auth.uid(),offer_amount,trim(offer_message)) returning id into offer;
 update public.service_requests set status='quoted' where id=r.id;
 return offer;
exception when unique_violation then raise exception 'FIX24: Ke dërguar tashmë një ofertë për këtë kërkesë.';
end $$;
create or replace function public.accept_offer(offer_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare o public.service_offers; r public.service_requests; begin
 select * into o from public.service_offers where id=offer_id;
 select * into r from public.service_requests where id=o.request_id for update;
 if auth.uid() is null or r.id is null or r.client_id<>auth.uid() or r.status not in ('open','quoted') then raise exception 'FIX24: Kjo ofertë nuk mund të pranohet.'; end if;
 if not exists(select 1 from public.professionals p where p.user_id=o.professional_user_id and p.is_active and p.verification_status<>'suspended') then raise exception 'FIX24: Profesionisti nuk është aktualisht aktiv.'; end if;
 update public.service_requests set status='booked',selected_offer_id=o.id,selected_provider_user_id=o.professional_user_id where id=r.id;
end $$;
create or replace function public.transition_request(request_id uuid,next_status text) returns void language plpgsql security definer set search_path=public as $$
declare r public.service_requests; allowed boolean:=false; begin
 select * into r from public.service_requests where id=request_id for update;
 if auth.uid() is null or r.id is null then raise exception 'FIX24: Kërkesa nuk u gjet.'; end if;
 if r.client_id=auth.uid() then
   allowed := (next_status='cancelled' and r.status in ('open','quoted','booked')) or (next_status='completed' and r.status='awaiting_confirmation');
 elsif r.selected_provider_user_id=auth.uid() then
   allowed := (next_status='in_progress' and r.status='booked') or (next_status='awaiting_confirmation' and r.status='in_progress');
 end if;
 if not allowed then raise exception 'FIX24: Ky ndryshim nuk lejohet për këtë punë.'; end if;
 update public.service_requests set status=next_status::public.service_request_status,completed_confirmed_at=case when next_status='completed' then now() else completed_confirmed_at end where id=r.id;
end $$;
create or replace function public.review_completed_request(request_id uuid,review_rating integer,review_comment text) returns void language plpgsql security definer set search_path=public as $$
declare r public.service_requests; begin
 select * into r from public.service_requests where id=request_id for update;
 if auth.uid() is null or r.id is null or r.client_id<>auth.uid() or r.status<>'completed' or r.selected_provider_user_id is null then raise exception 'FIX24: Vlerësimi lejohet vetëm pas përfundimit të punës tënde.'; end if;
 if review_rating is null or review_rating not between 1 and 5 or length(trim(coalesce(review_comment,''))) not between 10 and 2000 then raise exception 'FIX24: Vendos vlerësimin dhe përvojën tënde.'; end if;
 insert into public.service_reviews(request_id,professional_user_id,client_id,rating,comment) values(r.id,r.selected_provider_user_id,auth.uid(),review_rating,trim(review_comment));
 -- Serialize aggregate updates for reviews of different requests for the same professional.
 perform 1 from public.professionals where user_id=r.selected_provider_user_id for update;
 update public.professionals set rating=(select round(avg(rating),1) from public.service_reviews where professional_user_id=r.selected_provider_user_id),reviews=(select count(*) from public.service_reviews where professional_user_id=r.selected_provider_user_id) where user_id=r.selected_provider_user_id;
exception when unique_violation then raise exception 'FIX24: E ke vlerësuar tashmë këtë punë.';
end $$;
create or replace function public.moderate_professional(profile_id text,verification text,active boolean) returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null or not public.is_admin() then raise exception 'FIX24: Ky veprim kërkon administratorin.'; end if;
 if verification is null or verification not in ('unverified','pending','approved','rejected','suspended') or active is null then raise exception 'FIX24: Gjendje e pavlefshme.'; end if;
 update public.professionals set verification_status=verification::public.professional_verification_status,verified=verification='approved',is_active=active where id::text=profile_id;
 if not found then raise exception 'FIX24: Profili nuk u gjet.'; end if;
end $$;

-- Explicitly limit security-definer entry points to signed-in accounts.
revoke all on function public.matching_requests(),public.submit_offer(uuid,numeric,text),public.accept_offer(uuid),public.transition_request(uuid,text),public.review_completed_request(uuid,integer,text),public.moderate_professional(text,text,boolean) from public,anon;
grant execute on function public.matching_requests(),public.submit_offer(uuid,numeric,text),public.accept_offer(uuid),public.transition_request(uuid,text),public.review_completed_request(uuid,integer,text),public.moderate_professional(text,text,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('profile-images','profile-images',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('request-photos','request-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- Restrictive policies also constrain any legacy permissive upload policy on these buckets.
do $$ declare p record; begin
 for p in select policyname from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'fix24_%'
 loop execute format('drop policy %I on storage.objects',p.policyname); end loop;
end $$;
-- Historical reviews remain readable; new reviews require a completed booking.
do $$ begin if to_regclass('public.reviews') is not null then
 revoke insert,update,delete on public.reviews from anon,authenticated;
end if; end $$;

create policy fix24_profile_write_guard on storage.objects as restrictive for insert to anon,authenticated
 with check(bucket_id<>'profile-images' or (auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text));
create policy fix24_profile_update_guard on storage.objects as restrictive for update to anon,authenticated
 using(bucket_id<>'profile-images' or (auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text))
 with check(bucket_id<>'profile-images' or (auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text));
create policy fix24_profile_delete_guard on storage.objects as restrictive for delete to anon,authenticated
 using(bucket_id<>'profile-images' or (auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text));
create policy fix24_profile_upload on storage.objects for insert to authenticated with check(bucket_id='profile-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy fix24_profile_read on storage.objects for select to anon,authenticated using(bucket_id='profile-images');

create or replace function public.can_read_request_photo(path text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.service_requests r where r.id::text=split_part(path,'/',1) and (r.client_id=auth.uid() or r.selected_provider_user_id=auth.uid()));
$$;
create or replace function public.can_write_request_photo(path text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.service_requests r where r.id::text=split_part(path,'/',1) and r.client_id=auth.uid() and r.status in ('open','quoted'));
$$;
create policy fix24_request_read_guard on storage.objects as restrictive for select to anon,authenticated using(bucket_id<>'request-photos' or public.can_read_request_photo(name));
create policy fix24_request_insert_guard on storage.objects as restrictive for insert to anon,authenticated with check(bucket_id<>'request-photos' or public.can_write_request_photo(name));
create policy fix24_request_update_guard on storage.objects as restrictive for update to anon,authenticated using(bucket_id<>'request-photos' or public.can_write_request_photo(name)) with check(bucket_id<>'request-photos' or public.can_write_request_photo(name));
create policy fix24_request_delete_guard on storage.objects as restrictive for delete to anon,authenticated using(bucket_id<>'request-photos' or public.can_write_request_photo(name));
create policy fix24_request_read on storage.objects for select to authenticated using(bucket_id='request-photos' and public.can_read_request_photo(name));
create policy fix24_request_insert on storage.objects for insert to authenticated with check(bucket_id='request-photos' and public.can_write_request_photo(name));
create policy fix24_request_delete on storage.objects for delete to authenticated using(bucket_id='request-photos' and public.can_write_request_photo(name));
notify pgrst,'reload schema';
commit;
