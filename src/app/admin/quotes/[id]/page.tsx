import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { updateQuoteStatus } from '@/lib/actions/admin'
import { formatDateTime, formatTaxId, quoteStatusLabel } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { QuoteRequest, QuoteStatus } from '@/lib/types'

const STATUSES: QuoteStatus[] = ['new', 'in_progress', 'quoted', 'won', 'lost', 'cancelled']

export default async function AdminQuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('quote_requests')
    .select('*, quote_request_items(*), profiles(id, email, full_name)')
    .eq('id', id)
    .maybeSingle()

  if (!data) notFound()
  const request = data as unknown as QuoteRequest
  const b = request.billing ?? {}

  return (
    <>
      <Link
        href="/admin/quotes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-gold-700"
      >
        <ArrowLeft className="size-4" /> คำขอทั้งหมด
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy">{request.code}</h2>
          <p className="mt-1 text-sm text-navy-400">ส่งเมื่อ {formatDateTime(request.created_at)}</p>

          <section className="mt-6 overflow-hidden rounded-2xl border border-navy-100 bg-white">
            <h3 className="border-b border-navy-100 px-6 py-4 font-semibold text-navy">
              รายการสินค้า
            </h3>
            <ul className="divide-y divide-navy-100">
              {(request.quote_request_items ?? []).map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-navy">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="mt-1 text-sm text-navy-400">{item.variant_name}</p>
                    )}
                  </div>
                  <span className="font-medium text-navy-600">× {item.quantity}</span>
                </li>
              ))}
            </ul>
          </section>

          {request.note && (
            <section className="mt-6 rounded-2xl border border-navy-100 bg-white p-6">
              <h3 className="font-semibold text-navy">หมายเหตุจากลูกค้า</h3>
              <p className="mt-2 leading-relaxed whitespace-pre-line text-navy-600">
                {request.note}
              </p>
            </section>
          )}

          <section className="mt-6 rounded-2xl border border-navy-100 bg-white p-6">
            <h3 className="font-semibold text-navy">ข้อมูลออกใบกำกับภาษี</h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Row label="ชื่อผู้เสียภาษี" value={b.org_name} />
              <Row label="เลขประจำตัวผู้เสียภาษี" value={formatTaxId(b.tax_id)} />
              <Row label="สาขา" value={b.branch} />
              <Row label="ผู้ติดต่อ" value={b.contact_name} />
              <Row label="โทรศัพท์" value={b.contact_phone} />
              <Row label="อีเมล" value={b.contact_email} />
              <Row
                label="ที่อยู่"
                wide
                value={[b.address, b.subdistrict, b.district, b.province, b.postal_code]
                  .filter(Boolean)
                  .join(' ')}
              />
            </dl>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              {b.contact_phone && (
                <a
                  href={`tel:${b.contact_phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-4 py-2.5 font-medium text-navy hover:border-gold"
                >
                  <Phone className="size-4 text-gold" /> โทร
                </a>
              )}
              {(b.contact_email || request.contact_email) && (
                <a
                  href={`mailto:${b.contact_email || request.contact_email}?subject=${encodeURIComponent(`ใบเสนอราคา ${request.code} — IMPONG IMPORT`)}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-4 py-2.5 font-medium text-navy hover:border-gold"
                >
                  <Mail className="size-4 text-gold" /> ส่งอีเมล
                </a>
              )}
            </div>
          </section>
        </div>

        <form
          action={updateQuoteStatus}
          className="rounded-2xl border border-navy-100 bg-white p-6 lg:sticky lg:top-24"
        >
          <input type="hidden" name="id" value={request.id} />
          <h3 className="font-semibold text-navy">อัปเดตสถานะ</h3>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-navy-600">สถานะ</span>
            <select
              name="status"
              defaultValue={request.status}
              className="mt-2 w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy outline-none focus:border-gold"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {quoteStatusLabel[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-navy-600">บันทึกภายใน</span>
            <textarea
              name="admin_note"
              rows={5}
              defaultValue={request.admin_note ?? ''}
              placeholder="เช่น ส่งใบเสนอราคาเลขที่… เมื่อ…"
              className="mt-2 w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy outline-none placeholder:text-navy-300 focus:border-gold"
            />
            <span className="mt-1.5 block text-xs text-navy-400">ลูกค้าไม่เห็นข้อความนี้</span>
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700"
          >
            บันทึก
          </button>

          <div className="mt-6 border-t border-navy-100 pt-5 text-sm">
            <p className="text-navy-400">บัญชีผู้ขอ</p>
            <p className="mt-1 font-medium text-navy-700">
              {request.profiles?.full_name || request.profiles?.email || '—'}
            </p>
            {request.profiles?.email && (
              <p className="text-navy-400">{request.profiles.email}</p>
            )}
          </div>
        </form>
      </div>
    </>
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
