'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import PropertyCard from '@/components/property/PropertyCard'
import EnquiryModal from '@/components/ui/EnquiryModal'
import type { Property } from '@/types'

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Buy', value: 'sale' },
]

export default function FeaturedProperties({ properties }: { properties: Property[] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryTitle, setEnquiryTitle] = useState('')
  const [enquiryPropertyId, setEnquiryPropertyId] = useState<string | undefined>()

  const filtered = activeFilter === 'all'
    ? properties
    : properties.filter((p) => p.listing === activeFilter)

  function handleEnquire(title: string, propertyId: string) {
    setEnquiryTitle(title)
    setEnquiryPropertyId(propertyId)
    setEnquiryOpen(true)
  }

  return (
    <section className="bg-white py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="section-label mb-2">Goa Premium Collection</span>
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold text-navy">
              Featured Luxury Properties in Goa
            </h2>
            <p className="text-slate-400 text-[13px] mt-1.5 max-w-[520px]">
              Handpicked beachfront villas, premium homes, and high-return investment
              properties in Goa&apos;s most desirable locations.
            </p>
          </div>
          <Link
            href="/buy"
            className="hidden sm:flex items-center gap-1.5 text-[12px] font-bold text-navy border border-slate-200 hover:border-gold hover:text-gold px-4 py-2 rounded transition-all duration-200 whitespace-nowrap mt-1"
          >
            View All Properties <ChevronRight size={14} />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 mt-5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-5 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 ${
                activeFilter === f.value
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-navy hover:text-navy'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              onEnquire={() => handleEnquire(p.title, p.id)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center mt-6">
          <Link
            href="/buy"
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy-mid text-white font-bold text-[12px] tracking-[0.08em] uppercase px-8 py-3.5 rounded-full transition-all duration-200"
          >
            Explore All Goa Properties
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        propertyTitle={enquiryTitle}
        propertyId={enquiryPropertyId}
      />
    </section>
  )
}
