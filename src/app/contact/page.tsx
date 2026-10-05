import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, FileText, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'ติดต่อเรา',
  description: `ติดต่อ ${site.nameTh} โทร ${site.phone} · LINE ${site.lineId} · ${site.email}`,
}

const mapQuery = encodeURIComponent(site.address)

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50/50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-navy">ติดต่อเรา</h1>
          <span className="rule-gold mt-3" />
          <p className="mt-4 max-w-2xl leading-relaxed text-navy-500">
            ทีมงานพร้อมให้คำแนะนำเรื่องสินค้า จำนวนสั่งซื้อ และเอกสารประกอบการจัดซื้อ
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ContactRow icon={Phone} label="โทรศัพท์" href={site.phoneHref} value={site.phone} />
          <ContactRow
            icon={MessageCircle}
            label="LINE Official"
            href={site.lineUrl}
            value={site.lineId}
            external
          />
          <ContactRow
            icon={Mail}
            label="อีเมล"
            href={`mailto:${site.email}`}
            value={site.email}
          />
          <ContactRow icon={MapPin} label="ที่ตั้งสำนักงาน" value={site.address} />
          <ContactRow icon={Clock} label="เวลาทำการ" value={site.hours} />

          <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-6">
            <h2 className="flex items-center gap-2 font-semibold text-navy">
              <FileText className="size-4 text-gold" /> ต้องการใบเสนอราคา
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              เลือกสินค้าจากแคตตาล็อกและส่งคำขอผ่านเว็บไซต์ได้เลย
              ระบบจะบันทึกข้อมูลผู้เสียภาษีของท่านไว้ใช้กับคำขอครั้งถัดไป
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white transition hover:bg-navy-700"
            >
              ไปที่แคตตาล็อก
            </Link>
          </div>

          <p className="text-xs text-navy-400">
            {site.nameTh} · เลขทะเบียนนิติบุคคล {site.taxId}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-navy-100">
          <iframe
            title="แผนที่สำนักงาน"
            src={`https://maps.google.com/maps?q=${mapQuery}&hl=th&z=16&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full min-h-100 w-full"
          />
        </div>
      </section>
    </>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
  external?: boolean
}) {
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-xs tracking-wide text-navy-400">{label}</span>
        <span className="mt-0.5 block leading-relaxed font-medium text-navy">{value}</span>
      </span>
    </>
  )

  const className =
    'flex items-start gap-4 rounded-2xl border border-navy-100 bg-white p-5 transition hover:border-gold'

  return href ? (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  )
}
