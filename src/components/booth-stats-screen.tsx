'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Gift, Maximize2, Minimize2, Ticket, Trophy, Users } from 'lucide-react'
import { BOOTH_QUESTIONS } from '@/lib/booth'
import { createClient } from '@/lib/supabase/client'
import type { BoothStats } from '@/lib/types'

/**
 * จอสรุปผลที่บูธ — ดึงตัวเลขใหม่เองทุก 10 วินาที ไม่ต้องรีเฟรชหน้า
 * และขอ wake lock ไว้ไม่ให้ iPad ดับจอระหว่างงาน
 */
export function BoothStatsScreen({ slug, initial }: { slug: string; initial: BoothStats }) {
  const [stats, setStats] = useState(initial)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    const timer = setInterval(async () => {
      const { data } = await supabase.rpc('booth_stats', { p_slug: slug })
      if (!cancelled && data) setStats(data as BoothStats)
    }, 10_000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [slug])

  useEffect(() => {
    // iOS ปล่อย wake lock ทิ้งทุกครั้งที่สลับแอปหรือล็อกจอ ต้องขอใหม่ตอนกลับมา
    let sentinel: WakeLockSentinel | null = null
    let released = false

    async function acquire() {
      if (!('wakeLock' in navigator) || released) return
      try {
        sentinel = await navigator.wakeLock.request('screen')
      } catch {
        // เบราว์เซอร์ไม่รองรับหรือผู้ใช้ปฏิเสธ — ปล่อยให้ตั้ง Auto-Lock เองแทน
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void sentinel?.release()
    }
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } else {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch {
      // Safari บน iPhone ไม่รองรับ — ใช้ "เพิ่มไปยังหน้าจอโฮม" แทน
    }
  }

  const [latest, ...earlier] = stats.winners

  return (
    <div className="min-h-screen bg-navy px-6 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold break-words sm:text-4xl">
              {stats.name}
            </h1>
            {stats.venue && <p className="mt-2 break-words text-navy-200">{stats.venue}</p>}
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'เต็มจอ'}
            className="rounded-xl border border-white/15 p-3 text-navy-200 transition hover:border-gold hover:text-gold"
          >
            {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
        </header>
        <span className="rule-gold mt-5" />

        {/* ผู้โชคดีอยู่บนสุด เพราะเป็นสิ่งที่คนที่บูธรอดู */}
        {stats.winners.length > 0 && (
          <section className="mt-8 rounded-3xl border border-gold/30 bg-gold/5 p-6 sm:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-gold">
              <Trophy className="size-6" /> ผู้โชคดี
            </h2>

            {/* คนล่าสุดตัวใหญ่ ให้คนที่บูธเห็นทันทีว่าเพิ่งจับใคร */}
            <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl bg-white/10 p-6">
              {latest.prize_image_url && (
                <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                  <Image
                    src={latest.prize_image_url}
                    alt={latest.prize ?? 'ของรางวัล'}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                {latest.prize && (
                  <p className="font-display text-lg font-semibold text-gold-200">{latest.prize}</p>
                )}
                <p className="mt-1 font-display text-5xl font-semibold tracking-wider text-gold sm:text-6xl">
                  {latest.ticket}
                </p>
                <p className="mt-2 text-lg break-words text-navy-100">{latest.org}</p>
              </div>
            </div>

            {earlier.length > 0 && (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {earlier.map((w) => (
                  <li key={w.ticket} className="rounded-2xl bg-white/5 px-5 py-4">
                    {w.prize && <p className="text-xs text-gold-200">{w.prize}</p>}
                    <p className="mt-0.5 font-display text-2xl font-semibold tracking-wider text-gold">
                      {w.ticket}
                    </p>
                    <p className="mt-1 text-sm break-words text-navy-100">{w.org}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* ของรางวัลและจำนวนที่จับไปแล้ว */}
        {stats.prizes.length > 0 && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-gold">
              <Gift className="size-4" /> ของรางวัล
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.prizes.map((prize) => (
                <li
                  key={prize.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  {prize.image_url && (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                      <Image
                        src={prize.image_url}
                        alt={prize.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="break-words text-navy-100">{prize.name}</p>
                    <p className="mt-1 font-display text-sm text-gold">
                      จับแล้ว {prize.awarded} / {prize.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Stat icon={Users} label="ผู้ร่วมตอบแบบสอบถาม" value={stats.total} />
          <Stat icon={Ticket} label="หน่วยงานที่แวะบูธ" value={stats.orgs} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {BOOTH_QUESTIONS.map((q) => {
            const counts = (stats[q.key as keyof BoothStats] ?? {}) as Record<string, number>
            const max = Math.max(1, ...Object.values(counts))
            return (
              <section key={q.key}>
                <h2 className="font-display text-lg font-semibold text-gold">{q.label}</h2>
                <ul className="mt-4 space-y-3">
                  {q.options.map((option) => {
                    const n = counts[option] ?? 0
                    return (
                      <li key={option}>
                        <div className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="text-navy-100">{option}</span>
                          <span className="font-display text-lg font-semibold">{n}</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gold transition-all duration-700"
                            style={{ width: `${(n / max) * 100}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-7">
      <span className="inline-flex items-center gap-2 text-sm text-navy-200">
        <Icon className="size-4 text-gold" /> {label}
      </span>
      <p className="mt-2 font-display text-6xl font-semibold text-white tabular-nums">{value}</p>
    </div>
  )
}
