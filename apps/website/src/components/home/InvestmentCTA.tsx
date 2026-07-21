import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const STATS = [
  { label: 'Strong Rental Yields', value: '8% – 12% average returns' },
  { label: 'Capital Appreciation', value: '+18% Price Growth (YoY)' },
  { label: 'Premium Villa Demand', value: 'At an All-Time High ↑' },
  { label: 'Global Interest', value: 'Very High NRI Investment' },
  { label: 'Growth Rate', value: 'More than doubled since 2020' },
  { label: 'Second Homes', value: 'High demand for 2nd homes in India' },
]

const FEATURES = [
  'Premium properties in Goa’s finest coastal and inland locations',
  'High rental yields & strong ROI potential',
  '100% legally verified & title-clear listings',
  '​End-to-end investment assistance from local experts',
]

export default function InvestmentCTA() {
  return (
    <section className="bg-white py-12 border-t border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left text */}
          <div>
            <span className="section-label mb-3 block">Goa Investment Opportunity</span>
            <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.5rem)] font-semibold text-navy mb-4 leading-tight">
               Own Your Piece of Paradise in Goa
            </h2>
            <p className="text-slate-500 text-[14px] leading-relaxed mb-6 max-w-[440px]">
              Discover exclusive villas, beachfront homes, and high-return investment
              properties in Goa&apos;s most sought-after locations.
            </p>
            <ul className="space-y-2.5 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-slate-600 text-[13px]">
                  <CheckCircle size={15} className="text-gold flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 flex-wrap">
              <Link href="/buy" className="btn-gold">
                Explore Properties
              </Link>
              
            </div>
          </div>

          {/* Right: market stats card on navy background for contrast */}
          <div className="bg-navy rounded-2xl p-7">
            <h3 className="font-display text-[1.15rem] font-semibold text-white mb-6">
              Why Invest in Goa Right Now?
            </h3>
            <div className="divide-y divide-white/10">
              {STATS.map(({ label, value }) => (
                <div key={label} className="py-4">
                  <span className="text-white font-semibold text-[13px]">{label}: </span>
                  <span className="text-gold text-[13px]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
