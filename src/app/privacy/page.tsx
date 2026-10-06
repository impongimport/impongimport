import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'นโยบายความเป็นส่วนตัว',
  description: `นโยบายความเป็นส่วนตัวของ ${site.nameTh}`,
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-navy">นโยบายความเป็นส่วนตัว</h1>
      <span className="rule-gold mt-3" />
      <p className="mt-6 leading-relaxed text-navy-500">
        {site.nameTh} (“บริษัท”) ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้งานเว็บไซต์
        นโยบายนี้อธิบายว่าบริษัทเก็บรวบรวม ใช้ และเปิดเผยข้อมูลของท่านอย่างไร
      </p>

      <Section title="ข้อมูลที่เราเก็บรวบรวม">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>ข้อมูลบัญชี</strong> — ชื่อ อีเมล และรูปโปรไฟล์ ที่ได้รับจากการเข้าสู่ระบบด้วยบัญชี Google
          </li>
          <li>
            <strong>ข้อมูลสำหรับออกเอกสาร</strong> — ชื่อผู้เสียภาษี เลขประจำตัวผู้เสียภาษี สาขา ที่อยู่
            ชื่อผู้ติดต่อ เบอร์โทรศัพท์ และอีเมล ที่ท่านกรอกเอง
          </li>
          <li>
            <strong>คำขอใบเสนอราคา</strong> — รายการสินค้า จำนวน และหมายเหตุที่ท่านส่งเข้ามา
          </li>
        </ul>
      </Section>

      <Section title="วัตถุประสงค์ของการใช้ข้อมูล">
        <ul className="list-disc space-y-2 pl-5">
          <li>ติดต่อกลับเพื่อเสนอราคาและประสานงานการสั่งซื้อ</li>
          <li>จัดทำใบเสนอราคา ใบกำกับภาษี และเอกสารทางการค้าอื่นที่เกี่ยวข้อง</li>
          <li>ปฏิบัติตามหน้าที่ทางกฎหมายและภาษีอากร</li>
        </ul>
        <p>
          บริษัทไม่ใช้ข้อมูลของท่านเพื่อวัตถุประสงค์อื่นนอกเหนือจากที่ระบุไว้
          โดยไม่ได้แจ้งหรือขอความยินยอมจากท่านก่อน
        </p>
      </Section>

      <Section title="การเปิดเผยข้อมูล">
        <p>
          บริษัทไม่ขาย ไม่ให้เช่า และไม่เปิดเผยข้อมูลของท่านแก่บุคคลภายนอกเพื่อการตลาด
          ข้อมูลอาจถูกเปิดเผยเฉพาะกรณีที่จำเป็นต่อการให้บริการ (เช่น ผู้ให้บริการระบบคลาวด์
          และผู้ให้บริการขนส่ง) หรือเมื่อมีหน้าที่ตามกฎหมาย คำสั่งศาล หรือหน่วยงานรัฐที่มีอำนาจ
        </p>
      </Section>

      <Section title="การเก็บรักษาและความปลอดภัย">
        <p>
          ข้อมูลถูกจัดเก็บบนระบบฐานข้อมูลที่มีการควบคุมสิทธิ์การเข้าถึง
          เฉพาะผู้ที่ได้รับมอบหมายของบริษัทเท่านั้นที่เข้าถึงข้อมูลของท่านได้
          บริษัทเก็บข้อมูลไว้เท่าที่จำเป็นต่อวัตถุประสงค์ข้างต้น และตามระยะเวลาที่กฎหมายกำหนด
        </p>
      </Section>

      <Section title="คุกกี้">
        <p>
          เว็บไซต์ใช้คุกกี้เท่าที่จำเป็นต่อการรักษาสถานะการเข้าสู่ระบบและการทำงานพื้นฐานของเว็บไซต์
          ไม่มีการใช้คุกกี้เพื่อการโฆษณาหรือติดตามพฤติกรรมข้ามเว็บไซต์
        </p>
      </Section>

      <Section title="สิทธิของเจ้าของข้อมูล">
        <p>
          ท่านมีสิทธิขอเข้าถึง ขอสำเนา ขอแก้ไขให้ถูกต้อง ขอให้ลบหรือระงับการใช้ข้อมูลของท่าน
          รวมถึงถอนความยินยอมได้ตลอดเวลา โดยติดต่อบริษัทตามช่องทางด้านล่าง
          ทั้งนี้ ข้อมูลที่ต้องเก็บไว้ตามกฎหมายภาษีอากรอาจไม่สามารถลบได้ทันที
        </p>
      </Section>

      <Section title="ติดต่อเรา">
        <p>
          {site.nameTh}
          <br />
          {site.address}
          <br />
          โทร {site.phone} · อีเมล{' '}
          <a href={`mailto:${site.email}`} className="text-navy underline hover:text-gold-700">
            {site.email}
          </a>
        </p>
      </Section>

      <p className="mt-12 text-sm text-navy-400">ปรับปรุงล่าสุด 6 ตุลาคม 2569</p>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-navy">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-navy-600">{children}</div>
    </section>
  )
}
