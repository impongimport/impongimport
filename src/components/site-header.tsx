'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FileText, LayoutDashboard, Menu, Phone, User, X } from 'lucide-react'
import { useQuoteCart } from './quote-cart'
import { site } from '@/lib/site'

const NAV = [
  { href: '/products', label: 'สินค้า' },
  { href: '/news', label: 'ข่าวสาร' },
  { href: '/about', label: 'เกี่ยวกับเรา' },
  { href: '/contact', label: 'ติดต่อเรา' },
]

type Props = { signedIn: boolean; isAdmin: boolean }

export function SiteHeader({ signedIn, isAdmin }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { count, ready } = useQuoteCart()

  const active = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-22 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/brand/mark-navy.png"
            alt={site.nameEn}
            width={358}
            height={395}
            priority
            className="h-13 w-auto"
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-xl font-semibold text-navy">
              {site.nameThShort}
            </span>
            <span className="text-xs tracking-wider text-navy-400">
              อุปกรณ์การแพทย์แผนจีน
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active(item.href)
                  ? 'text-navy'
                  : 'text-navy-500 hover:bg-navy-50 hover:text-navy'
              }`}
            >
              {item.label}
              {active(item.href) && <span className="rule-gold mt-1 w-full" />}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/quote"
            className="relative inline-flex items-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-sm font-medium text-navy transition hover:border-gold hover:text-gold-700"
          >
            <FileText className="size-4" />
            <span className="hidden sm:inline">ขอใบเสนอราคา</span>
            {ready && count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-gold text-[11px] font-semibold text-navy-950">
                {count}
              </span>
            )}
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-500 transition hover:bg-navy-50 hover:text-navy sm:inline-flex"
            >
              <LayoutDashboard className="size-4" />
              แอดมิน
            </Link>
          )}

          <Link
            href={signedIn ? '/me' : '/login'}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white transition hover:bg-navy-700"
          >
            <User className="size-4" />
            <span className="hidden sm:inline">{signedIn ? 'บัญชีของฉัน' : 'เข้าสู่ระบบ'}</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="เมนู"
            className="rounded-lg p-2 text-navy md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-navy-100 bg-white md:hidden" onClick={() => setOpen(false)}>
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-3 text-sm font-medium ${
                  active(item.href) ? 'bg-navy-50 text-navy' : 'text-navy-500'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="block rounded-lg px-3 py-3 text-sm font-medium text-navy-500">
                แอดมิน
              </Link>
            )}
            <a
              href={site.phoneHref}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-navy-500"
            >
              <Phone className="size-4" />
              {site.phone}
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
