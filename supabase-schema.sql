-- IMPONG IMPORT CO., LTD. — schema (รันซ้ำได้)
-- ตาราง + RLS + trigger + storage bucket

create extension if not exists "pgcrypto";

-- ───────────────────────── profiles ─────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        text not null default 'user' check (role in ('user','admin','superadmin')),
  created_at  timestamptz not null default now()
);

-- ─────────────── ข้อมูลผู้เสียภาษี (ใช้ออกใบกำกับภาษี) ───────────────
create table if not exists public.billing_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users on delete cascade,
  org_name      text not null,
  tax_id        text not null,
  branch        text not null default 'สำนักงานใหญ่',
  address       text not null,
  subdistrict   text,
  district      text,
  province      text,
  postal_code   text,
  contact_name  text,
  contact_phone text,
  contact_email text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ───────────────────────── แคตตาล็อก ─────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  brand        text,
  category_id  uuid references public.categories on delete set null,
  summary      text,
  description  text,
  specs        jsonb not null default '[]'::jsonb,   -- [{"label":"ความยาว","value":"13 mm"}]
  image_url    text,
  images       text[] not null default '{}',
  stock_status text not null default 'in_stock'
               check (stock_status in ('in_stock','low_stock','out_of_stock','preorder')),
  is_featured  boolean not null default false,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

-- รุ่น/ขนาดย่อยของสินค้า (เช่น เข็ม 0.25 x 25 mm)
create table if not exists public.product_variants (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products on delete cascade,
  name         text not null,
  sku          text,
  stock_status text not null default 'in_stock'
               check (stock_status in ('in_stock','low_stock','out_of_stock','preorder')),
  sort_order   int not null default 0,
  is_active    boolean not null default true
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

-- ───────────────────────── ข่าวสาร ─────────────────────────
create table if not exists public.news (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  content      text,
  cover_url    text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────── คำขอใบเสนอราคา ───────────────────
create table if not exists public.quote_requests (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  user_id       uuid not null references auth.users on delete cascade,
  status        text not null default 'new'
                check (status in ('new','in_progress','quoted','won','lost','cancelled')),
  note          text,
  contact_name  text,
  contact_phone text,
  contact_email text,
  billing       jsonb,          -- snapshot ข้อมูลผู้เสียภาษีตอนส่งคำขอ
  admin_note    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists quote_requests_user_idx on public.quote_requests(user_id, created_at desc);

create table if not exists public.quote_request_items (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.quote_requests on delete cascade,
  product_id   uuid references public.products on delete set null,
  variant_id   uuid references public.product_variants on delete set null,
  product_name text not null,
  variant_name text,
  quantity     int not null default 1 check (quantity > 0),
  note         text
);
create index if not exists quote_request_items_request_idx on public.quote_request_items(request_id);

-- ───────────────────────── ฟังก์ชัน ─────────────────────────
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role in ('admin','superadmin'));
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$ begin
  create trigger billing_profiles_touch before update on public.billing_profiles
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger products_touch before update on public.products
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger news_touch before update on public.news
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger quote_requests_touch before update on public.quote_requests
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- โปรไฟล์อัตโนมัติเมื่อสมัคร · อีเมลบริษัทเป็น superadmin
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    case when lower(new.email) = 'impongimport@gmail.com' then 'superadmin' else 'user' end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ผู้ใช้เปลี่ยน role ตัวเองไม่ได้ (เฉพาะ superadmin เท่านั้น)
create or replace function public.guard_profile_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role then
    if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'superadmin') then
      new.role = old.role;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists guard_profiles on public.profiles;
create trigger guard_profiles before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- ลูกค้าแก้สถานะ/โน้ตแอดมินของคำขอเองไม่ได้
create or replace function public.guard_quote_request_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin(auth.uid()) then
    return new;
  end if;
  new.status     = case when new.status = 'cancelled' and old.status in ('new','in_progress')
                        then 'cancelled' else old.status end;
  new.admin_note = old.admin_note;
  new.code       = old.code;
  new.user_id    = old.user_id;
  return new;
end $$;

drop trigger if exists guard_quote_requests on public.quote_requests;
create trigger guard_quote_requests before update on public.quote_requests
  for each row execute function public.guard_quote_request_changes();

-- เลขที่คำขอ QR-YYMM-0001
create or replace function public.next_quote_code()
returns text language plpgsql security definer set search_path = public as $$
declare
  prefix text := 'QR-' || to_char(now() at time zone 'Asia/Bangkok', 'YYMM') || '-';
  n int;
begin
  select coalesce(max(substring(code from '\d+$')::int), 0) + 1 into n
    from public.quote_requests where code like prefix || '%';
  return prefix || lpad(n::text, 4, '0');
end $$;

create or replace function public.set_quote_code()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.code is null or new.code = '' then
    new.code = public.next_quote_code();
  end if;
  return new;
end $$;

drop trigger if exists quote_requests_code on public.quote_requests;
create trigger quote_requests_code before insert on public.quote_requests
  for each row execute function public.set_quote_code();

-- ───────────────────────── RLS ─────────────────────────
alter table public.profiles            enable row level security;
alter table public.billing_profiles    enable row level security;
alter table public.categories          enable row level security;
alter table public.products            enable row level security;
alter table public.product_variants    enable row level security;
alter table public.news                enable row level security;
alter table public.quote_requests      enable row level security;
alter table public.quote_request_items enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin(auth.uid()));
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_admin(auth.uid()))
  with check (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists billing_own on public.billing_profiles;
create policy billing_own on public.billing_profiles for all
  using (user_id = auth.uid() or public.is_admin(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select using (true);
drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists products_read on public.products;
create policy products_read on public.products for select
  using (is_active or public.is_admin(auth.uid()));
drop policy if exists products_write on public.products;
create policy products_write on public.products for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists variants_read on public.product_variants;
create policy variants_read on public.product_variants for select
  using (is_active or public.is_admin(auth.uid()));
drop policy if exists variants_write on public.product_variants;
create policy variants_write on public.product_variants for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists news_read on public.news;
create policy news_read on public.news for select
  using ((is_published and coalesce(published_at, now()) <= now()) or public.is_admin(auth.uid()));
drop policy if exists news_write on public.news;
create policy news_write on public.news for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists quotes_select on public.quote_requests;
create policy quotes_select on public.quote_requests for select
  using (user_id = auth.uid() or public.is_admin(auth.uid()));
drop policy if exists quotes_insert on public.quote_requests;
create policy quotes_insert on public.quote_requests for insert
  with check (user_id = auth.uid());
drop policy if exists quotes_update on public.quote_requests;
create policy quotes_update on public.quote_requests for update
  using (user_id = auth.uid() or public.is_admin(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists quote_items_select on public.quote_request_items;
create policy quote_items_select on public.quote_request_items for select
  using (exists (select 1 from public.quote_requests r
                 where r.id = request_id and (r.user_id = auth.uid() or public.is_admin(auth.uid()))));
drop policy if exists quote_items_write on public.quote_request_items;
create policy quote_items_write on public.quote_request_items for all
  using (exists (select 1 from public.quote_requests r
                 where r.id = request_id and (r.user_id = auth.uid() or public.is_admin(auth.uid()))))
  with check (exists (select 1 from public.quote_requests r
                 where r.id = request_id and (r.user_id = auth.uid() or public.is_admin(auth.uid()))));

-- ───────────────────────── storage ─────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_write on storage.objects;
create policy media_write on storage.objects for all
  using (bucket_id = 'media' and public.is_admin(auth.uid()))
  with check (bucket_id = 'media' and public.is_admin(auth.uid()));
