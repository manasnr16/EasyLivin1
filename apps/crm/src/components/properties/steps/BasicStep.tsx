'use client'

import {
  PROPERTY_CATEGORIES, PROPERTY_TYPE_CATEGORY, getPropertyTypesForCategory,
  type PropertyCategoryValue, type PropertyTypeValue,
} from '@easyliving/shared'
import Dropdown from '@/components/ui/Dropdown'
import type { PropertyFormState } from '../formTypes'
import type { User as UserType } from '@/types'

interface BasicStepProps {
  form: PropertyFormState
  errors: Record<string, string>
  set: <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) => void
  onPropertyTypeChange: (value: string) => void
  isAdmin: boolean
  salesAgents: UserType[]
}

// Category is a UI-only grouping over the 17 property types (not a stored
// field) — pick a category to narrow the type list, matching how staff
// already think about a listing ("it's a plot", "it's a villa") before
// landing on the exact type.
export default function BasicStep({ form, errors, set, onPropertyTypeChange, isAdmin, salesAgents }: BasicStepProps) {
  const category = getCategoryOf(form.propertyType)
  const typesInCategory = getPropertyTypesForCategory(category)

  function handleCategorySelect(next: PropertyCategoryValue) {
    if (next === category) return
    const firstType = getPropertyTypesForCategory(next)[0]
    if (firstType) onPropertyTypeChange(firstType.value)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
      <h3 className="text-[14px] font-semibold text-navy">Basic Information</h3>

      <div>
        <label className="crm-label">Listing Purpose *</label>
        <div className="flex gap-2">
          {([
            { value: 'SALE', label: 'Sale' },
            { value: 'RENT', label: 'Rent / Lease' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('listingType', opt.value)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                form.listingType === opt.value
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-navy/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="crm-label">Property Category *</label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_CATEGORIES.filter((c) => c.value !== 'OTHER').map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => handleCategorySelect(c.value)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                category === c.value
                  ? 'bg-gold/10 text-navy border-gold'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-gold/50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="crm-label">Property Type *</label>
          <Dropdown
            value={form.propertyType}
            onChange={onPropertyTypeChange}
            options={typesInCategory.map((t) => ({ value: t.value, label: t.label }))}
          />
        </div>
      </div>

      <div>
        <label className="crm-label">Property Title *</label>
        <input
          className={`crm-input ${errors['title'] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
        {errors['title']
          ? <p className="text-red-500 text-[12px] mt-1">{errors['title']}</p>
          : <p className="text-[11px] text-slate-400 mt-1">A clear, specific title works best — type, size, and location.</p>}
      </div>

      {isAdmin && (
        <div>
          <label className="crm-label">Assign Agent</label>
          <select className="crm-select max-w-xs" value={form.assignedAgentId} onChange={(e) => set('assignedAgentId', e.target.value)}>
            <option value="">Select agent (defaults to you)</option>
            {salesAgents.map((a) => <option key={a.id} value={a.id}>{a.firstName}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

function getCategoryOf(propertyType: string): PropertyCategoryValue {
  return PROPERTY_TYPE_CATEGORY[propertyType as PropertyTypeValue] ?? 'RESIDENTIAL'
}
