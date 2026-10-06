import Image from 'next/image'
import Link from 'next/link'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { site } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy text-navy-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Image
            src="/brand/logo-white.png"
            alt={site.nameEn}
            width={200}
            height={200}
            className="h-20 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {site.nameTh}
            <br />
            {site.tagline}
          </p>
          <p className="mt-3 text-xs text-navy-300">เลขทะเบียนนิติบุคคล {site.taxId}</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-wider text-white uppercase">
            เมนู
          </h3>
          <span className="rule-gold mt-3" />
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { href: '/products', label: 'สินค้าทั้งหมด' },
              { href: '/quote', label: 'ขอใบเสนอราคา' },
              { href: '/news', label: 'ข่าวสาร' },
              { href: '/about', label: 'เกี่ยวกับเรา' },
              { href: '/contact', label: 'ติดต่อเรา' },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-wider text-white uppercase">
            ติดต่อ
          </h3>
          <span className="rule-gold mt-3" />
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href={site.phoneHref} className="transition hover:text-gold">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href={site.lineUrl} target="_blank" rel="noreferrer" className="transition hover:text-gold">
                LINE {site.lineId}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
              <a href={`mailto:${site.email}`} className="transition hover:text-gold">
                {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span className="leading-relaxed">{site.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-5 text-xs text-navy-300 sm:px-6">
          <span>
            © {new Date().getFullYear()} {site.nameEn} · สงวนลิขสิทธิ์
          </span>
          <Link href="/privacy" className="transition hover:text-gold">
            นโยบายความเป็นส่วนตัว
          </Link>
          <Link href="/terms" className="transition hover:text-gold">
            ข้อกำหนดการใช้งาน
          </Link>
        </div>
      </div>
    </footer>
  )
}
