'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { BillingFields, Field } from './billing-fields'
import { saveBillingProfile } from '@/lib/actions/profile'
import type { ActionResult } from '@/lib/billing'
import type { BillingProfile, Profile } from '@/lib/types'

export function BillingForm({
  billing,
  profile,
  email,
}: {
  billing: BillingProfile | null
  profile: Profile | null
  email: string | null
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    saveBillingProfile,
    null
  )

  useEffect(() => {
    if (!state) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  return (
    <form action={formAction} className="rounded-2xl border border-navy-100 bg-white p-6 sm:p-8">
      <h2 className="font-display text-lg font-semibold text-navy">ข้อมูลผู้ติดต่อ</h2>
      <span className="rule-gold mt-2" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="ชื่อ – นามสกุล" name="full_name" defaultValue={profile?.full_name} />
        <Field label="เบอร์โทรศัพท์" name="phone" defaultValue={profile?.phone} inputMode="tel" />
        <div className="sm:col-span-2">
          <span className="text-sm font-medium text-navy-600">อีเมลบัญชี</span>
          <p className="mt-2 rounded-xl bg-navy-50 px-4 py-3 text-navy-500">{email ?? '—'}</p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold text-navy">
        ข้อมูลสำหรับออกใบกำกับภาษี
      </h2>
      <span className="rule-gold mt-2" />
      <p className="mt-3 text-sm leading-relaxed text-navy-500">
        บันทึกไว้ครั้งเดียว ระบบจะเติมให้อัตโนมัติทุกครั้งที่ขอใบเสนอราคา
      </p>
      <div className="mt-6">
        <BillingFields billing={billing} />
      </div>

      <SaveButton />
    </form>
  )
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-8 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700 disabled:opacity-60"
    >
      <Save className="size-4" />
      {pending ? 'กำลังบันทึก…' : 'บันทึกข้อมูล'}
    </button>
  )
}
