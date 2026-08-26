'use client'

import { Circle, CheckCircle2 } from 'lucide-react'
import { PROPERTY_TYPES, LISTING_TYPES } from '@easyliving/shared'
import type { PropertyFormState } from './formTypes'

interface CompletionPanelProps {
  form: PropertyFormState
  photoCount: number
}

interface ChecklistItem {
  label: string
  done: boolean
}

// A compact right-rail summary — what this listing currently is, at a
// glance, plus a completion score. Deliberately small: this is a helper,
// not a second form.
export default function CompletionPanel({ form, photoCount }: CompletionPanelProps) {
  const typeLabel = PROPERTY_TYPES.find((t) => t.value === form.propertyType)?.label ?? form.propertyType
  const listingLabel = LISTING_TYPES.find((t) => t.value === form.listingType)?.label ?? form.listingType
  const price = form.priceOnRequest
    ? 'On Request'
    : form.listingType === 'RENT'
      ? (form.rentPrice ? `₹${Number(form.rentPrice).toLocaleString('en-IN')}/mo` : '—')
      : (form.salePrice ? `₹${Number(form.salePrice).toLocaleString('en-IN')}` : '—')

  const required: ChecklistItem[] = [
    { label: 'Property title', done: form.title.trim().length >= 5 },
    { label: 'Location', done: !!form.village },
    { label: form.listingType === 'RENT' ? 'Rent price' : 'Sale price', done: form.priceOnRequest || !!(form.listingType === 'RENT' ? form.rentPrice : form.salePrice) },
    { label: 'At least one photo', done: photoCount > 0 },
  ]

  const recommended: ChecklistItem[] = [
    { label: 'Description', done: form.description.trim().length > 0 },
    { label: 'Amenities', done: form.amenities.length > 0 },
    { label: 'Address / landmark', done: form.address.trim().length > 0 },
  ]

  const allItems = [...required, ...recommended]
  const percent = Math.round((allItems.filter((i) => i.done).length / allItems.length) * 100)

  return (
    <aside className="w-full lg:w-[280px] shrink-0 space-y-4">
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Summary</h3>
        <dl className="space-y-2.5 text-[13px]">
          <div className="flex justify-between gap-3"><dt className="text-slate-400">Listing</dt><dd className="text-navy font-medium text-right">{listingLabel}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-400">Type</dt><dd className="text-navy font-medium text-right">{typeLabel}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-400">Location</dt><dd className="text-navy font-medium text-right">{form.village || '—'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-400">Price</dt><dd className="text-navy font-medium text-right">{price}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">Completion</h3>
          <span className="text-[13px] font-bold text-navy">{percent}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gold transition-all" style={{ width: `${percent}%` }} />
        </div>
        <ul className="space-y-1.5">
          {required.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-[12.5px]">
              {item.done
                ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                : <Circle size={14} className="text-slate-300 shrink-0" />}
              <span className={item.done ? 'text-slate-500' : 'text-navy'}>{item.label}</span>
            </li>
          ))}
        </ul>
        {recommended.some((i) => !i.done) && (
          <>
            <p className="text-[11px] text-slate-400 mt-3 mb-1.5">Recommended</p>
            <ul className="space-y-1.5">
              {recommended.filter((i) => !i.done).map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-[12.5px] text-slate-400">
                  <Circle size={14} className="text-slate-300 shrink-0" /> Add {item.label.toLowerCase()}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  )
}
