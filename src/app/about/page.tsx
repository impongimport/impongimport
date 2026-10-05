import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Hospital, Ship, Target } from 'lucide-react'
import { customers, site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา',
  description: site.description,
}

export default function AboutPage() {
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              {site.nameTh}
            </h1>
            <span className="rule-gold mt-4" />
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-200">
              เราเป็นผู้นำเข้าและจัดจำหน่ายอุปกรณ์การแพทย์แผนจีน
              ทั้งเข็มฝังเข็ม เครื่องกระตุ้นไฟฟ้า และชุดครอบแก้ว
              โดยมุ่งเน้นการให้บริการโรงพยาบาลและสถานพยาบาลขนาดใหญ่
              ที่ต้องการผู้จัดหาที่เชื่อถือได้และมีสินค้าต่อเนื่อง
            </p>
          </div>
          <div className="hidden justify-self-center md:block">
            <Image
              src="/brand/logo-white.png"
              alt={site.nameEn}
              width={380}
              height={380}
              className="w-full max-w-xs"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <span className="grid size-11 place-items-center rounded-xl bg-navy-50 text-navy">
              <Ship className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold text-navy">ความเป็นมา</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              ก่อตั้งเมื่อเดือนตุลาคม 2567 ต่อยอดจากประสบการณ์การนำเข้าและจัดจำหน่าย
              อุปกรณ์การแพทย์แผนจีนในประเทศไทยมาอย่างยาวนาน
            </p>
          </div>
          <div>
            <span className="grid size-11 place-items-center rounded-xl bg-navy-50 text-navy">
              <Target className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold text-navy">สิ่งที่เรามุ่งเน้น</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              จัดหาสินค้าคุณภาพในราคาที่เหมาะสม พร้อมเอกสารครบถ้วนสำหรับกระบวนการจัดซื้อ
              และส่งมอบได้ตรงตามกำหนด
            </p>
          </div>
          <div>
            <span className="grid size-11 place-items-center rounded-xl bg-navy-50 text-navy">
              <Hospital className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold text-navy">กลุ่มลูกค้า</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              โรงพยาบาลรัฐและเอกชน คลินิกการแพทย์แผนจีน ศูนย์เวชศาสตร์ฟื้นฟู
              โรงพยาบาลสัตว์ และสถาบันการศึกษา
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-navy-100 bg-navy-50/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-semibold text-navy">ลูกค้าที่ไว้วางใจเรา</h2>
          <span className="rule-gold mt-3" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((name) => (
              <div
                key={name}
                className="flex items-start gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3.5 text-sm text-navy-700"
              >
                <Hospital className="mt-0.5 size-4 shrink-0 text-gold" />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-navy px-8 py-14 text-center">
          <h2 className="font-display text-2xl font-semibold text-white">
            สนใจสั่งซื้อหรือขอใบเสนอราคา
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-navy-200">
            เลือกสินค้าจากแคตตาล็อก ระบุจำนวนที่ต้องการ แล้วส่งคำขอได้ทันที
            หรือติดต่อทีมงานโดยตรงทางโทรศัพท์และ LINE
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-medium text-navy-950 transition hover:bg-gold-300"
            >
              ดูแคตตาล็อก <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 font-medium text-white transition hover:border-gold hover:text-gold"
            >
              ช่องทางติดต่อ
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
