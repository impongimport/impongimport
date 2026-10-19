import Link from 'next/link'
import { ArrowRight, QrCode } from 'lucide-react'
import { BoothEventForm } from '@/components/booth-event-form'
import { formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { BoothEvent } from '@/lib/types'

export default async function AdminBoothPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('booth_events')
    .select('*, booth_entries(count)')
    .order('created_at', { ascending: false })

  const events = (data as unknown as (BoothEvent & { booth_entries: { count: number }[] })[]) ?? []

  return (
    <>
      <h2 className="font-display text-lg font-semibold text-navy">งานออกบูธ</h2>
      <p className="mt-2 text-sm text-navy-400">
        สร้างงาน แล้วพิมพ์ QR ไปติดที่บูธ ผู้ร่วมงานสแกนแล้วกรอกแบบสอบถามได้เลยโดยไม่ต้องล็อกอิน
      </p>

      {events.length > 0 && (
        <ul className="mt-6 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/admin/booth/${event.id}`}
                className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-navy-50/60"
              >
                <QrCode className="size-4 shrink-0 text-gold" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">{event.name}</p>
                  <p className="mt-0.5 text-sm text-navy-400">
                    {event.venue ?? 'ไม่ระบุสถานที่'}
                    {event.starts_on && ` · ${formatDate(event.starts_on)}`}
                    {!event.is_active && ' · ปิดรับแล้ว'}
                  </p>
                </div>
                <span className="font-display text-lg font-semibold text-navy">
                  {event.booth_entries?.[0]?.count ?? 0}
                </span>
                <span className="text-sm text-navy-400">รายชื่อ</span>
                <ArrowRight className="size-4 text-navy-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-10">
        <h3 className="font-display text-base font-semibold text-navy">สร้างงานใหม่</h3>
        <div className="mt-4">
          <BoothEventForm event={null} />
        </div>
      </section>
    </>
  )
}
