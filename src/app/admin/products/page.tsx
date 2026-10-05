import Link from 'next/link'
import { Plus } from 'lucide-react'
import { StockBadge } from '@/components/stock-badge'
import { deleteProduct } from '@/lib/actions/admin'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

export default async function AdminProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, slug, name, brand, stock_status, is_active, is_featured, sort_order, categories(name)')
    .order('sort_order')
    .order('name')

  const products = (data as unknown as (Product & { categories: { name: string } | null })[]) ?? []

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-navy">สินค้า</h2>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-medium text-white transition hover:bg-navy-700"
        >
          <Plus className="size-4" /> เพิ่มสินค้า
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-navy-200 px-6 py-16 text-center text-navy-400">
          ยังไม่มีสินค้า
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
          {products.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${p.id}`} className="font-medium text-navy hover:text-gold-700">
                  {p.name}
                </Link>
                <p className="mt-0.5 text-sm text-navy-400">
                  {p.categories?.name ?? 'ไม่ระบุหมวด'}
                  {p.brand && ` · ${p.brand}`}
                  {!p.is_active && ' · ซ่อนอยู่'}
                  {p.is_featured && ' · แนะนำ'}
                </p>
              </div>
              <StockBadge status={p.stock_status} />
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <button
                  type="submit"
                  className="rounded-lg px-3 py-2 text-sm text-navy-300 transition hover:bg-red-50 hover:text-red-600"
                >
                  ลบ
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
