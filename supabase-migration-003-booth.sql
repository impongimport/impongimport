-- งานออกบูธ: ลงทะเบียน + แบบสอบถาม + จับฉลาก (รันซ้ำได้)

-- ───────────────────────── ตาราง ─────────────────────────
create table if not exists public.booth_events (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  venue      text,
  starts_on  date,
  ends_on    date,
  prize      text,
  intro      text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.booth_entries (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references public.booth_events on delete cascade,
  ticket_code      text not null,
  full_name        text not null,
  org_name         text not null,
  role             text,
  phone            text not null,
  email            text,
  answers          jsonb not null default '{}'::jsonb,
  user_id          uuid references auth.users on delete set null,
  quote_request_id uuid references public.quote_requests on delete set null,
  is_winner        boolean not null default false,
  won_at           timestamptz,
  admin_note       text,
  consent_at       timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- กันคนเดิมกรอกซ้ำในงานเดียวกัน (เบอร์โทรเก็บเฉพาะตัวเลข)
create unique index if not exists booth_entries_event_phone_idx
  on public.booth_entries(event_id, phone);
create unique index if not exists booth_entries_event_ticket_idx
  on public.booth_entries(event_id, ticket_code);
create index if not exists booth_entries_event_created_idx
  on public.booth_entries(event_id, created_at desc);

-- ───────────── คำขอใบเสนอราคาที่แอดมินสร้างจากรายชื่อบูธ ─────────────
-- รายชื่อจากบูธยังไม่มีบัญชีผู้ใช้ คำขอที่แอดมินสร้างให้จึงไม่มีเจ้าของ
alter table public.quote_requests alter column user_id drop not null;

drop policy if exists quotes_insert on public.quote_requests;
create policy quotes_insert on public.quote_requests for insert
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- ───────────────────── เลขที่สิทธิ์ IMP-0001 ─────────────────────
create or replace function public.next_booth_ticket(p_event uuid)
returns text language plpgsql security definer set search_path = public as $$
declare n int;
begin
  -- กันสองคนกดส่งพร้อมกันแล้วได้เลขชนกัน
  perform pg_advisory_xact_lock(hashtext(p_event::text));
  select coalesce(max(substring(ticket_code from '\d+$')::int), 0) + 1 into n
    from public.booth_entries where event_id = p_event;
  return 'IMP-' || lpad(n::text, 4, '0');
end $$;

-- ───────────────────── ส่งแบบสอบถาม (เรียกโดยคนทั่วไป) ─────────────────────
create or replace function public.submit_booth_entry(
  p_slug      text,
  p_full_name text,
  p_org_name  text,
  p_role      text,
  p_phone     text,
  p_email     text,
  p_answers   jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_event    public.booth_events;
  v_phone    text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_email    text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_existing public.booth_entries;
  v_user     uuid;
  v_code     text;
begin
  select * into v_event from public.booth_events where slug = p_slug and is_active;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'event_not_found');
  end if;

  if coalesce(trim(p_full_name), '') = '' or coalesce(trim(p_org_name), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'missing_name');
  end if;
  if length(v_phone) < 9 then
    return jsonb_build_object('ok', false, 'error', 'invalid_phone');
  end if;

  -- กรอกซ้ำด้วยเบอร์เดิม = คืนเลขสิทธิ์เดิม ไม่ใช่ error
  select * into v_existing from public.booth_entries
    where event_id = v_event.id and phone = v_phone;
  if found then
    return jsonb_build_object('ok', true, 'duplicate', true, 'ticket_code', v_existing.ticket_code);
  end if;

  -- ผูกเข้าบัญชีถ้ามีผู้ใช้อีเมลเดียวกันอยู่แล้ว
  if v_email is not null then
    select id into v_user from auth.users where lower(email) = v_email limit 1;
  end if;

  v_code := public.next_booth_ticket(v_event.id);

  insert into public.booth_entries
    (event_id, ticket_code, full_name, org_name, role, phone, email, answers, user_id)
  values
    (v_event.id, v_code, trim(p_full_name), trim(p_org_name),
     nullif(trim(coalesce(p_role, '')), ''), v_phone, v_email,
     coalesce(p_answers, '{}'::jsonb), v_user);

  return jsonb_build_object('ok', true, 'duplicate', false, 'ticket_code', v_code);
end $$;

-- ───────────────────── สรุปผลสำหรับฉายขึ้นจอ (ไม่มีข้อมูลส่วนบุคคล) ─────────────────────
create or replace function public.booth_count_single(p_event uuid, p_key text)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(val, n), '{}'::jsonb)
  from (
    select answers ->> p_key as val, count(*) as n
    from public.booth_entries
    where event_id = p_event and coalesce(answers ->> p_key, '') <> ''
    group by 1
  ) t;
$$;

create or replace function public.booth_count_multi(p_event uuid, p_key text)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(val, n), '{}'::jsonb)
  from (
    select v.val, count(*) as n
    from public.booth_entries be
    cross join lateral jsonb_array_elements_text(
      case when jsonb_typeof(be.answers -> p_key) = 'array'
           then be.answers -> p_key else '[]'::jsonb end
    ) as v(val)
    where be.event_id = p_event
    group by v.val
  ) t;
$$;

create or replace function public.booth_stats(p_slug text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_event public.booth_events;
begin
  select * into v_event from public.booth_events where slug = p_slug;
  if not found then return null; end if;

  return jsonb_build_object(
    'name',  v_event.name,
    'venue', v_event.venue,
    'prize', v_event.prize,
    'total', (select count(*) from public.booth_entries where event_id = v_event.id),
    'orgs',  (select count(distinct org_name) from public.booth_entries where event_id = v_event.id),
    'needle_type', public.booth_count_single(v_event.id, 'needle_type'),
    'handle',      public.booth_count_single(v_event.id, 'handle'),
    'sizes',       public.booth_count_multi(v_event.id, 'sizes'),
    'interests',   public.booth_count_multi(v_event.id, 'interests'),
    'winners', (
      select coalesce(
        jsonb_agg(jsonb_build_object('ticket', ticket_code, 'org', org_name) order by won_at),
        '[]'::jsonb)
      from public.booth_entries where event_id = v_event.id and is_winner
    )
  );
end $$;

-- ───────────────────── จับฉลาก (แอดมินเท่านั้น) ─────────────────────
create or replace function public.booth_draw_winner(p_event uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v public.booth_entries;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'forbidden';
  end if;

  select * into v from public.booth_entries
    where event_id = p_event and not is_winner
    order by random() limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_entries');
  end if;

  update public.booth_entries set is_winner = true, won_at = now() where id = v.id;

  return jsonb_build_object('ok', true, 'ticket_code', v.ticket_code,
                            'full_name', v.full_name, 'org_name', v.org_name, 'phone', v.phone);
end $$;

-- ───────── ผูกรายชื่อบูธเข้าบัญชีเมื่อสมัครด้วยอีเมลเดียวกันภายหลัง ─────────
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

  update public.booth_entries
     set user_id = new.id
   where user_id is null and lower(email) = lower(new.email);

  return new;
end $$;

-- ───────────────────────── RLS ─────────────────────────
alter table public.booth_events  enable row level security;
alter table public.booth_entries enable row level security;

drop policy if exists booth_events_read on public.booth_events;
create policy booth_events_read on public.booth_events for select using (true);
drop policy if exists booth_events_write on public.booth_events;
create policy booth_events_write on public.booth_events for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- รายชื่อผู้ร่วมงานเปิดให้เฉพาะแอดมิน คนทั่วไปเขียนผ่าน submit_booth_entry() เท่านั้น
drop policy if exists booth_entries_admin on public.booth_entries;
create policy booth_entries_admin on public.booth_entries for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

grant execute on function public.submit_booth_entry(text, text, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.booth_stats(text) to anon, authenticated;
