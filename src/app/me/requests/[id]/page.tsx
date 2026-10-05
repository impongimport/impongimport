import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { ClearCart } from '@/components/clear-cart'
import { cancelQuoteRequest } from '@/lib/actions/quote'
import { requireSession } from '@/lib/auth'
import { formatDateTime, formatTaxId, quoteStatusLabel, quoteStatusTone } from '@/lib/format'
import { site } from '@/lib/site'
import { createClient } from '@/lib/supabase/server'
import type { QuoteRequest } from '@/lib/types'

export const metadata: Metadata = { title: 'รายละเอียดคำขอ' }

export default async function RequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ new?: string }>
}) {
  const { id } = await params
  const { new: isNew } = await searchParams
  await requireSession(`/me/requests/${id}`)

  const supabase = await createClient()
  const { data } = await supabase
    .from('quote_requests')
    .select('*, quote_request_items(*)')
    .eq('id', id)
    .maybeSingle()

  if (!data) notFound()
  const request = data as unknown as QuoteRequest
  const billing = request.billing ?? {}
  const canCancel = request.status === 'new' || request.status === 'in_progress'

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {isNew && <ClearCart />}

      <Link
        href="/me"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-gold-700"
      >
        <ArrowLeft className="size-4" /> บัญชีของฉัน
      </Link>

      {isNew && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div className="text-sm text-emerald-900">
            <p className="font-semibold">ส่งคำขอเรียบร้อยแล้ว</p>
            <p className="mt-1 leading-relaxed">
              ทีมงานจะตรวจสอบและติดต่อกลับพร้อมใบเสนอราคาโดยเร็วที่สุด
              หากต้องการเร่งด่วน โทร {site.phone} หรือทัก LINE {site.lineId}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-2xl font-semibold text-navy">{request.code}</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${quoteStatusTone[request.status]}`}
        >
          {quoteStatusLabel[request.status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-navy-400">ส่งเมื่อ {formatDateTime(request.created_at)}</p>

      <section className="mt-8 overflow-hidden rounded-2xl border border-navy-100 bg-white">
        <h2 className="border-b border-navy-100 px-6 py-4 font-semibold text-navy">รายการสินค้า</h2>
        <ul className="divide-y divide-navy-100">
          {(request.quote_request_items ?? []).map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-navy">{item.product_name}</p>
                {item.variant_name && (
                  <p className="mt-1 text-sm text-navy-400">{item.variant_name}</p>
                )}
              </div>
              <span className="text-sm font-medium text-navy-600">× {item.quantity}</span>
            </li>
          ))}
        </ul>
      </section>

      {request.note && (
        <section className="mt-6 rounded-2xl border border-navy-100 bg-white p-6">
          <h2 className="font-semibold text-navy">หมายเหตุ</h2>
          <p className="mt-2 leading-relaxed whitespace-pre-line text-navy-600">{request.note}</p>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-navy-100 bg-white p-6">
        <h2 className="font-semibold text-navy">ข้อมูลสำหรับออกใบกำกับภาษี</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Row label="ชื่อผู้เสียภาษี" value={billing.org_name} />
          <Row label="เลขประจำตัวผู้เสียภาษี" value={formatTaxId(billing.tax_id)} />
          <Row label="สาขา" value={billing.branch} />
          <Row label="ผู้ติดต่อ" value={billing.contact_name} />
          <Row label="โทรศัพท์" value={billing.contact_phone} />
          <Row label="อีเมล" value={billing.contact_email} />
          <Row
            label="ที่อยู่"
            value={[
              billing.address,
              billing.subdistrict,
              billing.district,
              billing.province,
              billing.postal_code,
            ]
              .filter(Boolean)
              .join(' ')}
            wide
          />
        </dl>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={site.phoneHref}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition hover:border-gold"
        >
          <Phone className="size-4 text-gold" /> {site.phone}
        </a>
        <a
          href={site.lineUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition hover:border-gold"
        >
          <MessageCircle className="size-4 text-gold" /> LINE {site.lineId}
        </a>

        {canCancel && (
          <form action={cancelQuoteRequest} className="ml-auto">
            <input type="hidden" name="id" value={request.id} />
            <button
              type="submit"
              className="rounded-xl px-5 py-3 text-sm font-medium text-navy-400 transition hover:bg-red-50 hover:text-red-600"
            >
              ยกเลิกคำขอ
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="text-navy-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-navy-700">{value || '—'}</dd>
    </div>
  )
}
