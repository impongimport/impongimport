'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { Field } from './billing-fields'
import { ImageUpload } from './image-upload'
import { saveProduct } from '@/lib/actions/admin'
import type { ActionResult } from '@/lib/billing'
import { stockLabel } from '@/lib/format'
import type { Category, Product, StockStatus } from '@/lib/types'

const STOCK: StockStatus[] = ['in_stock', 'low_stock', 'out_of_stock', 'preorder']

const STOCK_TH: Record<StockStatus, string> = {
  in_stock: 'พร้อมส่ง',
  low_stock: 'เหลือน้อย',
  out_of_stock: 'หมด',
  preorder: 'สั่งจอง',
}

export function ProductForm({
  product,
  categories,
}: {
  product: Product | null
  categories: Category[]
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveProduct, null)

  useEffect(() => {
    if (!state) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  const specsText = (product?.specs ?? []).map((s) => `${s.label}: ${s.value}`).join('\n')
  const variantsText = (product?.product_variants ?? [])
    .map((v) => (v.stock_status === 'in_stock' ? v.name : `${v.name} | ${STOCK_TH[v.stock_status]}`))
    .join('\n')

  return (
    <form action={formAction} className="rounded-2xl border border-navy-100 bg-white p-6 sm:p-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="ชื่อสินค้า" name="name" defaultValue={product?.name} required className="sm:col-span-2" />
        <Field
          label="slug (ใช้ใน URL)"
          name="slug"
          defaultValue={product?.slug}
          placeholder="taiyitcm-t1-copper"
          required
        />
        <Field label="แบรนด์" name="brand" defaultValue={product?.brand} placeholder="TAIYITCM" />

        <label className="block">
          <span className="text-sm font-medium text-navy-600">หมวดหมู่</span>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ''}
            className="mt-2 w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy outline-none focus:border-gold"
          >
            <option value="">— ไม่ระบุ —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-navy-600">สถานะสินค้า</span>
          <select
            name="stock_status"
            defaultValue={product?.stock_status ?? 'in_stock'}
            className="mt-2 w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy outline-none focus:border-gold"
          >
            {STOCK.map((s) => (
              <option key={s} value={s}>
                {stockLabel[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-navy-600">คำโปรย (แสดงในการ์ดสินค้า)</span>
          <textarea
            name="summary"
            rows={2}
            defaultValue={product?.summary ?? ''}
            className="mt-2 w-full rounded-xl border border-navy-200 px-4 py-3 text-navy outline-none focus:border-gold"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-navy-600">รายละเอียด</span>
          <textarea
            name="description"
            rows={7}
            defaultValue={product?.description ?? ''}
            placeholder="เว้นบรรทัดว่างระหว่างย่อหน้า"
            className="mt-2 w-full rounded-xl border border-navy-200 px-4 py-3 text-navy outline-none placeholder:text-navy-300 focus:border-gold"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-navy-600">ข้อมูลจำเพาะ</span>
          <textarea
            name="specs"
            rows={5}
            defaultValue={specsText}
            placeholder={'บรรทัดละหัวข้อ เช่น\nแบรนด์: TAIYITCM\nบรรจุ: 100 เข็ม/กล่อง'}
            className="mt-2 w-full rounded-xl border border-navy-200 px-4 py-3 font-mono text-sm text-navy outline-none placeholder:text-navy-300 focus:border-gold"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-navy-600">ขนาด / รุ่นย่อย</span>
          <textarea
            name="variants"
            rows={6}
            defaultValue={variantsText}
            placeholder={'บรรทัดละขนาด ใส่สถานะหลัง | ได้ เช่น\n0.25 x 25 mm\n0.30 x 75 mm | หมด'}
            className="mt-2 w-full rounded-xl border border-navy-200 px-4 py-3 font-mono text-sm text-navy outline-none placeholder:text-navy-300 focus:border-gold"
          />
          <span className="mt-1.5 block text-xs text-navy-400">
            สถานะที่ใช้ได้: พร้อมส่ง · เหลือน้อย · หมด · สั่งจอง (ไม่ใส่ = พร้อมส่ง)
          </span>
        </label>

        <div className="sm:col-span-2">
          <ImageUpload name="image_url" defaultValue={product?.image_url} folder="products" />
        </div>

        <Field
          label="ลำดับการแสดง"
          name="sort_order"
          defaultValue={String(product?.sort_order ?? 0)}
          inputMode="numeric"
        />

        <div className="flex flex-col justify-end gap-3 pb-1">
          <label className="flex items-center gap-3 text-sm text-navy-600">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={product?.is_active ?? true}
              className="size-4 rounded border-navy-300 accent-[#1a344b]"
            />
            แสดงบนเว็บไซต์
          </label>
          <label className="flex items-center gap-3 text-sm text-navy-600">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={product?.is_featured ?? false}
              className="size-4 rounded border-navy-300 accent-[#1a344b]"
            />
            แสดงเป็นสินค้าแนะนำในหน้าแรก
          </label>
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-8 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700 disabled:opacity-60"
    >
      <Save className="size-4" />
      {pending ? 'กำลังบันทึก…' : 'บันทึกสินค้า'}
    </button>
  )
}
