'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { Plus, Save } from 'lucide-react'
import { Field } from './billing-fields'
import { ImageUpload } from './image-upload'
import { savePrize } from '@/lib/actions/booth'
import type { ActionResult } from '@/lib/billing'
import type { BoothPrize } from '@/lib/types'

/** แถวแก้ไขของรางวัลหนึ่งระดับ ส่ง `prize` เป็น null เพื่อใช้เพิ่มรางวัลใหม่ */
export function BoothPrizeForm({
  eventId,
  prize,
  nextOrder,
}: {
  eventId: string
  prize: BoothPrize | null
  nextOrder?: number
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(savePrize, null)

  useEffect(() => {
    if (!state) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_120px]">
      <input type="hidden" name="event_id" value={eventId} />
      {prize && <input type="hidden" name="id" value={prize.id} />}
      <input type="hidden" name="sort_order" value={prize?.sort_order ?? nextOrder ?? 0} />

      <Field
        label="ชื่อรางวัล"
        name="name"
        defaultValue={prize?.name}
        placeholder="เช่น รางวัลที่ 1 — โมเดลศีรษะ"
        required
      />
      <Field
        label="จำนวน"
        name="quantity"
        defaultValue={String(prize?.quantity ?? 1)}
        inputMode="numeric"
        required
      />

      <div className="sm:col-span-2">
        <ImageUpload
          name="image_url"
          defaultValue={prize?.image_url}
          folder="booth"
          label="รูปรางวัล (ไม่บังคับ)"
        />
      </div>

      <SubmitButton isNew={!prize} />
    </form>
  )
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white transition hover:bg-navy-700 disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
    >
      {isNew ? <Plus className="size-4" /> : <Save className="size-4" />}
      {pending ? 'กำลังบันทึก…' : isNew ? 'เพิ่มรางวัล' : 'บันทึก'}
    </button>
  )
}
