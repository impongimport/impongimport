import type { Metadata } from 'next'
import { IBM_Plex_Sans_Thai, Poppins } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getSession, isAdmin } from '@/lib/auth'
import { site } from '@/lib/site'
import './globals.css'

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plex-thai',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: `${site.nameEn} — ${site.tagline}`,
    template: `%s | ${site.short}`,
  },
  description: site.description,
  openGraph: {
    title: site.nameEn,
    description: site.description,
    type: 'website',
    locale: 'th_TH',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="th" className={`${plexThai.variable} ${poppins.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <SiteHeader signedIn={Boolean(session)} isAdmin={isAdmin(session?.profile)} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster
          position="top-center"
          toastOptions={{ style: { background: '#1a344b', color: '#fff' } }}
        />
      </body>
    </html>
  )
}
