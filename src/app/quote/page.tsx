import type { Metadata } from 'next'
import { QuoteForm } from '@/components/quote-form'
import { getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { BillingProfile } from '@/lib/types'

export const metadata: Metadata = {
  title: 'ขอใบเสนอราคา',
  description: 'ส่งคำขอใบเสนอราคาสินค้าอุปกรณ์การแพทย์แผนจีน',
}

export default async function QuotePage() {
  const session = await getSession()

  let billing: BillingProfile | null = null
  if (session) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('billing_profiles')
      .select('*')
      .eq('user_id', session.userId)
      .maybeSingle()
    billing = (data as BillingProfile) ?? null
  }

  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50/50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-navy">ขอใบเสนอราคา</h1>
          <span className="rule-gold mt-3" />
          <p className="mt-4 max-w-2xl leading-relaxed text-navy-500">
            ตรวจสอบรายการสินค้าและจำนวนที่ต้องการ กรอกข้อมูลสำหรับออกใบกำกับภาษี
            แล้วส่งคำขอ ทีมงานจะติดต่อกลับพร้อมใบเสนอราคา
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <QuoteForm
          signedIn={Boolean(session)}
          billing={billing}
          defaultEmail={session?.email ?? null}
          defaultName={session?.profile?.full_name ?? null}
        />
      </section>
    </>
  )
}
