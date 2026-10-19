import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Monitor,
  Shuffle,
  Trophy,
} from 'lucide-react'
import { BoothEventForm } from '@/components/booth-event-form'
import {
  createQuoteFromEntry,
  drawBoothWinner,
  undoBoothWinner,
} from '@/lib/actions/booth'
import { formatPhone, summarizeAnswers } from '@/lib/booth'
import { formatDateTime } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { BoothEntry, BoothEvent } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const host = (await headers()).get('host') ?? 'localhost:3011'
  return `${host.startsWith('localhost') ? 'http' : 'https'}://${host}`
}

export default async function AdminBoothEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: eventRow }, { data: entryRows }] = await Promise.all([
    supabase.from('booth_events').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('booth_entries')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!eventRow) notFound()
  const event = eventRow as BoothEvent
  const entries = (entryRows as BoothEntry[]) ?? []
  const winners = entries.filter((e) => e.is_winner)

  const baseUrl = await getBaseUrl()
  const formUrl = `${baseUrl}/booth/${event.slug}`
  const qr = await QRCode.toDataURL(formUrl, {
    width: 720,
    margin: 1,
    color: { dark: '#1a344b', light: '#ffffff' },
  })

  return (
    <>
      <Link
        href="/admin/booth"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-gold-700"
      >
        <ArrowLeft className="size-4" /> งานออกบูธทั้งหมด
      </Link>

      <h2 className="mt-5 font-display text-2xl font-semibold text-navy">{event.name}</h2>
      <p className="mt-1 text-sm text-navy-400">
        {entries.length} รายชื่อ · {winners.length} ผู้โชคดี
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        {/* QR สำหรับพิมพ์ติดบูธ */}
        <div className="rounded-2xl border border-navy-100 bg-white p-6 text-center">
          <Image
            src={qr}
            alt={`QR ลงทะเบียน ${event.name}`}
            width={720}
            height={720}
            unoptimized
            className="mx-auto w-full max-w-[240px] rounded-xl"
          />
          <p className="mt-4 text-xs break-all text-navy-400">{formUrl}</p>
          <div className="mt-5 space-y-2.5">
            <a
              href={qr}
              download={`qr-${event.slug}.png`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white transition hover:bg-navy-700"
            >
              <Download className="size-4" /> ดาวน์โหลด QR
            </a>
            <a
              href={formUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition hover:border-gold"
            >
              <ExternalLink className="size-4" /> เปิดฟอร์ม
            </a>
            <a
              href={`${baseUrl}/booth/${event.slug}/stats`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition hover:border-gold"
            >
              <Monitor className="size-4" /> จอสรุปผล
            </a>
            <a
              href={`/admin/booth/${event.id}/export`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition hover:border-gold"
            >
              <Download className="size-4" /> ดาวน์โหลด CSV
            </a>
          </div>
        </div>

        <div>
          {/* จับฉลาก */}
          <section className="rounded-2xl border border-gold/40 bg-gold-50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-navy">
              <Trophy className="size-4 text-gold-600" /> จับฉลาก
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              ระบบสุ่มจากผู้ลงทะเบียนที่ยังไม่เคยถูกรางวัล กดได้หลายครั้งถ้ามีของรางวัลหลายชิ้น
            </p>
            <form action={drawBoothWinner} className="mt-5">
              <input type="hidden" name="event_id" value={event.id} />
              <button
                type="submit"
                disabled={entries.length === winners.length}
                className="inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700 disabled:opacity-50"
              >
                <Shuffle className="size-4" />
                {entries.length === 0
                  ? 'ยังไม่มีผู้ลงทะเบียน'
                  : entries.length === winners.length
                    ? 'จับครบทุกคนแล้ว'
                    : 'สุ่มผู้โชคดี'}
              </button>
            </form>

            {winners.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {winners.map((w) => (
                  <li
                    key={w.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3"
                  >
                    <span className="font-display font-semibold text-gold-700">
                      {w.ticket_code}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-navy-700">
                      {w.full_name} · {w.org_name}
                    </span>
                    <a
                      href={`tel:${w.phone}`}
                      className="text-sm font-medium text-navy hover:text-gold-700"
                    >
                      {formatPhone(w.phone)}
                    </a>
                    <form action={undoBoothWinner}>
                      <input type="hidden" name="id" value={w.id} />
                      <input type="hidden" name="event_id" value={event.id} />
                      <button
                        type="submit"
                        className="text-xs text-navy-400 transition hover:text-red-600"
                      >
                        ยกเลิก
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* รายชื่อ */}
          <section className="mt-8">
            <h3 className="font-display text-base font-semibold text-navy">รายชื่อผู้ลงทะเบียน</h3>
            {entries.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-navy-200 px-6 py-12 text-center text-navy-400">
                ยังไม่มีใครลงทะเบียน
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
                {entries.map((entry) => (
                  <li key={entry.id} className="px-6 py-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display font-medium text-navy">
                        {entry.ticket_code}
                      </span>
                      {entry.is_winner && (
                        <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-gold-700">
                          ผู้โชคดี
                        </span>
                      )}
                      {entry.user_id && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          มีบัญชีในระบบ
                        </span>
                      )}
                      <span className="ml-auto text-sm text-navy-400">
                        {formatDateTime(entry.created_at)}
                      </span>
                    </div>

                    <p className="mt-2 font-medium text-navy-700">
                      {entry.full_name}
                      {entry.role && <span className="text-navy-400"> · {entry.role}</span>}
                    </p>
                    <p className="text-sm text-navy-500">{entry.org_name}</p>
                    <p className="mt-1 text-sm text-navy-400">
                      <a href={`tel:${entry.phone}`} className="hover:text-gold-700">
                        {formatPhone(entry.phone)}
                      </a>
                      {entry.email && ` · ${entry.email}`}
                    </p>

                    <ul className="mt-3 space-y-1 text-sm text-navy-500">
                      {summarizeAnswers(entry.answers).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>

                    <div className="mt-4">
                      {entry.quote_request_id ? (
                        <Link
                          href={`/admin/quotes/${entry.quote_request_id}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-gold-700"
                        >
                          <FileText className="size-4 text-gold" /> ดูคำขอใบเสนอราคา
                        </Link>
                      ) : (
                        <form action={createQuoteFromEntry}>
                          <input type="hidden" name="id" value={entry.id} />
                          <input type="hidden" name="event_id" value={event.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy transition hover:border-gold"
                          >
                            <FileText className="size-4 text-gold" /> สร้างคำขอใบเสนอราคา
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <h3 className="font-display text-base font-semibold text-navy">แก้ไขรายละเอียดงาน</h3>
            <div className="mt-4">
              <BoothEventForm event={event} />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
