import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog & Investment Guides',
  description: 'Stay updated with Goa real estate trends, investment opportunities, and expert buying advice from EasyLivin.',
}

const ARTICLES = [
  { slug: 'goa-property-buying-guide', category: "Buyer's Guide", catColor: 'bg-blue-50 text-blue-600', title: 'Buying Property in Goa: Complete Guide for Investors (2025)', excerpt: "From legal checks to location selection — everything you need to know before investing in Goa real estate.", author: 'Goa Property Expert', readTime: '6 min read', date: 'Apr 10, 2025', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80' },
  { slug: 'best-locations-goa-investment', category: 'Investment', catColor: 'bg-amber-50 text-amber-600', title: 'Top Locations in Goa for High ROI Property Investment', excerpt: "Discover why areas like Assagao, Anjuna, and Candolim are hotspots for rental income and capital appreciation.", author: 'Real Estate Analyst', readTime: '7 min read', date: 'Apr 05, 2025', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80' },
  { slug: 'goa-luxury-villa-demand', category: 'Market Trends', catColor: 'bg-emerald-50 text-emerald-600', title: "Luxury Villas in Goa: Why Demand is Booming", excerpt: "The rise of second homes, vacation rentals, and NRI demand is driving Goa's luxury villa market like never before.", author: 'Property Insights Team', readTime: '5 min read', date: 'Mar 28, 2025', img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80' },
  { slug: 'nri-buying-guide-goa', category: 'NRI Guide', catColor: 'bg-purple-50 text-purple-600', title: 'NRI Guide to Buying Property in Goa: Complete Walkthrough', excerpt: "Everything an NRI needs to know — FEMA regulations, repatriation of funds, power of attorney, and working with local agents.", author: 'Urmilla Dias', readTime: '8 min read', date: 'Mar 15, 2025', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80' },
  { slug: 'portuguese-houses-goa', category: 'Heritage Homes', catColor: 'bg-rose-50 text-rose-600', title: "Why Portuguese Heritage Homes in Goa Are Coveted Worldwide", excerpt: "What makes a Portuguese house so special? History, architecture, location — and the surprising investment case for buying one.", author: 'Heritage Property Desk', readTime: '6 min read', date: 'Feb 20, 2025', img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80' },
  { slug: 'goa-property-market-2025', category: 'Market Report', catColor: 'bg-teal-50 text-teal-600', title: 'Goa Property Market Report 2025: Prices, Trends & Outlook', excerpt: "An in-depth look at where Goa property prices are heading, which areas are appreciating fastest, and what buyers should know.", author: 'EasyLivin Research', readTime: '10 min read', date: 'Jan 30, 2025', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80' },
]

export default function BlogPage() {
  return (
    <>
      <div className="relative pt-20 md:pt-[116px] pb-10" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2444 100%)' }}>
        <div className="relative max-w-[1200px] mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold">Blog & Insights</span>
          </div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white mb-2">Goa Property Insights</h1>
          <p className="text-white/55 text-[14px] max-w-[480px]">Stay updated with Goa&apos;s real estate trends, investment opportunities, and expert buying advice.</p>
        </div>
      </div>

      <section className="bg-slate-50 py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ARTICLES.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group block">
                <div className="relative h-[180px] overflow-hidden">
                  <Image src={a.img} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="400px" />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded ${a.catColor}`}>{a.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-[14px] text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-navy transition-colors">{a.title}</h3>
                  <p className="text-slate-400 text-[12.5px] leading-relaxed mb-4 line-clamp-2">{a.excerpt}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                    <span className="font-medium text-slate-500">{a.author}</span>
                    <span>·</span><span>{a.readTime}</span>
                    <span>·</span><span>{a.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
