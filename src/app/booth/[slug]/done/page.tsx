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

        <p className="mt-6 text-sm leading-relaxed text-navy-500">
          กรุณาบันทึกหน้าจอนี้ไว้ {event?.ends_on && 'ประกาศผลวันสุดท้ายของงาน '}
          ทีมงานจะติดต่อผู้โชคดีทางเบอร์โทรที่ลงทะเบียนไว้
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={site.lineUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white transition hover:bg-navy-700"
          >
            <MessageCircle className="size-4" /> เพิ่มเพื่อน LINE {site.lineId}
          </a>
          <a
            href={site.phoneHref}
            className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-5 py-3 text-sm font-medium text-navy transition hover:border-gold"
          >
            <Phone className="size-4 text-gold" /> {site.phone}
          </a>
        </div>

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
