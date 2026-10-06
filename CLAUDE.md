# IMPONG IMPORT — เว็บไซต์บริษัท (notes for Claude)

เว็บไซต์ **บริษัท อิมผ่ง อิมพอร์ต จำกัด** (IMPONG IMPORT CO., LTD.)
ผู้นำเข้าอุปกรณ์การแพทย์แผนจีน (เข็มฝังเข็ม TAIYITCM, เครื่องกระตุ้นไฟฟ้า, ชุดครอบแก้ว)
ขายให้โรงพยาบาล/คลินิก · อีเมลบริษัท `impongimport@gmail.com` · โทร 088-499-3473 · LINE @impong

## Stack / โครงสร้าง

- Next.js 16 (App Router, `src/`, Turbopack) + Tailwind v4 + Supabase (`@supabase/ssr`) + Google OAuth
- **ภาษาไทยอย่างเดียว** (ไม่มี i18n — ถ้าจะเพิ่มอังกฤษให้ดูรูปแบบจากโปรเจค `tstcvm`)
- หน้า public อ่านผ่าน `supabasePublic` (ไม่มี cookie → ISR ได้, `revalidate = 300`)
  หน้าที่ต้องรู้ตัวตนใช้ `createClient()` จาก `src/lib/supabase/server.ts`
- หน้าที่ต้องล็อกอิน: `/me`, `/admin` (คุมที่ `src/proxy.ts` — Next 16 ใช้ `proxy.ts` ไม่ใช่ `middleware.ts`)
- dev port **3011** (`.claude/launch.json` → `impong-dev`)

## สีแบรนด์

navy `#1a344b` (ดูดมาจากไฟล์โลโก้) · ขาว · gold `#c8a862` ใช้เป็น accent เท่านั้น (เส้นคั่น `rule-gold`, ไอคอน, ปุ่มรอง)
ฟอนต์: IBM Plex Sans Thai (เนื้อหา) + Poppins (หัวข้อภาษาอังกฤษ, `font-display`)

## ฟีเจอร์หลัก

1. **แคตตาล็อก** `/products` — ไม่แสดงราคา (ตั้งใจ) แสดงแค่สถานะสต็อก `in_stock / low_stock / out_of_stock / preorder`
2. **ตะกร้าขอใบเสนอราคา** — เก็บใน `localStorage` ผ่าน external store ใน `src/components/quote-cart.tsx`
   (ใช้ `useSyncExternalStore` ไม่ใช่ context+effect เพราะ eslint `react-hooks/set-state-in-effect`)
3. **ล็อกอิน Google** → บันทึก **ข้อมูลผู้เสียภาษี** (`billing_profiles`) ครั้งเดียว ใช้ซ้ำทุกคำขอ
   ระบบ **ไม่ออกเอกสาร PDF** — เก็บข้อมูลให้แอดมินไปออกใบกำกับภาษีในระบบบัญชี
4. **คำขอใบเสนอราคา** `quote_requests` + `quote_request_items` · เลขที่ `QR-YYMM-0001` สร้างจาก trigger
5. **แอดมิน** `/admin` — คำขอ / สินค้า / ข่าว / ลูกค้า · อัปโหลดรูปเข้า bucket `media`

## กฎที่ต้องรักษาไว้

1. **ห้ามใส่ราคาในหน้า public** — โมเดลธุรกิจคือขอใบเสนอราคา ราคาต่อรายโรงพยาบาลไม่เท่ากัน
2. **ข้อมูลผู้เสียภาษีถูก snapshot ลง `quote_requests.billing` ตอนส่งคำขอ** — ลูกค้าแก้โปรไฟล์ทีหลัง
   คำขอเก่าต้องไม่เปลี่ยน
3. **ลูกค้าแก้ `status` / `admin_note` / `code` ของคำขอเองไม่ได้** — trigger `guard_quote_request_changes`
   เขียนค่าเดิมทับให้ (ยกเลิกเองได้อย่างเดียว)
4. `handle_new_user()` ตั้ง `impongimport@gmail.com` เป็น superadmin อัตโนมัติตอนล็อกอินครั้งแรก
5. ไฟล์ `'use server'` export ได้แต่ฟังก์ชัน async — helper ที่ไม่ async อยู่ที่ `src/lib/billing.ts`

## ไฟล์สำคัญ

- `supabase-schema.sql` — ตาราง + RLS + trigger + bucket (รันซ้ำได้)
- `supabase-seed.sql` — หมวดหมู่/สินค้า/ขนาดเข็มตามเอกสารบริษัท + ข่าวแรก (รันซ้ำได้)
- `src/lib/site.ts` — ข้อมูลติดต่อและรายชื่อลูกค้าอ้างอิง
- `src/lib/actions/*` — server action (quote / profile / admin)
- `src/lib/queries.ts` — query หน้า public (มี guard `hasSupabase` ให้ build ผ่านตอนไม่มี env)

## บัญชีและค่าที่เกี่ยวข้อง

- ทุกอย่างอยู่ในบัญชี `impongimport@gmail.com`
- Supabase project ref `orumtzbcpqlfrqfuplbv` (org `impongimport's Org`, region ap-northeast-2)
  Management API token อยู่ใน keychain ชื่อ service `supabase-mgmt-impong` (scope เฉพาะโปรเจคนี้, ไม่หมดอายุ)
  รัน migration: `python3 run_sql.py <file.sql>` — ไฟล์ทั้งไฟล์รันใน transaction เดียว
- GitHub `impongimport/impongimport` — repo ตั้ง `credential.useHttpPath=true` และมี classic PAT
  ของบัญชี impongimport เก็บใน keychain ของ git (`git push origin main` ทำงานได้เลย)
  การสร้าง PAT ใหม่ต้องยืนยันตัวตนทางอีเมล (รหัส 8 หลักส่งเข้า impongimport@gmail.com)
- Vercel team `impong` project `impongimport` → **https://impongimport.vercel.app**
  env ตั้งไว้ครบทั้ง Production/Preview/Development
- Google Cloud project `sincere-octane-510801-p1` ("IMPONG IMPORT Web") ในบัญชี impongimport
  (authuser=6 ใน Chrome) · OAuth client "IMPONG IMPORT Web" · consent screen **In production** แล้ว
  redirect URI = `https://orumtzbcpqlfrqfuplbv.supabase.co/auth/v1/callback`
