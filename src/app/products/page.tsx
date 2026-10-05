import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductCard } from '@/components/product-card'
import { getCategories, getProducts } from '@/lib/queries'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'สินค้า',
  description: 'แคตตาล็อกอุปกรณ์การแพทย์แผนจีน เข็มฝังเข็ม เครื่องกระตุ้นไฟฟ้า และชุดครอบแก้ว',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const [categories, products] = await Promise.all([getCategories(), getProducts(cat)])
  const current = categories.find((c) => c.slug === cat)

  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50/50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-navy">
            {current ? current.name : 'สินค้าทั้งหมด'}
          </h1>
          <span className="rule-gold mt-3" />
          <p className="mt-4 max-w-2xl leading-relaxed text-navy-500">
            {current?.description ??
              'อุปกรณ์การแพทย์แผนจีนนำเข้าสำหรับโรงพยาบาลและคลินิก เลือกสินค้าที่ต้องการแล้วส่งคำขอใบเสนอราคาได้ทันที'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="flex flex-wrap gap-2">
          <FilterChip href="/products" label="ทั้งหมด" active={!cat} />
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              href={`/products?cat=${c.slug}`}
              label={c.name}
              active={cat === c.slug}
            />
          ))}
        </nav>

        {products.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-navy-200 px-6 py-16 text-center text-navy-400">
            ยังไม่มีสินค้าในหมวดนี้
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-navy bg-navy text-white'
          : 'border-navy-200 text-navy-600 hover:border-gold hover:text-gold-700'
      }`}
    >
      {label}
    </Link>
  )
}
