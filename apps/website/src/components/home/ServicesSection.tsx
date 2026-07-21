import Link from 'next/link'
import { Paintbrush, Scale, CreditCard, Building2 } from 'lucide-react'

const SERVICES = [
  {
    icon: Paintbrush,
    title: 'Interior Design',
    desc: 'Transform your new property with curated interior design packages — from budget-friendly to premium luxury.',
    href: '/services/interior',
  },
  {
    icon: Scale,
    title: 'Legal Services',
    desc: 'Hassle-free property registration, title verification, and legal documentation by certified experts.',
    href: '/services/legal',
  },
  {
    icon: CreditCard,
    title: 'Loan Assistance',
    desc: 'Get the best home loan offers with instant eligibility checks and zero-documentation paperwork.',
    href: '/services/loans',
  },
  {
    icon: Building2,
    title: 'Property Management',
    desc: 'Let us manage your rental properties — from tenant screening to maintenance, rent collection and more.',
    href: '/services/management',
  },
]

export default function ServicesSection() {
  return (
    <section className="bg-white py-12 border-t border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-5 h-[1.5px] bg-gold" />
            
            <span className="w-5 h-[1.5px] bg-gold" />
          </div>
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-navy">
            Our Services
          </h2>
          
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map(({ icon: Icon, title, desc, href }) => (
            <div
              key={title}
              className="group border border-slate-100 rounded-xl p-6 hover:shadow-lg hover:border-gold/30 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <Icon size={18} className="text-gold" />
              </div>
              <h3 className="font-semibold text-[14px] text-navy mb-2">{title}</h3>
              <p className="text-slate-400 text-[12.5px] leading-relaxed mb-4">{desc}</p>
              <Link
                href={href}
                className="text-gold text-[11px] font-bold tracking-wide uppercase hover:underline inline-flex items-center gap-1"
              >
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
