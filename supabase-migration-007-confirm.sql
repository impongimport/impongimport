-- ยืนยันสิทธิ์จับฉลาก: ผู้ร่วมงานต้องส่งรูปเลขสิทธิ์เข้า LINE OA ก่อน
-- แอดมินกดยืนยันในระบบ แล้วการสุ่มจะหยิบเฉพาะคนที่ยืนยันแล้วเท่านั้น
-- (หน้าเว็บเขียนว่าเป็นเงื่อนไข ระบบจึงต้องบังคับจริง ไม่ใช่แค่ข้อความ)

alter table public.booth_entries add column if not exists confirmed_at timestamptz;
create index if not exists booth_entries_confirmed_idx
  on public.booth_entries(event_id) where confirmed_at is not null;

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

    perform pg_advisory_xact_lock(hashtext(p_prize::text));
    select count(*) into v_awarded from public.booth_entries where prize_id = v_prize.id;
    if v_awarded >= v_prize.quantity then
      return jsonb_build_object('ok', false, 'error', 'prize_exhausted');
    end if;
  end if;

  select * into v_entry from public.booth_entries
    where event_id = p_event and not is_winner and confirmed_at is not null
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

-- จอสรุปผลโชว์จำนวนคนที่ยืนยันสิทธิ์แล้วด้วย
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
    'confirmed', (select count(*) from public.booth_entries
                  where event_id = v_event.id and confirmed_at is not null),
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
