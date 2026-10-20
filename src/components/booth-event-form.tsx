'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { Field } from './billing-fields'
import { saveBoothEvent } from '@/lib/actions/booth'
import type { ActionResult } from '@/lib/billing'
import type { BoothEvent } from '@/lib/types'

export function BoothEventForm({ event }: { event: BoothEvent | null }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveBoothEvent, null)

  useEffect(() => {
    if (!state) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  return (
    <form action={formAction} className="rounded-2xl border border-navy-100 bg-white p-6">
      {event && <input type="hidden" name="id" value={event.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="ชื่องาน"
          name="name"
          defaultValue={event?.name}
          placeholder="เช่น งานประชุมวิชาการแพทย์แผนจีน 2569"
          required
          className="sm:col-span-2"
        />
        <Field
          label="slug (ใช้ใน URL และ QR)"
          name="slug"
          defaultValue={event?.slug}
          placeholder="tcm-expo-2026"
          required
        />
        <Field label="สถานที่" name="venue" defaultValue={event?.venue} placeholder="ฮอลล์ 3 อิมแพ็ค" />
        <Field label="วันเริ่มงาน" name="starts_on" defaultValue={event?.starts_on} type="date" />
        <Field label="วันสุดท้าย" name="ends_on" defaultValue={event?.ends_on} type="date" />
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-navy-600">ข้อความเชิญชวนหน้าแรกของฟอร์ม</span>
          <textarea
            name="intro"
            rows={3}
            defaultValue={event?.intro ?? ''}
            placeholder="เว้นว่างไว้ได้ ระบบจะใช้ข้อความมาตรฐาน"
            className="mt-2 w-full rounded-xl border border-navy-200 px-4 py-3 text-navy outline-none placeholder:text-navy-300 focus:border-gold"
          />
        </label>

        <label className="flex items-center gap-3 text-sm text-navy-600 sm:col-span-2">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={event?.is_active ?? true}
            className="size-4 rounded border-navy-300 accent-[#1a344b]"
          />
          เปิดรับลงทะเบียน (ปิดแล้วคนสแกน QR จะเข้าฟอร์มไม่ได้)
        </label>
      </div>

      <SubmitButton isNew={!event} />
    </form>
  )
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-7 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700 disabled:opacity-60"
    >
      <Save className="size-4" />
      {pending ? 'กำลังบันทึก…' : isNew ? 'สร้างงาน' : 'บันทึกการแก้ไข'}
    </button>
  )
}
