import type { MetadataRoute } from 'next'
import { getNewsSlugs, getProductSlugs } from '@/lib/queries'

const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://impong.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, news] = await Promise.all([getProductSlugs(), getNewsSlugs()])

  return [
    ...['', '/products', '/news', '/about', '/contact', '/privacy', '/terms'].map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })),
    ...products.map((slug) => ({ url: `${base}/products/${slug}`, lastModified: new Date() })),
    ...news.map((slug) => ({ url: `${base}/news/${slug}`, lastModified: new Date() })),
  ]
}
