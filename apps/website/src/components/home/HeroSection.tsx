'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { LOCATIONS, PROPERTY_TYPES, BUDGET_OPTIONS, RENT_BUDGET_OPTIONS, GOA_PLACES } from '@/lib/data'
import LocationAutocomplete from '@/components/ui/LocationAutocomplete'

const VIDEOS = ['/images/goa1.mp4', '/images/goa2.mp4', '/images/goa3.mp4']
const SLIDE_DURATION = 7000

export default function HeroSection() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale')
  const [propertyType, setPropertyType] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [keyword, setKeyword] = useState('')
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null])

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % VIDEOS.length), SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [])

  // Reset active video to start on each switch for a clean cross-fade
  useEffect(() => {
    const el = videoRefs.current[current]
    if (el) {
      el.currentTime = 0
    }
  }, [current])

  function handleListingType(type: 'sale' | 'rent') {
    setListingType(type)
    setBudget('')
  }

  function handleSearch() {
    router.push(listingType === 'rent' ? '/rent' : '/buy')
  }

  const budgetOptions = listingType === 'rent' ? RENT_BUDGET_OPTIONS : BUDGET_OPTIONS

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">

      {/* ── VIDEO BACKGROUNDS ── */}
      {VIDEOS.map((src, i) => (
        <video
          key={src}
          ref={(el) => { videoRefs.current[i] = el }}
          src={src}
          autoPlay
          muted
          playsInline
          loop
          onLoadedMetadata={(e) => { e.currentTarget.playbackRate = 0.6 }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === current ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
          }`}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/30 via-navy-deep/40 to-navy-deep/75 z-[2]" />
      {/* Fade to white at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent z-[3]" />

      {/* Slide indicators */}
      <div className="absolute bottom-[calc(var(--stats-h,120px)+28px)] right-6 z-[20] flex items-center gap-2">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-6 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-[10] max-w-[1200px] mx-auto w-full px-6 pb-10 pt-32">
        {/* Eyebrow */}
        {/* <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-[1.5px] bg-gold block" />
          
        </div> */}

        {/* Headline */}
        <h1 className="font-display font-semibold leading-[1.05] tracking-tight text-white mb-5"
          style={{ fontSize: 'clamp(1.5rem, 5vw, 4rem)' }}>
          Your Search<br />
          <em className="italic text-gold-light not-italic">Ends</em><br />
          Here!
        </h1>

        <p className="text-white/70 text-[1rem] max-w-[440px] mb-6 leading-relaxed">
          Discover exclusive villas, beachfront homes, and high-return investment properties in Goa&apos;s most sought-after locations.
        </p>

        {/* Search bar — column of full-width fields on mobile, single row from sm up */}
        <div className="mb-3">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-stretch">

            {/* Buy / Rent toggle */}
            <div className="flex border-b sm:border-b-0 sm:border-r border-slate-100 flex-shrink-0">
              <button
                onClick={() => handleListingType('sale')}
                className={`flex-1 sm:flex-initial px-5 py-3 text-[13px] font-semibold transition-colors duration-150 ${
                  listingType === 'sale' ? 'bg-navy text-white' : 'text-slate-500 hover:text-navy'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => handleListingType('rent')}
                className={`flex-1 sm:flex-initial px-5 py-3 text-[13px] font-semibold transition-colors duration-150 ${
                  listingType === 'rent' ? 'bg-navy text-white' : 'text-slate-500 hover:text-navy'
                }`}
              >
                Rent
              </button>
            </div>

            <div className="flex-1 border-b sm:border-b-0 sm:border-r border-slate-100 px-3 py-2.5 flex flex-col justify-center min-w-0">
              <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-slate-400 leading-none mb-1">Property Type</span>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="text-[13px] font-medium text-slate-700 bg-transparent border-none outline-none w-full appearance-none"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 border-b sm:border-b-0 sm:border-r border-slate-100 px-3 py-2.5 flex flex-col justify-center min-w-0">
              <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-slate-400 leading-none mb-1">Location</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-[13px] font-medium text-slate-700 bg-transparent border-none outline-none w-full appearance-none"
              >
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 border-b sm:border-b-0 sm:border-r border-slate-100 px-3 py-2.5 flex flex-col justify-center min-w-0">
              <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-slate-400 leading-none mb-1">Budget</span>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="text-[13px] font-medium text-slate-700 bg-transparent border-none outline-none w-full appearance-none"
              >
                {budgetOptions.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 sm:flex-[1.4] border-b sm:border-b-0 sm:border-r border-slate-100 px-3 py-2.5 flex flex-col justify-center min-w-0">
              <LocationAutocomplete
                labelText="Search"
                value={keyword}
                onChange={setKeyword}
                onSubmit={handleSearch}
                placeholder="Area, street, landmark..."
                suggestions={GOA_PLACES}
                inputClassName="text-[13px] text-slate-700 bg-transparent border-none outline-none placeholder:text-slate-400 w-full"
              />
            </div>

            <button
              onClick={handleSearch}
              className="bg-gold hover:bg-gold-light text-navy-deep font-bold text-[13px] tracking-wide uppercase px-6 py-3 sm:py-0 flex items-center justify-center gap-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
            >
              <Search size={13} />
              Search
            </button>
          </div>
        </div>

        {/* Trending tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white/40 text-[11px] font-semibold tracking-wide uppercase">Trending:</span>
          {['Villas in Candolim', 'Beachfront Properties in Baga', 'Luxury Homes in Assagao', 'Plots in North Goa'].map((tag) => (
            <button
              key={tag}
              className="text-white/60 hover:text-white text-[11px] border border-white/20 hover:border-white/50 px-3 py-1 rounded-full transition-all duration-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-[10] bg-navy-deep/95 backdrop-blur-sm border-t border-white/8">
        <div className="max-w-[1200px] mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
          {[
            { num: '1,333+', label: 'Properties in Goa' },
            { num: '10,000+', label: 'Happy Buyers & Investors' },
            { num: '100+', label: 'Prime Locations Covered' },
            { num: '500+', label: 'Trusted Local Agents' },
          ].map((s) => (
            <div key={s.label} className="text-center px-4 first:pl-0 last:pr-0">
              <div className="font-display text-[1.5rem] font-bold text-white leading-none mb-0.5">{s.num}</div>
              <div className="text-white/40 text-[11px] tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
