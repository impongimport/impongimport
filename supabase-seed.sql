-- ข้อมูลตัวอย่างสำหรับเริ่มต้น (รันซ้ำได้ — ใช้ slug เป็นตัวชี้)
insert into public.categories (slug, name, description, sort_order) values
  ('acupuncture-needles', 'เข็มฝังเข็ม', 'เข็มฝังเข็มปลอดเชื้อ ใช้ครั้งเดียว หลายขนาด', 1),
  ('electro-stimulators', 'เครื่องกระตุ้นไฟฟ้า', 'เครื่องกระตุ้นไฟฟ้าสำหรับการฝังเข็ม', 2),
  ('cupping', 'ชุดครอบแก้ว', 'ถ้วยครอบแก้วและอุปกรณ์สำหรับการครอบแก้ว', 3),
  ('accessories', 'อุปกรณ์เสริม', 'อุปกรณ์ประกอบการรักษาแผนจีน', 4)
on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.products (slug, name, brand, category_id, summary, description, specs, stock_status, is_featured, sort_order)
values
  ('taiyitcm-t1-copper-no-tube',
   'เข็มฝังเข็ม TAIYITCM T1 — ด้ามทองแดง ไม่มีท่อนำ',
   'TAIYITCM',
   (select id from public.categories where slug = 'acupuncture-needles'),
   'เข็มฝังเข็มปลอดเชื้อ ใช้ครั้งเดียว ด้ามทองแดง บรรจุแบบ Blister Pack 100 เข็ม',
   E'เข็มฝังเข็มปลอดเชื้อสำหรับใช้ครั้งเดียว ด้ามทองแดง แบบไม่มีท่อนำ ผลิตด้วยกระบวนการควบคุมคุณภาพ ปลายเข็มเรียบคม ช่วยลดความรู้สึกไม่สบายขณะปักเข็ม\n\nบรรจุแบบ T1 Blister Pack กล่องละ 100 เข็ม เหมาะสำหรับโรงพยาบาล คลินิก และสถานพยาบาลที่ใช้ปริมาณมาก',
   '[{"label":"แบรนด์","value":"TAIYITCM"},{"label":"ด้ามเข็ม","value":"ทองแดง"},{"label":"ท่อนำเข็ม","value":"ไม่มี"},{"label":"บรรจุ","value":"Blister Pack 100 เข็ม/กล่อง"},{"label":"การใช้งาน","value":"ปลอดเชื้อ ใช้ครั้งเดียว"}]'::jsonb,
   'in_stock', true, 1),
  ('taiyitcm-t1-with-tube',
   'เข็มฝังเข็ม TAIYITCM T1 — ด้ามสเตนเลส/ทองแดง พร้อมท่อนำ',
   'TAIYITCM',
   (select id from public.categories where slug = 'acupuncture-needles'),
   'เข็มฝังเข็มปลอดเชื้อ พร้อมท่อนำเข็ม เลือกด้ามสเตนเลสหรือทองแดง',
   E'เข็มฝังเข็มปลอดเชื้อใช้ครั้งเดียว พร้อมท่อนำเข็ม ช่วยให้ปักเข็มได้แม่นยำและรวดเร็ว เลือกได้ทั้งด้ามสเตนเลสและด้ามทองแดง\n\nบรรจุแบบ T1 Blister Pack กล่องละ 100 เข็ม',
   '[{"label":"แบรนด์","value":"TAIYITCM"},{"label":"ด้ามเข็ม","value":"สเตนเลส / ทองแดง"},{"label":"ท่อนำเข็ม","value":"มี"},{"label":"บรรจุ","value":"Blister Pack 100 เข็ม/กล่อง"},{"label":"การใช้งาน","value":"ปลอดเชื้อ ใช้ครั้งเดียว"}]'::jsonb,
   'in_stock', true, 2),
  ('electro-acupuncture-stimulator',
   'เครื่องกระตุ้นไฟฟ้าสำหรับการฝังเข็ม',
   null,
   (select id from public.categories where slug = 'electro-stimulators'),
   'เครื่องกระตุ้นไฟฟ้าหลายช่องสัญญาณ ปรับความถี่และความแรงได้',
   E'เครื่องกระตุ้นไฟฟ้าสำหรับใช้ร่วมกับการฝังเข็ม ปรับรูปแบบคลื่น ความถี่ และความแรงได้ตามแผนการรักษา เหมาะกับงานในโรงพยาบาลและคลินิกเวชศาสตร์ฟื้นฟู\n\nสนใจรุ่นและสเปกโดยละเอียด ติดต่อขอใบเสนอราคาได้',
   '[{"label":"หมวด","value":"เครื่องกระตุ้นไฟฟ้า"},{"label":"การใช้งาน","value":"ใช้ร่วมกับการฝังเข็ม"}]'::jsonb,
   'in_stock', true, 3),
  ('cupping-set',
   'ชุดถ้วยครอบแก้วสุญญากาศ',
   null,
   (select id from public.categories where slug = 'cupping'),
   'ชุดถ้วยครอบแก้วพร้อมปั๊มสุญญากาศ หลายขนาด',
   E'ชุดถ้วยครอบแก้วสำหรับการรักษาแบบแผนจีน พร้อมปั๊มสุญญากาศ มีถ้วยหลายขนาดให้เลือกใช้ตามตำแหน่งที่ต้องการ\n\nสนใจจำนวนและรุ่น ติดต่อขอใบเสนอราคาได้',
   '[{"label":"หมวด","value":"ชุดครอบแก้ว"},{"label":"ประกอบด้วย","value":"ถ้วยหลายขนาด + ปั๊มสุญญากาศ"}]'::jsonb,
   'in_stock', false, 4)
on conflict (slug) do update set
  name = excluded.name, brand = excluded.brand, category_id = excluded.category_id,
  summary = excluded.summary, description = excluded.description, specs = excluded.specs,
  is_featured = excluded.is_featured, sort_order = excluded.sort_order;

-- ขนาดเข็ม (ตามตารางในเอกสารบริษัท)
delete from public.product_variants
  where product_id in (select id from public.products where slug in ('taiyitcm-t1-copper-no-tube','taiyitcm-t1-with-tube'));

insert into public.product_variants (product_id, name, sort_order)
select p.id, v.name, v.ord from public.products p,
  (values
    ('0.16 x 13 mm', 1), ('0.16 x 15 mm', 2), ('0.22 x 13 mm', 3), ('0.22 x 25 mm', 4),
    ('0.25 x 13 mm', 5), ('0.25 x 25 mm', 6), ('0.25 x 40 mm', 7), ('0.30 x 75 mm', 8)
  ) as v(name, ord)
where p.slug = 'taiyitcm-t1-copper-no-tube';

insert into public.product_variants (product_id, name, sort_order)
select p.id, v.name, v.ord from public.products p,
  (values
    ('ด้ามสเตนเลส 0.16 x 13 mm', 1), ('ด้ามสเตนเลส 0.25 x 25 mm', 2), ('ด้ามสเตนเลส 0.25 x 40 mm', 3),
    ('ด้ามสเตนเลส 0.25 x 75 mm', 4), ('ด้ามสเตนเลส 0.30 x 40 mm', 5), ('ด้ามสเตนเลส 0.30 x 75 mm', 6),
    ('ด้ามทองแดง 0.25 x 25 mm', 7), ('ด้ามทองแดง 0.25 x 40 mm', 8), ('ด้ามทองแดง 0.25 x 75 mm', 9)
  ) as v(name, ord)
where p.slug = 'taiyitcm-t1-with-tube';

insert into public.news (slug, title, excerpt, content, is_published, published_at) values
  ('welcome',
   'เปิดเว็บไซต์ IMPONG IMPORT อย่างเป็นทางการ',
   'ช่องทางใหม่สำหรับโรงพยาบาลและคลินิกในการดูแคตตาล็อกสินค้าและขอใบเสนอราคาออนไลน์',
   E'บริษัท อิมผ่ง อิมพอร์ต จำกัด เปิดเว็บไซต์อย่างเป็นทางการ เพื่อให้โรงพยาบาล คลินิก และสถานพยาบาลคู่ค้า สามารถดูรายการสินค้า ตรวจสอบสถานะสินค้า และขอใบเสนอราคาได้สะดวกขึ้น\n\nลูกค้าสามารถเข้าสู่ระบบด้วยบัญชี Google บันทึกข้อมูลผู้เสียภาษีไว้ล่วงหน้า แล้วส่งคำขอใบเสนอราคาได้ทันที ทีมงานจะติดต่อกลับโดยเร็วที่สุด',
   true, now())
on conflict (slug) do nothing;
