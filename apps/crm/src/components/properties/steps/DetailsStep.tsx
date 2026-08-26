'use client'

import {
  isFieldApplicable, LAND_ONLY_PROPERTY_TYPES, FACING_OPTIONS, LAND_USE_OPTIONS,
  type SpecField,
} from '@easyliving/shared'
import type { PropertyFormState } from '../formTypes'
import { clsxInput } from '../formTypes'

interface DetailsStepProps {
  form: PropertyFormState
  errors: Record<string, string>
  set: <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) => void
}

// Every field here is conditional on the selected property type via
// FIELD_CONFIG (packages/shared/constants) — a Plot never sees Bedrooms,
// an Apartment never sees Road Width. See getFieldsForPropertyType.
export default function DetailsStep({ form, errors, set }: DetailsStepProps) {
  const show = (field: SpecField) => isFieldApplicable(form.propertyType, field)
  const isLandOnly = LAND_ONLY_PROPERTY_TYPES.includes(form.propertyType as (typeof LAND_ONLY_PROPERTY_TYPES)[number])
  type NumericField = 'bedrooms' | 'bathrooms' | 'balconies' | 'areaSqFt' | 'plotAreaSqFt' | 'floorNumber' | 'floors' | 'roadWidthFt' | 'parking'
  const num = (key: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value)

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
      <h3 className="text-[14px] font-semibold text-navy">Property Details</h3>

      {(show('bedrooms') || show('bathrooms') || show('balconies')) && (
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Rooms</p>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {show('bedrooms') && (
              <div><label className="crm-label">Bedrooms</label><input type="number" className="crm-input" min="0" max="20" value={form.bedrooms} onChange={num('bedrooms')} /></div>
            )}
            {show('bathrooms') && (
              <div><label className="crm-label">Bathrooms</label><input type="number" className="crm-input" min="0" max="20" value={form.bathrooms} onChange={num('bathrooms')} /></div>
            )}
            {show('balconies') && (
              <div><label className="crm-label">Balconies</label><input type="number" className="crm-input" min="0" max="10" value={form.balconies} onChange={num('balconies')} /></div>
            )}
          </div>
        </div>
      )}

      {(show('areaSqFt') || show('plotAreaSqFt')) && (
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Area (sq.ft)</p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {show('areaSqFt') && (
              <div><label className="crm-label">Built-up Area</label><input type="number" className="crm-input" value={form.areaSqFt} onChange={num('areaSqFt')} /></div>
            )}
            {show('plotAreaSqFt') && (
              <div>
                <label className="crm-label">Plot Area {isLandOnly && '*'}</label>
                <input type="number" className={clsxInput(!!errors['plotAreaSqFt'])} value={form.plotAreaSqFt} onChange={num('plotAreaSqFt')} />
                {errors['plotAreaSqFt'] && <p className="text-red-500 text-[12px] mt-1">{errors['plotAreaSqFt']}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {(show('floorNumber') || show('floors')) && (
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Floor Details</p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {show('floorNumber') && (
              <div><label className="crm-label">Property Floor</label><input type="number" className="crm-input" value={form.floorNumber} onChange={num('floorNumber')} /></div>
            )}
            {show('floors') && (
              <div><label className="crm-label">Total Floors</label><input type="number" className="crm-input" min="1" value={form.floors} onChange={num('floors')} /></div>
            )}
          </div>
        </div>
      )}

      {isLandOnly && (
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Plot Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            {show('roadWidthFt') && (
              <div><label className="crm-label">Road Width (ft)</label><input type="number" className="crm-input" value={form.roadWidthFt} onChange={num('roadWidthFt')} /></div>
            )}
            {show('landUse') && (
              <div>
                <label className="crm-label">Land Use</label>
                <select className="crm-select" value={form.landUse} onChange={(e) => set('landUse', e.target.value)}>
                  <option value="">Select</option>
                  {LAND_USE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {(show('furnishing') || show('parking') || show('facing') || show('possessionStatus')) && (
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Furnishing &amp; Status</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {show('furnishing') && (
              <div>
                <label className="crm-label">Furnishing</label>
                <select className="crm-select" value={form.furnishing} onChange={(e) => set('furnishing', e.target.value)}>
                  <option value="">Select</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="fully-furnished">Fully Furnished</option>
                </select>
              </div>
            )}
            {show('parking') && (
              <div><label className="crm-label">Parking Spots</label><input type="number" className="crm-input" min="0" max="10" value={form.parking} onChange={num('parking')} /></div>
            )}
            {show('facing') && (
              <div>
                <label className="crm-label">Facing</label>
                <select className="crm-select" value={form.facing} onChange={(e) => set('facing', e.target.value)}>
                  <option value="">Not Specified</option>
                  {FACING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}
            {show('possessionStatus') && (
              <div>
                <label className="crm-label">Status</label>
                <select className="crm-select" value={form.possessionStatus} onChange={(e) => set('possessionStatus', e.target.value)}>
                  <option value="">Select</option>
                  <option value="ready">Ready to Move</option>
                  <option value="under-construction">Under Construction</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
