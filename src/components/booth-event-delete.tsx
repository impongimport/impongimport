'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { Trash2, TriangleAlert } from 'lucide-react'
import { deleteBoothEvent } from '@/lib/actions/booth'
import type { ActionResult } from '@/lib/billing'

/**
 * ลบงานออกบูธ — ลบรายชื่อผู้ลงทะเบียนทิ้งไปด้วยทั้งหมด
 * จึงซ่อนไว้หลังการกดหนึ่งชั้น แล้วบังคับพิมพ์ slug ยืนยันอีกชั้น
 */
export function BoothEventDelete({
  eventId,
  slug,
  entryCount,
}: {
  eventId: string
  slug: string
  entryCount: number
}) {
  const [armed, setArmed] = useState(false)
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    deleteBoothEvent,
    null
  )

  useEffect(() => {
    if (state && !state.ok) toast.error(state.message)
  }, [state])

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="inline-flex items-center gap-2 text-sm font-medium text-navy-400 transition hover:text-red-600"
      >
        <Trash2 className="size-4" /> ลบงานนี้
      </button>
    )
  }

  return (
    <form action={formAction} className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <input type="hidden" name="id" value={eventId} />

      <h4 className="flex items-center gap-2 font-semibold text-red-800">
        <TriangleAlert className="size-4" /> ลบงานนี้ถาวร
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-red-800">
        {entryCount > 0
          ? `รายชื่อผู้ลงทะเบียน ${entryCount} คน ของรางวัล และผลจับฉลากทั้งหมดจะถูกลบไปด้วย กู้คืนไม่ได้`
          : 'ของรางวัลทั้งหมดของงานนี้จะถูกลบไปด้วย กู้คืนไม่ได้'}
        {entryCount > 0 && ' — ถ้ายังไม่ได้โหลด CSV เก็บไว้ ให้โหลดก่อนลบ'}
      </p>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-red-800">
          พิมพ์ <code className="rounded bg-white px-1.5 py-0.5 font-mono">{slug}</code> เพื่อยืนยัน
        </span>
        <input
          type="text"
          name="confirm_slug"
          autoComplete="off"
          required
          className="mt-2 w-full rounded-xl border border-red-300 bg-white px-4 py-3 text-navy outline-none focus:border-red-500"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <DeleteButton />
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="rounded-xl px-5 py-3 text-sm font-medium text-navy-500 transition hover:text-navy"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
    >
      <Trash2 className="size-4" />
      {pending ? 'กำลังลบ…' : 'ลบงานนี้ถาวร'}
    </button>
  )
}
