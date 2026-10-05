import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/components/product-form'
import { createClient } from '@/lib/supabase/server'
import type { Category, Product } from '@/lib/types'

export default async function AdminProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: categoryRows } = await supabase
    .from('categories')
    .select('id, slug, name, description, sort_order')
    .order('sort_order')
  const categories = (categoryRows as Category[]) ?? []

  let product: Product | null = null
  if (id !== 'new') {
    const { data } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('id', id)
      .maybeSingle()
    if (!data) notFound()
    product = data as unknown as Product
    product.product_variants = (product.product_variants ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    )
  }

  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-gold-700"
      >
        <ArrowLeft className="size-4" /> สินค้าทั้งหมด
      </Link>
      <h2 className="mt-5 font-display text-xl font-semibold text-navy">
        {product ? product.name : 'เพิ่มสินค้าใหม่'}
      </h2>
      <div className="mt-6">
        <ProductForm product={product} categories={categories} />
      </div>
    </>
  )
}
