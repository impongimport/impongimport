import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BoothStatsScreen } from '@/components/booth-stats-screen'
import { hasSupabase, supabasePublic } from '@/lib/supabase/public'
import type { BoothStats } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'สรุปผลหน้าบูธ',
  robots: { index: false, follow: false },
}

export default async function BoothStatsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!hasSupabase) notFound()

  const { data } = await supabasePublic.rpc('booth_stats', { p_slug: slug })
  if (!data) notFound()

  return <BoothStatsScreen slug={slug} initial={data as BoothStats} />
}
