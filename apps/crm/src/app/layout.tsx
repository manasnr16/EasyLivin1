import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { SWRProvider } from '@/lib/swr-provider'

// Self-hosted at build time (no runtime request to Google Fonts, no
// render-blocking @import) — swaps in once loaded, falls back to the
// system font stack until then.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Easy Livin CRM', template: '%s | Easy Livin CRM' },
  description: 'Easy Livin Goa — Internal CRM & Property Management',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SWRProvider>
          <AuthProvider>{children}</AuthProvider>
        </SWRProvider>
      </body>
    </html>
  )
}
