-- ของรางวัลหลายระดับ แต่ละระดับมีจำนวนของตัวเอง (รางวัลที่ 1 จำนวน 4, รางวัลที่ 2 จำนวน 6 …)
-- แทนที่ของรางวัลชิ้นเดียวเดิมที่เก็บไว้ใน booth_events.prize / prize_image_url

create table if not exists public.booth_prizes (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.booth_events on delete cascade,
  name       text not null,
  quantity   int  not null default 1 check (quantity > 0),
  image_url  text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists booth_prizes_event_idx on public.booth_prizes(event_id, sort_order);

alter table public.booth_entries
  add column if not exists prize_id uuid references public.booth_prizes on delete set null;
create index if not exists booth_entries_prize_idx on public.booth_entries(prize_id);

-- ย้ายของรางวัลเดิมของแต่ละงานมาเป็นรางวัลระดับแรก แล้วค่อยเลิกใช้คอลัมน์เก่า
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'booth_events' and column_name = 'prize')
  then
    insert into public.booth_prizes (event_id, name, quantity, image_url, sort_order)
    select b.id, b.prize, 1, b.prize_image_url, 0
    from public.booth_events b
    where coalesce(b.prize, '') <> ''
      and not exists (select 1 from public.booth_prizes p where p.event_id = b.id);

    alter table public.booth_events drop column prize;
    alter table public.booth_events drop column prize_image_url;
  end if;
end $$;

alter table public.booth_prizes enable row level security;

drop policy if exists booth_prizes_read on public.booth_prizes;
create policy booth_prizes_read on public.booth_prizes for select using (true);
drop policy if exists booth_prizes_write on public.booth_prizes;
create policy booth_prizes_write on public.booth_prizes for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ───────────────── สุ่มผู้โชคดีตามระดับรางวัล ─────────────────
-- เพิ่มพารามิเตอร์ใหม่ = เป็น overload ไม่ใช่การแทนที่ ต้องลบตัวเดิมก่อน
drop function if exists public.booth_draw_winner(uuid);

create or replace function public.booth_draw_winner(p_event uuid, p_prize uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_prize   public.booth_prizes;
  v_entry   public.booth_entries;
  v_awarded int;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'forbidden';
  end if;

  if p_prize is not null then
    select * into v_prize from public.booth_prizes where id = p_prize and event_id = p_event;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'prize_not_found');
    end if;

    -- ล็อกไว้กันกดสุ่มรัวจนเกินโควตา
    perform pg_advisory_xact_lock(hashtext(p_prize::text));
    select count(*) into v_awarded from public.booth_entries where prize_id = v_prize.id;
    if v_awarded >= v_prize.quantity then
      return jsonb_build_object('ok', false, 'error', 'prize_exhausted');
    end if;
  end if;

  select * into v_entry from public.booth_entries
    where event_id = p_event and not is_winner
    order by random() limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_entries');
  end if;

  update public.booth_entries
     set is_winner = true, won_at = now(), prize_id = p_prize
   where id = v_entry.id;

  return jsonb_build_object('ok', true, 'ticket_code', v_entry.ticket_code,
                            'full_name', v_entry.full_name, 'org_name', v_entry.org_name,
                            'phone', v_entry.phone, 'prize', coalesce(v_prize.name, ''));
end $$;

-- ───────────────── สรุปผลสำหรับจอที่บูธ ─────────────────
create or replace function public.booth_stats(p_slug text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_event public.booth_events;
begin
  select * into v_event from public.booth_events where slug = p_slug;
  if not found then return null; end if;

  return jsonb_build_object(
    'name',  v_event.name,
    'venue', v_event.venue,
    'total', (select count(*) from public.booth_entries where event_id = v_event.id),
    'orgs',  (select count(distinct org_name) from public.booth_entries where event_id = v_event.id),
    'needle_type', public.booth_count_single(v_event.id, 'needle_type'),
    'handle',      public.booth_count_single(v_event.id, 'handle'),
    'sizes',       public.booth_count_multi(v_event.id, 'sizes'),
    'interests',   public.booth_count_multi(v_event.id, 'interests'),
    'prizes', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.name, 'quantity', p.quantity, 'image_url', p.image_url,
        'awarded', (select count(*) from public.booth_entries e where e.prize_id = p.id)
      ) order by p.sort_order, p.created_at), '[]'::jsonb)
      from public.booth_prizes p where p.event_id = v_event.id
    ),
    'winners', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'ticket', e.ticket_code, 'org', e.org_name,
        'prize', p.name, 'prize_image_url', p.image_url
      ) order by e.won_at desc), '[]'::jsonb)
      from public.booth_entries e
      left join public.booth_prizes p on p.id = e.prize_id
      where e.event_id = v_event.id and e.is_winner
    )
  );
end $$;
