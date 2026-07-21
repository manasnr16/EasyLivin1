import Image from 'next/image'
import { Award, Globe, ShieldCheck, Users } from 'lucide-react'

const REASONS = [
  {
    icon: Award,
    title: 'More Than 26 Years of Expertise',
    desc: 'With over two decades in Goa\'s real estate market, we provide expert guidance backed by knowledge, integrity, and proven results.',
  },
  {
    icon: Globe,
    title: 'Exclusive Goa Property Network',
    desc: 'Gain access to premium and off-market opportunities through our strong local connections and trusted industry relationships.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparency & Legal Assurance',
    desc: 'Every property is carefully verified to ensure clear titles, legal compliance, and complete peace of mind for our clients.',
  },
  {
    icon: Users,
    title: 'Personalized End-to-End Support',
    desc: 'From property selection to registration and beyond, we offer dedicated assistance tailored to your unique needs and goals.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:items-start">

          {/* Left: Founder image + quote */}
          <div>
            <a
              href="/images/Urmilla.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Urmilla Dias founder profile – opens PDF in new tab"
              className="block h-[320px] relative cursor-pointer"
            >
              <Image
                src="/images/urmila.png"
                alt="Urmilla Dias – Founder of EasyLivin Goa, trusted real estate consultant with 25+ years of experience"
                fill
                className="object-contain rounded-3xl"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </a>
            {/* Quote sits below the photo, not overlaying the face */}
            <div className="bg-gold-pale border-l-4 border-gold rounded-r-xl px-6 py-4 mt-4">
              <p className="font-display text-[1.05rem] text-navy leading-snug mb-2">
                &ldquo;The best property decisions are built on trust, local expertise, and relationships that last a lifetime.&rdquo;
              </p>
              <p className="text-gold text-[12px] italic tracking-wide">
                — Urmilla Dias
              </p>
            </div>
          </div>

          {/* Right: Reasons */}
          <div className="lg:pt-2">
            <span className="section-label mb-3 block">Expertise You Can Trust</span>
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-navy mb-7 leading-tight">
              Why Choose Us in Goa?
            </h2>
            <div className="space-y-6">
              {REASONS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[14px] text-navy mb-1">{title}</h3>
                    <p className="text-slate-400 text-[13px] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
