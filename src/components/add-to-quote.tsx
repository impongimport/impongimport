'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Minus, Plus } from 'lucide-react'
import { useQuoteCart } from './quote-cart'
import { StockBadge } from './stock-badge'
import type { Product } from '@/lib/types'

export function AddToQuote({ product }: { product: Product }) {
  const variants = product.product_variants ?? []
  const [variantId, setVariantId] = useState(variants[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const { add } = useQuoteCart()

  const variant = variants.find((v) => v.id === variantId) ?? null
  const stock = variant?.stock_status ?? product.stock_status

  function handleAdd() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      quantity,
    })
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-navy">ขอใบเสนอราคา</h2>
        <StockBadge status={stock} />
      </div>

      {variants.length > 0 && (
        <label className="mt-5 block">
          <span className="text-sm font-medium text-navy-600">เลือกขนาด / รุ่น</span>
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy outline-none focus:border-gold"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="mt-5">
        <span className="text-sm font-medium text-navy-600">จำนวน</span>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="ลดจำนวน"
            className="grid size-11 place-items-center rounded-xl border border-navy-200 text-navy transition hover:border-gold"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="h-11 w-24 rounded-xl border border-navy-200 text-center text-navy outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="เพิ่มจำนวน"
            className="grid size-11 place-items-center rounded-xl border border-navy-200 text-navy transition hover:border-gold"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-medium text-white transition hover:bg-navy-700"
      >
        <FileText className="size-4" /> เพิ่มลงรายการขอใบเสนอราคา
      </button>
      <Link
        href="/quote"
        className="mt-3 block text-center text-sm font-medium text-navy-500 hover:text-gold-700"
      >
        ดูรายการที่เลือกไว้
      </Link>
      <p className="mt-4 text-xs leading-relaxed text-navy-400">
        ราคาขึ้นอยู่กับปริมาณสั่งซื้อและเงื่อนไขของแต่ละหน่วยงาน
        ทีมงานจะติดต่อกลับพร้อมใบเสนอราคาหลังได้รับคำขอ
      </p>
    </div>
  )
}
