'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { FileText, Minus, Package, Plus, Send, Trash2 } from 'lucide-react'
import { BillingFields } from './billing-fields'
import { GoogleSignIn } from './google-sign-in'
import { itemKey, useQuoteCart } from './quote-cart'
import { submitQuoteRequest } from '@/lib/actions/quote'
import type { ActionResult } from '@/lib/billing'
import type { BillingProfile } from '@/lib/types'

type Props = {
  signedIn: boolean
  billing: BillingProfile | null
  defaultEmail: string | null
  defaultName: string | null
}

export function QuoteForm({ signedIn, billing, defaultEmail, defaultName }: Props) {
  const { items, ready, setQuantity, remove, clear } = useQuoteCart()
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    submitQuoteRequest,
    null
  )

  useEffect(() => {
    if (state && !state.ok) toast.error(state.message)
  }, [state])

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-2xl bg-navy-50" />
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-navy-200 px-6 py-20 text-center">
        <Package className="mx-auto size-12 text-navy-200" strokeWidth={1.25} />
        <h2 className="mt-5 font-semibold text-navy">ยังไม่มีสินค้าในรายการ</h2>
        <p className="mt-2 text-sm text-navy-500">
          เลือกสินค้าจากแคตตาล็อกแล้วกด “เพิ่มลงรายการขอใบเสนอราคา”
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700"
        >
          ไปที่แคตตาล็อก
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      {/* รายการสินค้า */}
      <div className="rounded-2xl border border-navy-100 bg-white">
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
          <h2 className="font-semibold text-navy">
            รายการสินค้า <span className="text-navy-400">({items.length})</span>
          </h2>
          <button
            type="button"
            onClick={clear}
            className="text-sm text-navy-400 transition hover:text-red-600"
          >
            ล้างรายการ
          </button>
        </div>

        <ul className="divide-y divide-navy-100">
          {items.map((item) => {
            const key = itemKey(item)
            return (
              <li key={key} className="flex flex-wrap items-center gap-4 px-6 py-5">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium text-navy hover:text-gold-700"
                  >
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="mt-1 text-sm text-navy-400">{item.variantName}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="ลดจำนวน"
                    onClick={() => setQuantity(key, item.quantity - 1)}
                    className="grid size-9 place-items-center rounded-lg border border-navy-200 text-navy transition hover:border-gold"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setQuantity(key, Number(e.target.value) || 1)}
                    className="h-9 w-16 rounded-lg border border-navy-200 text-center text-sm text-navy outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    aria-label="เพิ่มจำนวน"
                    onClick={() => setQuantity(key, item.quantity + 1)}
                    className="grid size-9 place-items-center rounded-lg border border-navy-200 text-navy transition hover:border-gold"
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="ลบรายการ"
                    onClick={() => remove(key)}
                    className="ml-1 grid size-9 place-items-center rounded-lg text-navy-300 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ฟอร์มส่งคำขอ */}
      {!signedIn ? (
        <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-6 lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 font-semibold text-navy">
            <FileText className="size-4 text-gold" /> เข้าสู่ระบบเพื่อส่งคำขอ
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-500">
            ระบบต้องการข้อมูลผู้เสียภาษีของหน่วยงานเพื่อออกใบเสนอราคาและใบกำกับภาษี
            เข้าสู่ระบบด้วย Google เพื่อกรอกข้อมูลครั้งเดียวและใช้ได้ตลอด
          </p>
          <div className="mt-6">
            <GoogleSignIn next="/quote" />
          </div>
          <p className="mt-4 text-xs text-navy-400">รายการสินค้าที่เลือกไว้จะไม่หายไป</p>
        </div>
      ) : (
        <form action={formAction} className="rounded-2xl border border-navy-100 bg-white p-6">
          <input type="hidden" name="items" value={JSON.stringify(items)} />

          <h2 className="font-semibold text-navy">ข้อมูลสำหรับออกใบกำกับภาษี</h2>
          <span className="rule-gold mt-2" />
          <p className="mt-3 text-sm leading-relaxed text-navy-500">
            ข้อมูลนี้จะใช้ออกใบเสนอราคาและใบกำกับภาษี
          </p>

          <div className="mt-6">
            <BillingFields
              billing={
                billing ??
                ({
                  contact_name: defaultName,
                  contact_email: defaultEmail,
                  branch: 'สำนักงานใหญ่',
                } as BillingProfile)
              }
            />
          </div>

          <label className="mt-6 block">
            <span className="text-sm font-medium text-navy-600">หมายเหตุถึงทีมงาน</span>
            <textarea
              name="note"
              rows={3}
              placeholder="เช่น ต้องการใบเสนอราคาภายในวันที่… / สอบถามส่วนลดปริมาณ"
              className="mt-2 w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy outline-none placeholder:text-navy-300 focus:border-gold"
            />
          </label>

          <label className="mt-5 flex items-start gap-3 text-sm text-navy-600">
            <input
              type="checkbox"
              name="save_billing"
              defaultChecked
              className="mt-0.5 size-4 rounded border-navy-300 accent-[#1a344b]"
            />
            บันทึกข้อมูลผู้เสียภาษีนี้ไว้ใช้กับคำขอครั้งถัดไป
          </label>

          <SubmitButton />
        </form>
      )}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700 disabled:opacity-60"
    >
      <Send className="size-4" />
      {pending ? 'กำลังส่งคำขอ…' : 'ส่งคำขอใบเสนอราคา'}
    </button>
  )
}
