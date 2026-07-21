import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const ARTICLES = [
  {
    slug: 'goa-property-buying-guide',
    category: "Buyer's Guide",
    categoryColor: 'bg-blue-50 text-blue-600',
    title: 'Buying Property in Goa: Complete Guide for Investors (2025)',
    excerpt: "From legal checks to location selection — everything you need to know before investing in Goa real estate.",
    author: 'Goa Property Expert',
    date: 'Apr 10, 2025',
    img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&q=80',
  },
  {
    slug: 'best-locations-goa-investment',
    category: 'Investment',
    categoryColor: 'bg-amber-50 text-amber-600',
    title: 'Top Locations in Goa for High ROI Property Investment',
    excerpt: "Discover why areas like Assagao, Anjuna, and Candolim are hotspots for rental income and capital appreciation.",
    author: 'Real Estate Analyst',
    date: 'Apr 05, 2025',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80',
  },
  {
    slug: 'goa-luxury-villa-demand',
    category: 'Market Trends',
    categoryColor: 'bg-emerald-50 text-emerald-600',
    title: "Luxury Villas in Goa: Why Demand is Booming",
    excerpt: "The rise of second homes, vacation rentals, and NRI demand is driving Goa's luxury villa market like never before.",
    author: 'Property Insights Team',
    date: 'Mar 28, 2025',
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80',
  },
]

export default function BlogSection() {
  return (
    <section className="bg-slate-50 py-12 border-t border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="section-label mb-2">Goa Property Insights</span>
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-navy">
              Latest Trends &amp; Investment Guides
            </h2>
            <p className="text-slate-400 text-[13px] mt-1.5 max-w-[440px]">
              Stay updated with Goa&apos;s real estate trends, investment opportunities, and expert buying advice.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-1 text-[12px] font-bold text-navy border border-slate-200 hover:border-gold hover:text-gold px-4 py-2 rounded transition-all duration-200 whitespace-nowrap mt-1"
          >
            View All Articles <ChevronRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group block"
            >
              <div className="relative h-[160px] overflow-hidden">
                <Image
                  src={article.img}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1200px) 33vw, 400px"
                />
                <span className={`absolute top-3 left-3 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded ${article.categoryColor}`}>
                  {article.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[13.5px] text-slate-800 leading-snug mb-2 line-clamp-2 group-hover:text-navy transition-colors">
                  {article.title}
                </h3>
                <p className="text-slate-400 text-[12px] leading-relaxed mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                  <span className="font-medium text-slate-500">{article.author}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                  <span>·</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
