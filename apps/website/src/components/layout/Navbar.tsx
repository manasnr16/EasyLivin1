'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import EnquiryModal from '@/components/ui/EnquiryModal'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Buy Property', href: '/buy' },
  { label: 'Rent Property', href: '/rent' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
  }, [mobileOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-navy-deep shadow-[0_2px_20px_rgba(0,0,0,0.4)]' : 'bg-transparent'
        }`}
      >
        {/* Top bar */}
        <div className="bg-navy-deep/90 backdrop-blur-sm border-b border-white/8 h-9 px-6 hidden md:flex items-center justify-between">
          <span className="text-white/70 text-[13px] font-medium tracking-wide">
           Own Your Piece of Paradise in Goa 
          </span>
          <div className="flex items-center gap-5">
            <a href="tel:+918888806964" className="text-white/65 hover:text-gold text-[13px] font-medium transition-colors">
              +91 88888 06964
            </a>
            <span className="text-white/25">|</span>
            <a href="mailto:urmilla@easylivingoa.com" className="text-white/65 hover:text-gold text-[13px] font-medium transition-colors">
              urmilla@easylivingoa.com
            </a>
          </div>
        </div>

        {/* Main nav */}
        <div className="flex items-center justify-between px-6 h-20">
          {/* Logo — width/height reflect the source image's true 19:24 aspect ratio so it scales without distortion */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/images/logo1.png"
              alt="EasyLivin Goa"
              width={228}
              height={288}
              className="object-contain h-[90px] w-auto"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-underline relative text-[14px] font-medium tracking-wide px-3.5 py-2 rounded transition-colors duration-200 ${
                  currentPath === link.href
                    ? 'text-white'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-[13px] font-semibold text-white/80 hover:text-white border border-white/25 hover:border-white/50 px-4 py-2.5 rounded transition-all duration-200"
            >
              Login / Signup
            </Link>
            
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden text-white p-1"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-navy-deep border-t border-white/10 px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/85 hover:text-gold text-[15px] font-medium py-3 border-b border-white/8 last:border-0 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/login" className="btn-outline-white justify-center">Login / Signup</Link>
              <button onClick={() => { setEnquiryOpen(true); setMobileOpen(false) }} className="btn-gold justify-center">
                Speak with Urmilla
              </button>
            </div>
          </div>
        )}
      </header>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </>
  )
}
