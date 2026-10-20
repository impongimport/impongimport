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
  Gift,
  Monitor,
  Shuffle,
  Trophy,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { BoothEventDelete } from '@/components/booth-event-delete'
import { BoothEventForm } from '@/components/booth-event-form'
import { BoothPrizeForm } from '@/components/booth-prize-form'
import {
  createQuoteFromEntry,
  confirmAllEntries,
  deletePrize,
  drawBoothWinner,
  toggleEntryConfirmed,
  undoBoothWinner,
} from '@/lib/actions/booth'
import { formatPhone, summarizeAnswers } from '@/lib/booth'
import { formatDateTime } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { BoothEntry, BoothEvent, BoothPrize } from '@/lib/types'

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

  const [{ data: eventRow }, { data: entryRows }, { data: prizeRows }] = await Promise.all([
    supabase.from('booth_events').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('booth_entries')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('booth_prizes').select('*').eq('event_id', id).order('sort_order'),
  ])

  if (!eventRow) notFound()
  const event = eventRow as BoothEvent
  const entries = (entryRows as BoothEntry[]) ?? []
  const prizes = (prizeRows as BoothPrize[]) ?? []

  const winners = entries
    .filter((e) => e.is_winner)
    .sort((a, b) => (b.won_at ?? '').localeCompare(a.won_at ?? ''))
  const prizeById = new Map(prizes.map((p) => [p.id, p]))
  const awardedByPrize = new Map<string, number>()
  for (const w of winners) {
    if (w.prize_id) awardedByPrize.set(w.prize_id, (awardedByPrize.get(w.prize_id) ?? 0) + 1)
  }
  const confirmed = entries.filter((e) => e.confirmed_at)
  const drawPool = confirmed.filter((e) => !e.is_winner)

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
        {entries.length} รายชื่อ · ยืนยันสิทธิ์แล้ว {confirmed.length} · {winners.length} ผู้โชคดี
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
            <p className="pt-2 text-left text-xs leading-relaxed text-navy-400">
              ใช้ iPad เป็นจอได้ เปิดลิงก์จอสรุปผลใน Safari แล้วกดปุ่มแชร์ →
              “เพิ่มไปยังหน้าจอโฮม” จะได้เต็มจอไม่มีแถบเบราว์เซอร์ ·
              หน้านี้สั่งไม่ให้จอดับให้อยู่แล้ว ถ้า iPad ยังหลับให้ตั้ง
              ตั้งค่า → จอภาพและความสว่าง → ล็อกอัตโนมัติ เป็น “ไม่เลย”
            </p>
          </div>
        </div>

        <div>
          {/* จับฉลากทีละรางวัล */}
          <section className="rounded-2xl border border-gold/40 bg-gold-50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-navy">
              <Trophy className="size-4 text-gold-600" /> จับฉลาก
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              กดสุ่มได้เท่ากับจำนวนของรางวัลแต่ละระดับ ระบบสุ่มเฉพาะคนที่
              <strong className="font-medium text-navy"> ยืนยันสิทธิ์แล้ว </strong>
              (ส่งรูปเลขสิทธิ์เข้า LINE) และยังไม่เคยถูกรางวัล — ตอนนี้สุ่มได้ {drawPool.length} คน
            </p>

            {prizes.length === 0 ? (
              <p className="mt-5 rounded-xl bg-white px-4 py-3 text-sm text-navy-500">
                ยังไม่ได้ตั้งของรางวัล เพิ่มได้ที่หัวข้อ “ของรางวัล” ด้านล่าง
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {prizes.map((prize) => {
                  const awarded = awardedByPrize.get(prize.id) ?? 0
                  const left = prize.quantity - awarded
                  return (
                    <li
                      key={prize.id}
                      className="flex flex-wrap items-center gap-4 rounded-xl bg-white px-4 py-3"
                    >
                      {prize.image_url && (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                          <Image
                            src={prize.image_url}
                            alt={prize.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium break-words text-navy">{prize.name}</p>
                        <p className="mt-0.5 text-sm text-navy-400">
                          จับแล้ว {awarded} / {prize.quantity}
                          {left > 0 && ` · เหลืออีก ${left}`}
                        </p>
                      </div>
                      <form action={drawBoothWinner}>
                        <input type="hidden" name="event_id" value={event.id} />
                        <input type="hidden" name="prize_id" value={prize.id} />
                        <button
                          type="submit"
                          disabled={left <= 0 || drawPool.length === 0}
                          className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white transition hover:bg-navy-700 disabled:opacity-40"
                        >
                          <Shuffle className="size-4" />
                          {left <= 0 ? 'ครบแล้ว' : 'สุ่ม'}
                        </button>
                      </form>
                    </li>
                  )
                })}
              </ul>
            )}

            {drawPool.length === 0 && (
              <p className="mt-4 text-sm text-navy-400">
                {entries.length === 0
                  ? 'ยังไม่มีผู้ลงทะเบียน'
                  : confirmed.length === 0
                    ? 'ยังไม่มีใครยืนยันสิทธิ์ — กดยืนยันในรายชื่อด้านล่างเมื่อได้รับรูปทางไลน์'
                    : 'คนที่ยืนยันสิทธิ์ถูกรางวัลครบทุกคนแล้ว'}
              </p>
            )}

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
                    {w.prize_id && (
                      <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-gold-700">
                        {prizeById.get(w.prize_id)?.name ?? 'ของรางวัล'}
                      </span>
                    )}
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

          {/* ของรางวัล */}
          <section className="mt-8">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-navy">
              <Gift className="size-4 text-gold" /> ของรางวัล
            </h3>
            <p className="mt-2 text-sm text-navy-400">
              ตั้งได้หลายระดับ เช่น รางวัลที่ 1 จำนวน 4 รางวัล และรางวัลที่ 2 จำนวน 6 รางวัล
            </p>

            <div className="mt-4 space-y-4">
              {prizes.map((prize) => (
                <div key={prize.id} className="rounded-2xl border border-navy-100 bg-white p-6">
                  <BoothPrizeForm eventId={event.id} prize={prize} />
                  <form action={deletePrize} className="mt-4 border-t border-navy-100 pt-4">
                    <input type="hidden" name="id" value={prize.id} />
                    <input type="hidden" name="event_id" value={event.id} />
                    <button
                      type="submit"
                      className="text-sm text-navy-400 transition hover:text-red-600"
                    >
                      ลบรางวัลนี้
                    </button>
                  </form>
                </div>
              ))}

              <div className="rounded-2xl border border-dashed border-navy-200 bg-white p-6">
                <p className="mb-4 text-sm font-medium text-navy-600">เพิ่มของรางวัล</p>
                <BoothPrizeForm eventId={event.id} prize={null} nextOrder={prizes.length} />
              </div>
            </div>
          </section>

          {/* รายชื่อ */}
          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-base font-semibold text-navy">
                รายชื่อผู้ลงทะเบียน
              </h3>
              {entries.length > confirmed.length && (
                <form action={confirmAllEntries}>
                  <input type="hidden" name="event_id" value={event.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:border-emerald-300"
                  >
                    <CheckCircle2 className="size-4" />
                    ยืนยันสิทธิ์ทั้งหมด ({entries.length - confirmed.length} คน)
                  </button>
                </form>
              )}
            </div>
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
                          {entry.prize_id
                            ? (prizeById.get(entry.prize_id)?.name ?? 'ผู้โชคดี')
                            : 'ผู้โชคดี'}
                        </span>
                      )}
                      {entry.confirmed_at && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="size-3" /> ยืนยันสิทธิ์แล้ว
                        </span>
                      )}
                      {entry.user_id && (
                        <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-600">
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

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <form action={toggleEntryConfirmed}>
                        <input type="hidden" name="id" value={entry.id} />
                        <input type="hidden" name="event_id" value={event.id} />
                        <input
                          type="hidden"
                          name="confirmed"
                          value={entry.confirmed_at ? '1' : '0'}
                        />
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                            entry.confirmed_at
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                              : 'border-navy-200 text-navy hover:border-gold'
                          }`}
                        >
                          {entry.confirmed_at ? (
                            <>
                              <CheckCircle2 className="size-4" /> ยืนยันแล้ว
                            </>
                          ) : (
                            <>
                              <Circle className="size-4 text-navy-300" /> กดยืนยันสิทธิ์
                            </>
                          )}
                        </button>
                      </form>

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

            <div className="mt-6">
              <BoothEventDelete
                eventId={event.id}
                slug={event.slug}
                entryCount={entries.length}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
