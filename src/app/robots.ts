import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

const base = site.url

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/me', '/auth'] },
    sitemap: `${base}/sitemap.xml`,
  }
}
