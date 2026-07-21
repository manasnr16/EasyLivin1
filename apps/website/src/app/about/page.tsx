import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'EasyLivin is Goa\'s trusted real estate consultancy founded by Urmilla Dias. Over 10 years serving buyers, sellers and renters across Goa.',
}

const STATS = [
  { num: '1333+', label: 'Properties listed' },
  { num: '25+', label: 'Years in Goa' },
  { num: '1000s', label: 'Families helped' },
  { num: '100%', label: 'Legal compliance' },
]

export default function AboutPage() {
  return (
    <>
      {/* Page hero */}
      <div className="relative pt-20 md:pt-[116px] pb-10" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2444 100%)' }}>
        <div className="relative max-w-[1200px] mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold">About Us</span>
          </div>
          <h1 className="font-display text-[clamp(1rem,3vw,3rem)] font-semibold text-white mb-2">About EasyLivin</h1>
        </div>
      </div>

      <section className="bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:items-center">

            {/* Left image + stats */}
            <div>
              <a
                href="/images/Urmilla.pdf"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Urmilla Dias founder profile – opens PDF in new tab"
                className="block h-[450px] relative cursor-pointer"
              >
                <Image
                  src="/images/urmila.png"
                  alt="Urmilla Dias – Founder of EasyLivin Goa, trusted real estate consultant with 25+ years of experience"
                  fill
                  className="object-contain rounded-3xl"
                  priority
                />
                {/* Name badge */}
                <div className="absolute bottom-4 right-4 bg-navy-deep/80 backdrop-blur-sm px-4 py-2.5 rounded-lg">
                  <p className="text-white font-semibold text-[13px] leading-none mb-0.5">Urmilla Dias</p>
                  <p className="text-gold text-[11px] tracking-wide">Founder - EasyLivin Goa</p>
                </div>
              </a>
              {/* Stats */}
              <div className="bg-navy rounded-xl p-6 mt-5 grid grid-cols-2 gap-5">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-[1.8rem] font-bold text-gold leading-none">{s.num}</div>
                    <div className="text-white/50 text-[11px] mt-1 tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right content */}
            <div>
              <span className="section-label mb-3 block">Our Story</span>
              <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold text-navy mb-6 leading-tight">
                Your Trusted Guide to Real Estate in Goa
              </h2>
              <div className="space-y-4 text-slate-500 text-[14px] leading-relaxed">
                <p>
                  At EasyLivin, we believe finding the perfect property should be an exciting and rewarding
                  experience. Whether you&apos;re searching for a beachfront villa, a charming Portuguese home, an
                  apartment, farmland, an investment property, or the ideal plot to build your dream home,
                  we&apos;re here to guide you every step of the way.
                </p>
                <p>
                  With years of experience and deep local market knowledge, we help buyers discover
                  exceptional opportunities and assist property owners in connecting with the right buyers at
                  the right value. Our expertise extends beyond property search—we provide complete support,
                  from property selection and due diligence to documentation and registration.
                </p>
                <p>
                  Led by Urmilla Dias, a trusted name in Goa&apos;s real estate market with over 25 years of
                  industry experience, EasyLivin is built on a foundation of trust, transparency, and
                  long-term relationships. We have helped countless families, investors, and homeowners make
                  confident property decisions while navigating Goa&apos;s unique real estate landscape.
                </p>
                <p>
                  Whether you&apos;re buying your first home, investing in a holiday retreat, or selling a
                  cherished family property, EasyLivin is committed to making your journey seamless, secure,
                  and successful.
                </p>
              </div>

              {/* Our Promise */}
              <div className="mt-6">
                <h3 className="font-semibold text-[14px] text-navy mb-3">Our Promise</h3>
                <ul className="space-y-2">
                  {['Expert Local Knowledge', 'Personally Verified Properties', 'Transparent & Honest Guidance', 'End-to-End Support'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-500 text-[13px]">
                      <span className="text-gold font-bold">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quote */}
              <div className="mt-8 bg-gold-pale border-l-4 border-gold rounded-r-xl px-6 py-5">
                <p className="font-display text-[1.1rem] text-navy leading-relaxed mb-3">
                  &ldquo;In Goa, the best opportunities aren&apos;t advertised—they&apos;re discovered through local expertise, trusted relationships, and years of market experience.&rdquo;
                </p>
                <p className="text-[12px] italic text-slate-500 tracking-wide uppercase">
                  — Urmilla Dias
                </p>
              </div>

              <div className="mt-7">
                <p className="text-[13px] text-slate-400 mb-1">For a personal consultation:</p>
                <a href="mailto:urmilla@easylivingoa.com" className="text-gold font-semibold hover:underline text-[14px]">
                  urmilla@easylivingoa.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
