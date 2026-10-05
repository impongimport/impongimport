import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import { StockBadge } from './stock-badge'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white transition hover:border-gold hover:shadow-lg hover:shadow-navy-100/60"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-navy-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-navy-200">
            <Package className="size-12" strokeWidth={1.25} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StockBadge status={product.stock_status} className="bg-white/95 backdrop-blur" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.brand && (
          <span className="font-display text-xs font-medium tracking-widest text-gold-600 uppercase">
            {product.brand}
          </span>
        )}
        <h3 className="mt-1 font-semibold leading-snug text-navy group-hover:text-navy-700">
          {product.name}
        </h3>
        {product.summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy-500">{product.summary}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 transition group-hover:gap-2.5 group-hover:text-gold-700">
          ดูรายละเอียด <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}
