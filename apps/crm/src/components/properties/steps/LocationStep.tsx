'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { ALL_TALUKAS, type TalukaKey } from '@easyliving/shared'
import { api, ApiError } from '@/lib/api'
import type { KeyedMutator } from 'swr'
import type { ApiLocation, PropertyFormState, RegionKey } from '../formTypes'

interface LocationStepProps {
  form: PropertyFormState
  errors: Record<string, string>
  set: <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) => void
  clearError: (key: string) => void
  locations: ApiLocation[]
  mutateLocations: KeyedMutator<ApiLocation[]>
}

function talukaLabel(taluka: string) {
  return ALL_TALUKAS.find((t) => t.key === taluka)?.label ?? taluka
}

export default function LocationStep({ form, errors, set, clearError, locations, mutateLocations }: LocationStepProps) {
  const [locationQuery, setLocationQuery] = useState('')
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [newLocation, setNewLocation] = useState({ village: '', region: 'NORTH_GOA' as RegionKey, taluka: 'BARDEZ' as TalukaKey })
  const [addLocationError, setAddLocationError] = useState('')
  const [addingLocation, setAddingLocation] = useState(false)

  const LOCATION_OPTIONS = locations.map((l) => ({ value: l.village, label: l.village, taluka: l.taluka, region: l.region, village: l.village }))
  const locationSuggestions = LOCATION_OPTIONS.filter((o) => o.village.toLowerCase().includes(locationQuery.trim().toLowerCase()))

  function findLocationOption(taluka: string, village: string) {
    return LOCATION_OPTIONS.find((o) => o.village === village) ?? LOCATION_OPTIONS.find((o) => o.taluka === taluka && o.village === village)
  }
  const selectedLocationOpt = findLocationOption(form.taluka, form.village)
  const committedLocationLabel = form.village ? `${form.village} - ${talukaLabel(selectedLocationOpt?.taluka ?? form.taluka)}` : ''

  async function handleAddLocation() {
    const village = newLocation.village.trim()
    if (village.length < 2) { setAddLocationError('Enter a location name (min 2 characters)'); return }
    setAddingLocation(true)
    setAddLocationError('')
    try {
      const created = await api.post<ApiLocation>('/api/locations', { village, taluka: newLocation.taluka, region: newLocation.region })
      await mutateLocations((prev) => [...(prev ?? []), created].sort((a, b) => a.village.localeCompare(b.village)), { revalidate: false })
      set('region', created.region)
      set('taluka', created.taluka)
      set('village', created.village)
      setShowAddLocation(false)
      setNewLocation({ village: '', region: 'NORTH_GOA', taluka: 'BARDEZ' })
    } catch (err) {
      setAddLocationError(err instanceof ApiError ? err.message : 'Failed to add location')
    } finally {
      setAddingLocation(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
      <h3 className="text-[14px] font-semibold text-navy">Location</h3>

      <div className="relative">
        <label className="crm-label">Property Location *</label>
        <div className="flex items-start gap-2">
          <div className="max-w-xs w-full relative">
            <input
              className={`crm-input ${errors['village'] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              value={showLocationSuggestions ? locationQuery : committedLocationLabel}
              onChange={(e) => { setLocationQuery(e.target.value); setShowLocationSuggestions(true) }}
              onFocus={() => { setLocationQuery(''); setShowLocationSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 100)}
              placeholder="Click or type to search a location..."
              autoComplete="off"
            />
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {locationSuggestions.map((o) => (
                  <li key={o.value}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        set('region', o.region); set('taluka', o.taluka); set('village', o.village)
                        setShowLocationSuggestions(false)
                        clearError('village')
                      }}
                      className="w-full text-left px-3.5 py-2 text-[13.5px] text-slate-700 hover:bg-slate-50"
                    >
                      {o.village} <span className="text-slate-400">- {talukaLabel(o.taluka)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" onClick={() => setShowAddLocation(true)} className="btn-secondary whitespace-nowrap shrink-0">
            <Plus size={14} /> Add Location
          </button>
        </div>
        {errors['village'] && <p className="text-red-500 text-[12px] mt-1">{errors['village']}</p>}
      </div>

      <div>
        <label className="crm-label">Address / Landmark *</label>
        <input
          className={`crm-input ${errors['address'] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder="Type the street address or landmark"
        />
        {errors['address'] && <p className="text-red-500 text-[12px] mt-1">{errors['address']}</p>}
      </div>

      {showAddLocation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-navy">Add New Location</h3>
              <button type="button" onClick={() => setShowAddLocation(false)} className="text-slate-400 hover:text-navy"><X size={16} /></button>
            </div>

            <div>
              <label className="crm-label">Location Name *</label>
              <input className="crm-input" value={newLocation.village} onChange={(e) => setNewLocation((l) => ({ ...l, village: e.target.value }))} autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="crm-label">Region</label>
                <select
                  className="crm-select"
                  value={newLocation.region}
                  onChange={(e) => {
                    const region = e.target.value as RegionKey
                    const firstTaluka = ALL_TALUKAS.find((t) => t.region === region)?.key ?? newLocation.taluka
                    setNewLocation((l) => ({ ...l, region, taluka: firstTaluka }))
                  }}
                >
                  <option value="NORTH_GOA">North Goa</option>
                  <option value="SOUTH_GOA">South Goa</option>
                </select>
              </div>
              <div>
                <label className="crm-label">Taluka</label>
                <select className="crm-select" value={newLocation.taluka} onChange={(e) => setNewLocation((l) => ({ ...l, taluka: e.target.value as TalukaKey }))}>
                  {ALL_TALUKAS.filter((t) => t.region === newLocation.region).map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {addLocationError && <p className="text-red-500 text-[12px]">{addLocationError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddLocation(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={handleAddLocation} disabled={addingLocation} className="btn-primary disabled:opacity-60">
                {addingLocation ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : 'Add Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
