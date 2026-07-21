import type { Metadata } from 'next'
import Link from 'next/link'
import { Paintbrush, Scale, CreditCard, Building2, BarChart3, Globe, Home, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'EasyLivin Goa offers interior design, legal services, loan assistance, property management, valuation, NRI services, buying assistance and selling services.',
}

const SERVICES = [
  {
    icon: Paintbrush,
    title: 'Interior Design',
    desc: 'Transform your property into a beautiful and functional living space with customized interior solutions. From modern apartments to luxury villas, our trusted design partners bring your vision to life.',
  },
  {
    icon: Scale,
    title: 'Legal Services',
    desc: 'Buy and sell with confidence through expert legal guidance, title verification, due diligence, documentation, and registration support. We help ensure every transaction is secure and hassle-free.',
  },
  {
    icon: CreditCard,
    title: 'Loan Assistance',
    desc: 'Finding the right home loan is easier with our banking partners. We assist with eligibility checks, documentation, and loan processing to help you secure the best financing options.',
  },
  {
    icon: Building2,
    title: 'Property Management',
    desc: 'Whether you\'re an NRI investor or a second-home owner, we take care of your property with tenant management, maintenance coordination, rent collection, and regular updates.',
  },
  {
    icon: BarChart3,
    title: 'Property Valuation',
    desc: 'Know the true market value of your property before buying, selling, or investing. Our local market expertise helps you make informed real estate decisions.',
  },
  {
    icon: Globe,
    title: 'NRI Services',
    desc: 'Invest in Goa from anywhere in the world with complete peace of mind. We provide end-to-end assistance, from property discovery and virtual tours to legal formalities and registration.',
  },
  {
    icon: Home,
    title: 'Property Buying Assistance',
    desc: 'Discover the best properties in Goa with expert guidance tailored to your lifestyle and investment goals. We help you identify, evaluate, and secure the right property with confidence.',
  },
  {
    icon: Tag,
    title: 'Property Selling Services',
    desc: 'Reach serious buyers and maximize your property\'s value through our marketing expertise and local network. We manage the process from listing to successful closure.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <div className="relative pt-20 md:pt-[116px] pb-10" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2444 100%)' }}>
        <div className="relative max-w-[1200px] mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold">Services</span>
          </div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white mb-2">Our Services</h1>
        </div>
      </div>

      <section className="bg-white py-14">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group border border-slate-100 rounded-xl p-7 hover:shadow-xl hover:border-gold/30 transition-all duration-300">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                  <Icon size={20} className="text-gold" />
                </div>
                <h3 className="font-semibold text-[15px] text-navy mb-3">{title}</h3>
                <p className="text-slate-400 text-[13px] leading-relaxed mb-5">{desc}</p>
                <Link href="/contact" className="text-gold text-[11px] font-bold tracking-wide uppercase hover:underline inline-flex items-center gap-1">
                  Contact Our Team →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
