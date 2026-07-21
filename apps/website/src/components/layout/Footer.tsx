import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Buy Property', href: '/buy' },
  { label: 'Rent Property', href: '/rent' },
  { label: 'Sell / Post Property', href: '/sell' },
  { label: 'Lease Property', href: '/sell' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog & Insights', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
]

const SERVICES = [
  { label: 'Interior Design', href: '/services/interior' },
  { label: 'Legal Services', href: '/services/legal' },
  { label: 'Home Loan Assistance', href: '/services/loans' },
  { label: 'Property Management', href: '/services/management' },
  { label: 'Valuation Services', href: '/services/valuation' },
  { label: 'NRI Services', href: '/services/nri' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="max-w-[1200px] mx-auto px-6 pt-14 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/8">

          {/* Brand column */}
          <div>
            <div className="mb-5">
              <Image
                src="/images/logo1.png"
                alt="EasyLivin Goa"
                width={228}
                height={288}
                className="object-contain h-[90px] w-auto"
              />
            </div>
            
            <div className="flex gap-2">
              {['f', 'in', 'tw', 'yt', 'wp'].map((s) => (
                <span
                  key={s}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/55 hover:border-gold hover:text-gold transition-all duration-200 text-[13px] font-semibold cursor-pointer"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[13px] font-bold tracking-[0.15em] uppercase text-gold mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/65 hover:text-white text-[14px] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[13px] font-bold tracking-[0.15em] uppercase text-gold mb-5">
              Our Services
            </h4>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="text-white/65 hover:text-white text-[14px] transition-colors duration-200"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[13px] font-bold tracking-[0.15em] uppercase text-gold mb-5">
              Get In Touch
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-gold/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={14} className="text-gold" />
                </div>
                <p className="text-white/65 text-[14px] leading-relaxed">
                  A-T-16, Campal Trade Center,<br />
                  Opposite Kala Academy,<br /> 3rd Floor, Campal,
                  Panjim, <br />Goa – 403004
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 bg-gold/10 rounded flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-gold" />
                </div>
                <div>
                  <a href="tel:+919823202737" className="text-white/65 hover:text-white text-[14px] block transition-colors">+91 9823 202737</a>
                  <a href="tel:+918888806964" className="text-white/65 hover:text-white text-[14px] block transition-colors">+91 88888 06964</a>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 bg-gold/10 rounded flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-gold" />
                </div>
                <a href="mailto:urmilla@easylivingoa.com" className="text-white/65 hover:text-white text-[14px] transition-colors">
                  urmilla@easylivingoa.com
                </a>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 bg-gold/10 rounded flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-gold" />
                </div>
                <p className="text-white/65 text-[14px]">Mon – Sat, 9:00 am – 6:00 pm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="text-white/40 text-[12px]">
              Copyright &copy; 2026, Easy Livin Goa -  real estate  consultants. All rights reserved.
            </span>
            <span className="text-white/20 text-[12px] mx-2 hidden sm:inline">|</span>
            <span className="text-white/30 text-[12px] block sm:inline mt-0.5 sm:mt-0">
              Design by Techtrend Solutions
            </span>
          </div>
          <div className="flex gap-5">
            <Link href="/terms" className="text-white/45 hover:text-white/80 text-[13px] transition-colors">Terms &amp; Conditions</Link>
            <Link href="/faq" className="text-white/45 hover:text-white/80 text-[13px] transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
