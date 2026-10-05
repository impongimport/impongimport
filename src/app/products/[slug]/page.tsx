import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageCircle, Package, Phone } from 'lucide-react'
import { AddToQuote } from '@/components/add-to-quote'
import { getProduct, getProductSlugs } from '@/lib/queries'
import { site } from '@/lib/site'

export const revalidate = 300

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'ไม่พบสินค้า' }
  return {
    title: product.name,
    description: product.summary ?? site.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const gallery = [product.image_url, ...product.images].filter(Boolean) as string[]

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-gold-700"
      >
        <ArrowLeft className="size-4" /> กลับไปแคตตาล็อก
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-navy-100 bg-navy-50">
            {gallery[0] ? (
              <Image
                src={gallery[0]}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 640px, 90vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-navy-200">
                <Package className="size-20" strokeWidth={1} />
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.slice(1, 5).map((url) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-xl border border-navy-100"
                >
                  <Image src={url} alt={product.name} fill sizes="160px" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-10">
            {product.brand && (
              <span className="font-display text-xs font-medium tracking-widest text-gold-600 uppercase">
                {product.brand}
              </span>
            )}
            <h1 className="mt-1 font-display text-3xl font-semibold text-navy">{product.name}</h1>
            {product.categories && (
              <Link
                href={`/products?cat=${product.categories.slug}`}
                className="mt-3 inline-block rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600 hover:text-gold-700"
              >
                {product.categories.name}
              </Link>
            )}

            {product.description && (
              <div className="prose-impong mt-6">
                {product.description.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            {product.specs.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-lg font-semibold text-navy">ข้อมูลจำเพาะ</h2>
                <span className="rule-gold mt-3" />
                <dl className="mt-5 divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100">
                  {product.specs.map((spec) => (
                    <div key={spec.label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[200px_1fr]">
                      <dt className="text-sm text-navy-400">{spec.label}</dt>
                      <dd className="text-sm font-medium text-navy-700">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {(product.product_variants?.length ?? 0) > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-lg font-semibold text-navy">ขนาดที่มีจำหน่าย</h2>
                <span className="rule-gold mt-3" />
                <ul className="mt-5 flex flex-wrap gap-2">
                  {product.product_variants!.map((v) => (
                    <li
                      key={v.id}
                      className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm text-navy-700"
                    >
                      {v.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AddToQuote product={product} />

          <div className="mt-5 rounded-2xl border border-navy-100 bg-navy-50/50 p-6">
            <h3 className="font-semibold text-navy">ต้องการสอบถามเพิ่มเติม</h3>
            <div className="mt-4 space-y-3 text-sm">
              <a
                href={site.phoneHref}
                className="flex items-center gap-2.5 text-navy-600 hover:text-gold-700"
              >
                <Phone className="size-4 text-gold" /> {site.phone}
              </a>
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-navy-600 hover:text-gold-700"
              >
                <MessageCircle className="size-4 text-gold" /> LINE {site.lineId}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </article>
  )
}
