import Link from 'next/link'
import { formatDateTime, quoteStatusLabel, quoteStatusTone } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { QuoteRequest, QuoteStatus } from '@/lib/types'

const STATUSES: QuoteStatus[] = ['new', 'in_progress', 'quoted', 'won', 'lost', 'cancelled']

export default async function AdminQuotes({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('quote_requests')
    .select('id, code, status, created_at, billing, contact_name, contact_phone, quote_request_items(id)')
    .order('created_at', { ascending: false })
  if (status && STATUSES.includes(status as QuoteStatus)) query = query.eq('status', status)

  const { data } = await query
  const requests = (data as unknown as QuoteRequest[]) ?? []

  return (
    <>
      <nav className="flex flex-wrap gap-2">
        <Chip href="/admin/quotes" label="ทั้งหมด" active={!status} />
        {STATUSES.map((s) => (
          <Chip
            key={s}
            href={`/admin/quotes?status=${s}`}
            label={quoteStatusLabel[s]}
            active={status === s}
          />
        ))}
      </nav>

      {requests.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-navy-200 px-6 py-16 text-center text-navy-400">
          ไม่มีคำขอในสถานะนี้
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/quotes/${r.id}`}
                className="block px-6 py-4 transition hover:bg-navy-50/60"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display font-medium text-navy">{r.code}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${quoteStatusTone[r.status]}`}
                  >
                    {quoteStatusLabel[r.status]}
                  </span>
                  <span className="ml-auto text-sm text-navy-400">
                    {formatDateTime(r.created_at)}
                  </span>
                </div>
                <p className="mt-1.5 font-medium text-navy-700">{r.billing?.org_name ?? '—'}</p>
                <p className="mt-0.5 text-sm text-navy-400">
                  {r.quote_request_items?.length ?? 0} รายการ
                  {r.contact_name && ` · ${r.contact_name}`}
                  {r.contact_phone && ` · ${r.contact_phone}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-navy bg-navy text-white'
          : 'border-navy-200 text-navy-600 hover:border-gold hover:text-gold-700'
      }`}
    >
      {label}
    </Link>
  )
}
