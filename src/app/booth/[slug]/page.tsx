import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Gift, PartyPopper } from 'lucide-react'
import { BoothForm } from '@/components/booth-form'
import { site } from '@/lib/site'
import { hasSupabase, supabasePublic } from '@/lib/supabase/public'
import type { BoothEvent } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getEvent(slug: string): Promise<BoothEvent | null> {
  if (!hasSupabase) return null
  const { data } = await supabasePublic
    .from('booth_events')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  return (data as BoothEvent) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const event = await getEvent((await params).slug)
  return {
    title: event ? `ลงทะเบียน ${event.name}` : 'ลงทะเบียนร่วมงาน',
    description: `ลงทะเบียนและทำแบบสอบถามที่บูธ ${site.short} รับสิทธิ์ร่วมจับฉลาก`,
    robots: { index: false, follow: false },
  }
}

export default async function BoothPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-200">
            <PartyPopper className="size-3.5" />
            {event.venue ?? 'งานออกบูธ'}
          </span>
          <h1 className="mt-5 font-display text-3xl leading-tight font-semibold break-words text-white">
            {event.name}
          </h1>
          <p className="mt-4 leading-relaxed text-navy-200">
            {event.intro ??
              'กรอกข้อมูลสั้น ๆ ไม่ถึงหนึ่งนาที เพื่อรับสิทธิ์ร่วมจับฉลากและให้ทีมงานติดต่อกลับเรื่องสินค้าที่ท่านสนใจ'}
          </p>
          {event.prize && (
            <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-white/5 px-4 py-3 text-sm leading-relaxed text-gold-100">
              <Gift className="mt-0.5 size-4 shrink-0 text-gold" />
              ของรางวัล: {event.prize}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <BoothForm slug={event.slug} />
      </section>
    </>
  )
}
