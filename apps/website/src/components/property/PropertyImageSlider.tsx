'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PropertyMediaItem } from '@/types'

interface PropertyImageSliderProps {
  images: PropertyMediaItem[]
  alt: string
  badge?: string
}

const INTERVAL_MS = 3000

// Auto-advancing gallery for the property detail page — one image at a
// time instead of a row/column grid, with its caption changing in sync.
// Pauses on hover so a visitor can actually read a caption before it moves.
export default function PropertyImageSlider({ images, alt, badge }: PropertyImageSliderProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (images.length <= 1 || paused) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [images.length, paused])

  // Selected property changed under us (new slug) — don't carry over a
  // stale index from the previous gallery.
  useEffect(() => setIndex(0), [images])

  if (images.length === 0) return null
  const current = images[index]!

  return (
    <div
      className="relative h-[420px] rounded-2xl overflow-hidden mb-6 bg-slate-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Image src={current.url} alt={current.altText ?? alt} fill className="object-cover transition-opacity duration-500" priority sizes="(max-width: 1024px) 100vw, 800px" />

      {badge && (
        <span className="absolute top-4 left-4 bg-gold text-navy-deep text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-sm z-10">
          {badge}
        </span>
      )}

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-gold w-4' : 'bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Caption changes together with the image */}
      {current.altText && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 pt-8 pb-3">
          <p className="text-white text-[13px] font-medium">{current.altText}</p>
        </div>
      )}
    </div>
  )
}
