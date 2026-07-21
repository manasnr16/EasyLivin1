'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Maximize2, BedDouble, Bath, Heart, Plus } from 'lucide-react'
import type { Property } from '@/types'
import clsx from 'clsx'

interface PropertyCardProps {
  property: Property
  onEnquire?: () => void
}

export default function PropertyCard({ property, onEnquire }: PropertyCardProps) {
  const { slug, title, type, badge, badgeColor, price, priceNote, location, beds, baths, area, sellerType, img } = property
  const [wishlisted, setWishlisted] = useState(false)
  const [comparing, setComparing] = useState(false)

  return (
    <Link href={`/property/${slug}`} className="prop-card group block">
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden">
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges top-left */}
        {badge && (
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span
              className={clsx(
                'prop-badge text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded-sm',
                badgeColor === 'gold'
                  ? 'bg-gold text-navy-deep'
                  : badgeColor === 'navy'
                  ? 'bg-navy text-white'
                  : 'bg-navy-deep/80 text-white backdrop-blur-sm'
              )}
            >
              {badge}
            </span>
          </div>
        )}

        {/* Type badge top-right */}
        <span className="absolute top-3 right-3 bg-navy text-white text-[10px] font-bold tracking-[0.06em] uppercase px-2.5 py-1 rounded-sm">
          {type}
        </span>

        {/* Wishlist + Compare hover buttons */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(w => !w) }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md transition-all duration-200',
              wishlisted ? 'bg-gold text-navy-deep' : 'bg-black/55 text-white hover:bg-black/75'
            )}
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setComparing(c => !c) }}
            aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
            title={comparing ? 'Remove from compare' : 'Add to compare'}
            className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md transition-all duration-200',
              comparing ? 'bg-gold text-navy-deep' : 'bg-black/55 text-white hover:bg-black/75'
            )}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="font-display text-[1.35rem] font-bold text-navy leading-none">
            {price}
          </span>
          {priceNote && (
            <span className="text-slate-400 text-[12px]">{priceNote}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[13.5px] font-semibold text-slate-800 leading-snug mb-1.5 line-clamp-2">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-slate-400 text-[12px] mb-3">
          <MapPin size={11} className="flex-shrink-0" />
          {location}
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          {beds !== null && (
            <span className="flex items-center gap-1 text-[12px] text-slate-500">
              <BedDouble size={13} className="text-gold flex-shrink-0" />
              {beds} BHK
            </span>
          )}
          {baths !== null && (
            <span className="flex items-center gap-1 text-[12px] text-slate-500">
              <Bath size={13} className="text-gold flex-shrink-0" />
              {baths} Bath
            </span>
          )}
          <span className="flex items-center gap-1 text-[12px] text-slate-500 ml-auto">
            <Maximize2 size={12} className="text-gold flex-shrink-0" />
            {area}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{sellerType}</span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEnquire?.() }}
          className="text-[11px] font-bold tracking-wide uppercase text-gold border border-gold/30 hover:bg-gold hover:text-navy-deep px-3 py-1 rounded transition-all duration-200"
        >
          Enquire
        </button>
      </div>
    </Link>
  )
}
