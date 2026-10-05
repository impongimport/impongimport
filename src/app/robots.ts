import type { MetadataRoute } from 'next'

const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://impong.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/me', '/auth'] },
    sitemap: `${base}/sitemap.xml`,
  }
}
