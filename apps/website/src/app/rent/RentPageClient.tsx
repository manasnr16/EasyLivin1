'use client'

import { useState } from 'react'
import Link from 'next/link'
import PropertyCard from '@/components/property/PropertyCard'
import EnquiryModal from '@/components/ui/EnquiryModal'
import { LOCATIONS } from '@/lib/data'
import type { Property } from '@/types'

export default function RentPageClient({ initialProperties }: { initialProperties: Property[] }) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryTitle, setEnquiryTitle] = useState('')
  const [enquiryPropertyId, setEnquiryPropertyId] = useState<string | undefined>()

  return (
    <>
      <div className="relative pt-20 md:pt-[116px] pb-10" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2444 100%)' }}>
        <div className="relative max-w-[1200px] mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold">Rent Property</span>
          </div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white mb-2">Properties for Rent in Goa</h1>
          <p className="text-white/55 text-[14px] max-w-[480px]">Find your perfect rental — long-term and short-term options across North and South Goa.</p>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-stretch overflow-hidden divide-x divide-slate-100">
            <div className="flex-1 py-3 px-3 min-w-0">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 block mb-0.5">Property Type</span>
              <select className="text-[13px] text-slate-700 bg-transparent border-none outline-none w-full appearance-none">
                <option>All Types</option><option>Villas</option><option>Apartments</option><option>Commercial</option>
              </select>
            </div>
            <div className="flex-1 py-3 px-3 min-w-0">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 block mb-0.5">Location</span>
              <select className="text-[13px] text-slate-700 bg-transparent border-none outline-none w-full appearance-none">
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex-1 py-3 px-3 min-w-0">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 block mb-0.5">Max Rent/Month</span>
              <select className="text-[13px] text-slate-700 bg-transparent border-none outline-none w-full appearance-none">
                <option>Any</option><option>Under ₹20,000</option><option>₹20K – ₹50K</option><option>Above ₹50K</option>
              </select>
            </div>
            <button className="bg-gold hover:bg-gold-light text-navy-deep font-bold text-[12px] tracking-wide uppercase px-6 transition-colors whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      <section className="bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[13px] text-slate-500">Showing <span className="font-semibold text-navy">{initialProperties.length}</span> rental properties</p>
          </div>
          {initialProperties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-[15px]">No rental properties are listed right now — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {initialProperties.map((p) => (
                <PropertyCard key={p.id} property={p} onEnquire={() => { setEnquiryTitle(p.title); setEnquiryPropertyId(p.id); setEnquiryOpen(true) }} />
              ))}
            </div>
          )}
        </div>
      </section>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} propertyTitle={enquiryTitle} propertyId={enquiryPropertyId} />
    </>
  )
}
