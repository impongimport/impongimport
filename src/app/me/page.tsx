import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText, LogOut } from 'lucide-react'
import { BillingForm } from '@/components/billing-form'
import { requireSession } from '@/lib/auth'
import { formatDateTime, quoteStatusLabel, quoteStatusTone } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { BillingProfile, QuoteRequest } from '@/lib/types'

export const metadata: Metadata = { title: 'บัญชีของฉัน' }

export default async function MePage() {
  const session = await requireSession('/me')
  const supabase = await createClient()

  const [{ data: billingRow }, { data: requestRows }] = await Promise.all([
    supabase.from('billing_profiles').select('*').eq('user_id', session.userId).maybeSingle(),
    supabase
      .from('quote_requests')
      .select('id, code, status, created_at, quote_request_items(id)')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false }),
  ])

  const billing = (billingRow as BillingProfile) ?? null
  const requests = (requestRows as unknown as QuoteRequest[]) ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">บัญชีของฉัน</h1>
          <span className="rule-gold mt-3" />
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-medium text-navy-500 transition hover:border-red-200 hover:text-red-600"
          >
            <LogOut className="size-4" /> ออกจากระบบ
          </button>
        </form>
      </div>

      {/* คำขอใบเสนอราคา */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-navy">คำขอใบเสนอราคา</h2>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-gold-700"
          >
            ขอใบเสนอราคาใหม่ <ArrowRight className="size-4" />
          </Link>
        </div>

        {requests.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-navy-200 px-6 py-12 text-center text-navy-400">
            ยังไม่มีคำขอใบเสนอราคา
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            {requests.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/me/requests/${r.id}`}
                  className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-navy-50/60"
                >
                  <FileText className="size-4 shrink-0 text-gold" />
                  <span className="font-display font-medium text-navy">{r.code}</span>
                  <span className="text-sm text-navy-400">
                    {r.quote_request_items?.length ?? 0} รายการ
                  </span>
                  <span className="text-sm text-navy-400">{formatDateTime(r.created_at)}</span>
                  <span
                    className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${quoteStatusTone[r.status]}`}
                  >
                    {quoteStatusLabel[r.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <BillingForm billing={billing} profile={session.profile} email={session.email} />
      </section>
    </div>
  )
}
