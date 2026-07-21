import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'EasyLivin Goa | Real Estate Consultants | Buy, Sell & Rent Property in Goa',
    template: '%s | EasyLivin Goa',
  },
  description:
    'EasyLivin is your one stop shop for property in Goa. Buy, sell or rent — villas, apartments, Portuguese houses, plots and more across all of Goa. Over 1,333 properties listed.',
  keywords: [
    'goa property', 'goa real estate', 'buy property goa', 'rent goa',
    'villas goa', 'Portuguese houses goa', 'EasyLivin Goa', 'Urmilla Dias',
    'property for sale goa', 'real estate consultants goa',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'EasyLivin Goa',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
