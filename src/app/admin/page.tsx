import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatDateTime, quoteStatusLabel, quoteStatusTone } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { QuoteRequest } from '@/lib/types'

export default async function AdminHome() {
  const supabase = await createClient()

  const [newCount, totalQuotes, products, news, recent] = await Promise.all([
    supabase.from('quote_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('quote_requests').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('news').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase
      .from('quote_requests')
      .select('id, code, status, created_at, billing')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const stats = [
    { label: 'คำขอใหม่', value: newCount.count ?? 0, href: '/admin/quotes?status=new' },
    { label: 'คำขอทั้งหมด', value: totalQuotes.count ?? 0, href: '/admin/quotes' },
    { label: 'สินค้า', value: products.count ?? 0, href: '/admin/products' },
    { label: 'ข่าวที่เผยแพร่', value: news.count ?? 0, href: '/admin/news' },
  ]

  const requests = (recent.data as unknown as QuoteRequest[]) ?? []

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-navy-100 bg-white p-6 transition hover:border-gold"
          >
            <p className="text-sm text-navy-400">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-navy">{s.value}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">คำขอล่าสุด</h2>
          <Link
            href="/admin/quotes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-gold-700"
          >
            ดูทั้งหมด <ArrowRight className="size-4" />
          </Link>
        </div>

        {requests.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-navy-200 px-6 py-12 text-center text-navy-400">
            ยังไม่มีคำขอ
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {requests.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/quotes/${r.id}`}
                  className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-navy-50/60"
                >
                  <span className="font-display font-medium text-navy">{r.code}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-navy-500">
                    {r.billing?.org_name ?? '—'}
                  </span>
                  <span className="text-sm text-navy-400">{formatDateTime(r.created_at)}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${quoteStatusTone[r.status]}`}
                  >
                    {quoteStatusLabel[r.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
