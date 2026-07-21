'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import PropertyCard from '@/components/property/PropertyCard'
import EnquiryModal from '@/components/ui/EnquiryModal'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'
import { LOCATIONS, PROPERTY_TYPES, BUDGET_OPTIONS, GOA_PLACES } from '@/lib/data'
import type { Property } from '@/types'

function matchesBudget(lakhs: number | undefined, budget: string): boolean {
  if (!budget) return true
  if (lakhs == null) return false
  if (budget === '0-50') return lakhs > 0 && lakhs < 50
  if (budget === '50-100') return lakhs >= 50 && lakhs <= 100
  if (budget === '100-200') return lakhs > 100 && lakhs <= 200
  if (budget === '200-500') return lakhs > 200 && lakhs <= 500
  if (budget === '500+') return lakhs > 500
  return true
}

function matchesType(type: string, filter: string): boolean {
  if (!filter) return true
  const t = type.toLowerCase()
  if (filter === 'apartments') return t === 'apartment'
  if (filter === 'villas') return t === 'villa'
  if (filter === 'plots') return t === 'plot'
  if (filter === 'commercial') return t === 'commercial'
  return false
}

export default function BuyPageClient({ initialProperties }: { initialProperties: Property[] }) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryTitle, setEnquiryTitle] = useState('')
  const [enquiryPropertyId, setEnquiryPropertyId] = useState<string | undefined>()
  const [sort, setSort] = useState('newest')
  const [propType, setPropType] = useState('')
  const [loc, setLoc] = useState('')
  const [budget, setBudget] = useState('')
  const [keyword, setKeyword] = useState('')

  function handleEnquire(title: string, propertyId: string) {
    setEnquiryTitle(title)
    setEnquiryPropertyId(propertyId)
    setEnquiryOpen(true)
  }

  const filtered = useMemo(() => {
    const list = initialProperties.filter((p) => {
      if (!matchesType(p.type, propType)) return false
      if (loc && loc !== 'All Goa' && !p.location.toLowerCase().includes(loc.toLowerCase())) return false
      if (!matchesBudget(p.priceValueLakhs, budget)) return false
      if (keyword.trim()) {
        const kw = keyword.toLowerCase()
        if (!p.title.toLowerCase().includes(kw) && !p.location.toLowerCase().includes(kw)) return false
      }
      return true
    })
    if (sort === 'price_asc') return [...list].sort((a, b) => (a.priceValueLakhs ?? 0) - (b.priceValueLakhs ?? 0))
    if (sort === 'price_desc') return [...list].sort((a, b) => (b.priceValueLakhs ?? 0) - (a.priceValueLakhs ?? 0))
    return list
  }, [initialProperties, propType, loc, budget, keyword, sort])

  return (
    <>
      {/* Page hero */}
      <div
        className="relative pt-20 md:pt-[116px] pb-10"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2444 100%)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=40')", backgroundSize: 'cover' }} />
        <div className="relative max-w-[1200px] mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold">Buy Property</span>
          </div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white mb-2">
            Properties for Sale in Goa
          </h1>
          <p className="text-white/55 text-[14px] max-w-[500px]">
            Browse our verified listings of villas, apartments, plots, Portuguese houses and more.
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-stretch overflow-x-auto divide-x divide-slate-100">
            <div className="flex-1 py-2.5 px-3 min-w-[130px]">
              <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-slate-400 block mb-1">Property Type</span>
              <select
                value={propType}
                onChange={(e) => setPropType(e.target.value)}
                className="text-[13px] text-slate-700 bg-transparent border-none outline-none w-full appearance-none"
              >
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex-1 py-2.5 px-3 min-w-[120px]">
              <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-slate-400 block mb-1">Location</span>
              <select
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                className="text-[13px] text-slate-700 bg-transparent border-none outline-none w-full appearance-none"
              >
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex-1 py-2.5 px-3 min-w-[120px]">
              <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-slate-400 block mb-1">Budget</span>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="text-[13px] text-slate-700 bg-transparent border-none outline-none w-full appearance-none"
              >
                {BUDGET_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="flex-[1.4] py-2.5 px-3 min-w-[160px] flex flex-col justify-center">
              <LocationAutocomplete
                labelText="Search"
                value={keyword}
                onChange={setKeyword}
                placeholder="Area, street, landmark..."
                suggestions={GOA_PLACES}
                inputClassName="text-[13px] text-slate-700 bg-transparent border-none outline-none placeholder:text-slate-400 w-full"
              />
            </div>
            <button
              className="bg-gold hover:bg-gold-light text-navy-deep font-bold text-[12px] tracking-wide uppercase px-6 transition-colors whitespace-nowrap flex items-center gap-2 flex-shrink-0"
            >
              <Search size={12} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Listings */}
      <section className="bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-[13px] text-slate-500">
              Showing <span className="font-semibold text-navy">{filtered.length}</span> of{' '}
              {initialProperties.length} properties for sale
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-slate-400">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-[12px] text-slate-700 border border-slate-200 rounded px-3 py-1.5 outline-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-[15px] mb-2">No properties match your filters.</p>
              <button
                onClick={() => { setPropType(''); setLoc(''); setBudget(''); setKeyword('') }}
                className="text-gold text-[13px] font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <PropertyCard key={p.id} property={p} onEnquire={() => handleEnquire(p.title, p.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} propertyTitle={enquiryTitle} propertyId={enquiryPropertyId} />
    </>
  )
}
