'use client'

import type { PropertyFormState } from '../formTypes'
import { clsxInput } from '../formTypes'

interface PricingStepProps {
  form: PropertyFormState
  errors: Record<string, string>
  set: <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) => void
}

export default function PricingStep({ form, errors, set }: PricingStepProps) {
  const areaForRate = Number(form.areaSqFt || form.plotAreaSqFt || 0)
  const rate = !form.priceOnRequest && form.salePrice && areaForRate > 0
    ? Math.round(Number(form.salePrice) / areaForRate)
    : null

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
      <h3 className="text-[14px] font-semibold text-navy">Pricing &amp; Availability</h3>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
          <input type="checkbox" checked={form.priceNegotiable} onChange={(e) => set('priceNegotiable', e.target.checked)} className="accent-gold" />
          Price Negotiable
        </label>
        <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
          <input type="checkbox" checked={form.priceOnRequest} onChange={(e) => set('priceOnRequest', e.target.checked)} className="accent-gold" />
          Price on Request
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        {(form.listingType === 'SALE' || form.listingType === 'SALE_AND_RENT') && (
          <div>
            <label className="crm-label">Sale Price (₹) {!form.priceOnRequest && '*'}</label>
            <input
              type="number"
              className={clsxInput(!!errors['salePrice'])}
              value={form.salePrice}
              onChange={(e) => set('salePrice', e.target.value)}
              disabled={form.priceOnRequest}
            />
            {errors['salePrice']
              ? <p className="text-red-500 text-[12px] mt-1">{errors['salePrice']}</p>
              : rate && <p className="text-[11px] text-slate-400 mt-1">≈ ₹{rate.toLocaleString('en-IN')} / sq.ft</p>}
          </div>
        )}
        {(form.listingType === 'RENT' || form.listingType === 'SALE_AND_RENT') && (
          <div>
            <label className="crm-label">Monthly Rent (₹) *</label>
            <input
              type="number"
              className={clsxInput(!!errors['rentPrice'])}
              value={form.rentPrice}
              onChange={(e) => set('rentPrice', e.target.value)}
            />
            {errors['rentPrice'] && <p className="text-red-500 text-[12px] mt-1">{errors['rentPrice']}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
