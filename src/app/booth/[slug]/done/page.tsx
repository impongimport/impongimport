import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, MessageCircle, Phone, Ticket } from 'lucide-react'
import { site } from '@/lib/site'
import { hasSupabase, supabasePublic } from '@/lib/supabase/public'
import type { BoothEvent } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ลงทะเบียนเรียบร้อย',
  robots: { index: false, follow: false },
}

export default async function BoothDonePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ t?: string; again?: string }>
}) {
  const { slug } = await params
  const { t: ticket, again } = await searchParams
  if (!ticket) notFound()

  let event: BoothEvent | null = null
  if (hasSupabase) {
    const { data } = await supabasePublic
      .from('booth_events')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    event = (data as BoothEvent) ?? null
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-14 text-emerald-500" strokeWidth={1.5} />
        <h1 className="mt-5 font-display text-2xl font-semibold text-navy">
          {again ? 'ท่านลงทะเบียนไว้แล้ว' : 'ลงทะเบียนเรียบร้อย'}
        </h1>
        <p className="mt-3 leading-relaxed text-navy-500">
          {again
            ? 'เบอร์นี้เคยลงทะเบียนในงานนี้แล้ว นี่คือหมายเลขสิทธิ์เดิมของท่าน'
            : 'ขอบคุณที่ร่วมตอบแบบสอบถาม นี่คือหมายเลขสิทธิ์จับฉลากของท่าน'}
        </p>

        <div className="mt-7 rounded-2xl bg-navy px-6 py-7">
          <span className="inline-flex items-center gap-2 text-xs tracking-widest text-gold-200 uppercase">
            <Ticket className="size-3.5" /> หมายเลขสิทธิ์
          </span>
          <p className="mt-2 font-display text-4xl font-semibold tracking-wider text-gold">
            {ticket}
          </p>
        </div>

        {/* ขั้นตอนสุดท้าย — จุดนี้คือตัวผลักให้คนเพิ่มเพื่อน LINE OA */}
        <div className="mt-8 rounded-2xl border border-navy-100 bg-navy-50/60 p-6 text-left">
          <h2 className="text-center font-display text-lg font-semibold text-navy">
            อีกขั้นตอนเพื่อยืนยันสิทธิ์
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-navy-500">
            เฉพาะผู้ที่ส่งรูปยืนยันแล้วเท่านั้นที่มีสิทธิ์ร่วมจับฉลาก
          </p>
          <ol className="mt-5 space-y-4">
            <Step n={1}>
              <strong className="font-medium text-navy">แคปหน้าจอนี้เก็บไว้</strong>{' '}
              ให้เห็นหมายเลข {ticket}
            </Step>
            <Step n={2}>
              <strong className="font-medium text-navy">เพิ่มเพื่อน LINE {site.lineId}</strong>{' '}
              จากปุ่มด้านล่าง
            </Step>
            <Step n={3}>
              <strong className="font-medium text-navy">ส่งรูปที่แคปเข้าไลน์</strong>{' '}
              ทีมงานจะตอบกลับยืนยันสิทธิ์ให้
            </Step>
          </ol>

          <a
            href={site.lineUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#06C755] px-6 py-4 text-base font-semibold whitespace-nowrap text-white transition hover:brightness-95 sm:text-lg"
          >
            <MessageCircle className="size-5 shrink-0" />
            เพิ่มเพื่อน LINE {site.lineId}
          </a>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-navy-500">
          {event?.ends_on ? 'ประกาศผลวันสุดท้ายของงาน · ' : ''}
          ทีมงานจะติดต่อผู้โชคดีทางเบอร์โทรที่ลงทะเบียนไว้
        </p>

        <a
          href={site.phoneHref}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition hover:border-gold"
        >
          <Phone className="size-4 text-gold" /> {site.phone}
        </a>

        <Link
          href="/products"
          className="mt-6 inline-block text-sm font-medium text-navy-500 hover:text-gold-700"
        >
          ดูแคตตาล็อกสินค้าทั้งหมด
        </Link>
      </div>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-sm font-semibold text-white">
        {n}
      </span>
      <span className="text-sm leading-relaxed text-navy-600">{children}</span>
    </li>
  )
}
