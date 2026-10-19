-- หน้า /admin/quotes/[id] ดึงชื่อผู้ขอด้วย embed `profiles(...)` แต่ PostgREST
-- หาความสัมพันธ์ไม่เจอ เพราะ quote_requests.user_id ชี้ไปที่ auth.users ไม่ใช่ public.profiles
-- (auth ไม่ได้ถูก expose) ผลคือ query error แล้วหน้ารายละเอียดคำขอขึ้น 404 ทุกใบ
--
-- เพิ่ม foreign key ไปที่ profiles อีกเส้น (profiles.id เป็น PK ที่อ้าง auth.users อยู่แล้ว
-- ค่าจึงตรงกันเสมอ) เพื่อให้ PostgREST มองเห็นความสัมพันธ์
do $$ begin
  alter table public.quote_requests
    add constraint quote_requests_user_id_profiles_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;
exception when duplicate_object then null; end $$;

notify pgrst, 'reload schema';
