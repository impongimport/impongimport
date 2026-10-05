# IMPONG IMPORT — เว็บไซต์บริษัท

เว็บไซต์ บริษัท อิมผ่ง อิมพอร์ต จำกัด · แคตตาล็อกอุปกรณ์การแพทย์แผนจีน ข่าวสาร
และระบบขอใบเสนอราคาออนไลน์สำหรับโรงพยาบาลและคลินิก

## ติดตั้ง

```bash
npm install
cp .env.example .env.local   # ใส่ค่า Supabase
npm run dev                  # http://localhost:3011
```

## ตั้งค่า Supabase

1. สร้าง project ในบัญชี `impongimport@gmail.com`
2. SQL Editor → รัน `supabase-schema.sql` (ตาราง + RLS + trigger + bucket `media`)
3. SQL Editor → รัน `supabase-seed.sql` (หมวดหมู่ สินค้า ขนาดเข็ม ข่าวแรก)
4. Authentication → Providers → เปิด **Google** แล้วใส่ Client ID / Secret จาก Google Cloud Console
5. Authentication → URL Configuration
   - Site URL: โดเมนจริงบน Vercel
   - Redirect URLs: `http://localhost:3011/auth/callback` และ `https://<โดเมน>/auth/callback`
6. คัดลอก Project URL และ anon key ใส่ `.env.local` และ Environment Variables บน Vercel

เข้าสู่ระบบด้วย `impongimport@gmail.com` ครั้งแรก → ได้สิทธิ์ superadmin อัตโนมัติ → เข้า `/admin` ได้

## สิ่งที่มีในเว็บ

| หน้า | รายละเอียด |
| --- | --- |
| `/` | หน้าแรก — จุดเด่น หมวดสินค้า สินค้าแนะนำ ลูกค้า ข่าวล่าสุด |
| `/products` | แคตตาล็อก กรองตามหมวด · ไม่แสดงราคา แสดงสถานะสต็อก |
| `/products/[slug]` | รายละเอียดสินค้า ข้อมูลจำเพาะ ขนาด และปุ่มเพิ่มลงคำขอ |
| `/quote` | รายการที่เลือก + ฟอร์มข้อมูลผู้เสียภาษี → ส่งคำขอ |
| `/me` | บัญชีลูกค้า — ข้อมูลผู้เสียภาษี และประวัติคำขอ |
| `/news`, `/about`, `/contact` | ข่าวสาร เกี่ยวกับเรา ติดต่อ (โทร/LINE/อีเมล/แผนที่) |
| `/admin` | คำขอใบเสนอราคา สินค้า ข่าว ลูกค้า (เฉพาะแอดมิน) |

## หมายเหตุ

- ราคาไม่แสดงบนเว็บโดยตั้งใจ — ลูกค้าขอใบเสนอราคาเป็นรายกรณี
- ระบบเก็บข้อมูลผู้เสียภาษีไว้ให้ ไม่ได้ออกไฟล์ใบกำกับภาษีเอง
