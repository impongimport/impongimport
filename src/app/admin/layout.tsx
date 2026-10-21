import Link from 'next/link'
import {
  FileText,
  LayoutDashboard,
  Newspaper,
  Package,
  QrCode,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { isSuperadmin, requireAdmin } from '@/lib/auth'

const NAV = [
  { href: '/admin', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/admin/quotes', label: 'คำขอใบเสนอราคา', icon: FileText },
  { href: '/admin/products', label: 'สินค้า', icon: Package },
  { href: '/admin/news', label: 'ข่าวสาร', icon: Newspaper },
  { href: '/admin/customers', label: 'ลูกค้า', icon: Users },
  { href: '/admin/booth', label: 'งานออกบูธ', icon: QrCode },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()
  // หน้าจัดการสิทธิ์เปิดให้เฉพาะผู้ดูแลสูงสุด
  const nav = isSuperadmin(session.profile)
    ? [...NAV, { href: '/admin/users', label: 'สิทธิ์เข้าระบบ', icon: ShieldCheck }]
    : NAV

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-navy">ระบบจัดการ</h1>
      <span className="rule-gold mt-3" />

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-navy-100 pb-4">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-navy-600 transition hover:bg-navy-50 hover:text-navy"
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  )
}
