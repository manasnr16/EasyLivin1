'use client'

import { AMENITY_GROUPS } from '@easyliving/shared'
import type { PropertyFormState } from '../formTypes'

interface FeaturesStepProps {
  form: PropertyFormState
  errors: Record<string, string>
  set: <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) => void
  toggleAmenity: (amenity: string) => void
}

export default function FeaturesStep({ form, errors, set, toggleAmenity }: FeaturesStepProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6">
      <div>
        <h3 className="text-[14px] font-semibold text-navy mb-1">Description *</h3>
        <p className="text-[11px] text-slate-400 mb-2">Describe the property&apos;s location, layout, condition, views and key advantages.</p>
        <textarea
          className={`crm-input resize-none ${errors['description'] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
          rows={5}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Write naturally — buyers respond to specifics, not sales language."
        />
        {errors['description'] && <p className="text-red-500 text-[12px] mt-1">{errors['description']}</p>}
      </div>

      <div>
        <h3 className="text-[14px] font-semibold text-navy mb-3">Amenities &amp; Features</h3>
        <div className="space-y-4">
          {AMENITY_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
                      form.amenities.includes(a)
                        ? 'bg-gold text-navy-deep border-gold font-semibold'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-gold'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
