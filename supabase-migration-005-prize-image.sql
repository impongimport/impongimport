-- รูปของรางวัลสำหรับหน้าฟอร์มและจอสรุปผลที่บูธ
alter table public.booth_events add column if not exists prize_image_url text;

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
    'prize_image_url', v_event.prize_image_url,
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
