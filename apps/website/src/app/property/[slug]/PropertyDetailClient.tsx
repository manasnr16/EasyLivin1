'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, BedDouble, Bath, Maximize2, Phone, Mail, CheckCircle2 } from 'lucide-react'
import EnquiryModal from '@/components/ui/EnquiryModal'
import type { Property } from '@/types'

export default function PropertyDetailClient({ property }: { property: Property }) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-navy-deep pt-20 md:pt-[116px] pb-5">
        <div className="max-w-[1200px] mx-auto px-6 pt-3">
          <div className="flex items-center gap-2 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <Link href="/buy" className="text-white/40 hover:text-gold transition-colors">Buy</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold line-clamp-1">{property.title}</span>
          </div>
        </div>
      </div>

      <section className="bg-white py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Hero image */}
              <div className="relative h-[380px] rounded-2xl overflow-hidden mb-6">
                <Image src={property.img} alt={property.title} fill className="object-cover" priority />
                {property.badge && (
                  <span className="absolute top-4 left-4 bg-gold text-navy-deep text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-sm">
                    {property.badge}
                  </span>
                )}
              </div>

              {/* Title + price */}
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <h1 className="font-display text-[1.6rem] font-semibold text-navy leading-tight mb-1">{property.title}</h1>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[13px]">
                    <MapPin size={13} /> {property.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-[1.8rem] font-bold text-navy">{property.price}</div>
                  {property.priceNote && <span className="text-slate-400 text-[13px]">{property.priceNote}</span>}
                </div>
              </div>

              {/* Specs bar */}
              <div className="flex gap-6 flex-wrap bg-slate-50 rounded-xl px-6 py-4 mb-6 border border-slate-100">
                {property.beds !== null && (
                  <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <BedDouble size={16} className="text-gold" /> {property.beds} Bedrooms
                  </div>
                )}
                {property.baths !== null && (
                  <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <Bath size={16} className="text-gold" /> {property.baths} Bathrooms
                  </div>
                )}
                <div className="flex items-center gap-2 text-[13px] text-slate-600">
                  <Maximize2 size={15} className="text-gold" /> {property.area}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-gold/80" /> {property.type}
                </div>
              </div>

              {/* ── Description ── */}
              <div className="border-t border-slate-100 pt-6">
                <h2 className="font-display font-semibold text-[1.1rem] text-navy mb-4">Description</h2>
                <div className="text-slate-500 text-[13.5px] leading-relaxed space-y-3">
                  {(property.description ?? `A premium ${property.type.toLowerCase()} located in ${property.location}. Contact EasyLivin Goa for more details and to arrange a viewing.`)
                    .split('\n\n')
                    .map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </div>

              {/* ── Overview ── */}
              <div className="border-t border-slate-100 pt-6">
                <h2 className="font-display font-semibold text-[1.1rem] text-navy mb-4">Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <span className="w-3 h-3 rounded-full bg-gold/80 inline-block" />, label: 'Type', value: property.type },
                      { icon: <Bath size={14} className="text-gold" />, label: 'Bathrooms', value: property.baths != null ? String(property.baths) : '—' },
                      { icon: <BedDouble size={14} className="text-gold" />, label: 'Rooms', value: property.beds != null ? String(property.beds) : '—' },
                      { icon: <Maximize2 size={14} className="text-gold" />, label: 'Area Size', value: property.area },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-lg px-4 py-3 flex items-center gap-3 border border-slate-100">
                        <div className="flex-shrink-0">{icon}</div>
                        <div>
                          <p className="text-[11px] text-slate-400 leading-none mb-0.5">{label}</p>
                          <p className="text-[13px] font-semibold text-navy">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-100 h-[200px] sm:h-auto min-h-[180px]">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location + ', Goa, India')}&output=embed&z=14`}
                      className="w-full h-full border-0"
                      loading="lazy"
                      title={`Map showing ${property.location}`}
                    />
                  </div>
                </div>
              </div>

              {/* ── Details ── */}
              <div className="border-t border-slate-100 pt-6">
                <h2 className="font-display font-semibold text-[1.1rem] text-navy mb-4">Details</h2>
                <div className="rounded-xl border border-slate-100 overflow-hidden text-[13px]">
                  {[
                    [{ label: 'Price', value: property.price + (property.priceNote ?? '') }, { label: 'Property Size', value: property.area }],
                    [{ label: 'Rooms', value: property.beds != null ? `${property.beds}` : '—' }, { label: 'Bathroom', value: property.baths != null ? `${property.baths}` : '—' }],
                    [{ label: 'Type', value: property.type }, { label: 'Property Status', value: property.propertyStatus ?? '—' }],
                    [{ label: 'Location', value: property.location }, { label: 'Seller Type', value: property.sellerType }],
                  ].map((row, rowIdx) => (
                    <div key={rowIdx} className={`grid grid-cols-2 divide-x divide-slate-100 ${rowIdx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      {row.map(({ label, value }, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-medium">{label}</span>
                          <span className="text-navy font-semibold text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Features ── */}
              {property.features && Object.values(property.features).some(arr => arr && arr.length > 0) && (
                <div className="border-t border-slate-100 pt-6">
                  <h2 className="font-display font-semibold text-[1.1rem] text-navy mb-4">Features</h2>
                  <div className="space-y-5">
                    {[
                      { key: 'facilitiesAndConvenience', label: 'Facilities & Convenience' },
                      { key: 'interiorFeatures', label: 'Interior Features' },
                      { key: 'technologyAndEfficiency', label: 'Technology & Efficiency' },
                    ].map(({ key, label }) => {
                      const items = property.features?.[key as keyof typeof property.features]
                      if (!items || items.length === 0) return null
                      return (
                        <div key={key}>
                          <p className="text-[12px] font-bold tracking-wide uppercase text-slate-400 mb-2">{label}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                            {items.map((item) => (
                              <div key={item} className="flex items-center gap-2 text-slate-600 text-[13px]">
                                <CheckCircle2 size={14} className="text-gold flex-shrink-0" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Enquiry card */}
              <div className="bg-navy rounded-2xl p-6 sticky top-4">
                <h3 className="font-display text-[1.1rem] font-semibold text-white mb-1">Enquire About This Property</h3>
                <p className="text-white/50 text-[12px] mb-5">Urmilla will respond within 24 hours</p>
                <button onClick={() => setEnquiryOpen(true)} className="btn-gold w-full justify-center py-3">
                  Send Enquiry
                </button>
                <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
                  <a href="tel:+918888806964" className="flex items-center gap-2.5 text-white/60 hover:text-white text-[13px] transition-colors">
                    <Phone size={13} className="text-gold" /> +91 88888 06964
                  </a>
                  <a href="mailto:urmilla@easylivingoa.com" className="flex items-center gap-2.5 text-white/60 hover:text-white text-[13px] transition-colors">
                    <Mail size={13} className="text-gold" /> urmilla@easylivingoa.com
                  </a>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-gold-pale rounded-xl p-4 border border-gold/20">
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  <strong className="text-navy">EasyLivin Goa</strong> — Over 10 years of trusted real estate
                  consultancy in Goa. 2% brokerage on purchase, 1 month rent on rentals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} propertyTitle={property.title} propertyId={property.id} />
    </>
  )
}
