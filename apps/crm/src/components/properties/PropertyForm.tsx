'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import { Save, ArrowLeft, Upload, X, Image as ImageIcon, Loader2, MapPin, ExternalLink } from 'lucide-react'
import { PROPERTY_TYPES, type TalukaKey, getFieldsForPropertyType, isFieldApplicable, LAND_ONLY_PROPERTY_TYPES, type SpecField } from '@easyliving/shared'
import { api, fetcher, ApiError } from '@/lib/api'
import type { User as UserType } from '@/types'
import Dropdown from '@/components/ui/Dropdown'

// The exact location picklist requested for the Add Property form. Region +
// taluka are still required by the API/DB, so each entry carries a
// best-effort taluka/region — that part is internal plumbing only, never
// shown in the UI (the picker itself just shows the location name).
type RegionKey = 'NORTH_GOA' | 'SOUTH_GOA'
const PROPERTY_LOCATIONS: { village: string; taluka: TalukaKey; region: RegionKey }[] = [
  { village: 'Aldona', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Altinho', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Anjuna', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Aquem', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Arpora', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Ashwem', taluka: 'PERNEM', region: 'NORTH_GOA' },
  { village: 'Assagao', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Badem', taluka: 'BICHOLIM', region: 'NORTH_GOA' },
  { village: 'Bainguinim', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Baga', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Bambolim', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Banastarim', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Bastora', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Benaulim', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Betalbatim', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Betim', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Betul', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Bhatlem', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Bicholim', taluka: 'BICHOLIM', region: 'NORTH_GOA' },
  { village: 'Bogmalo', taluka: 'MORMUGAO', region: 'SOUTH_GOA' },
  { village: 'Calangute', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Campal', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Canacona', taluka: 'CANACONA', region: 'SOUTH_GOA' },
  { village: 'Candolim', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Caranzalem', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Carmona', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Cavelossim', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Chapora', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Chicalim', taluka: 'MORMUGAO', region: 'SOUTH_GOA' },
  { village: 'Chimbel', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Chorao', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Colva', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Colvale', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Corlim', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Corgao', taluka: 'PERNEM', region: 'NORTH_GOA' },
  { village: 'Cortalim', taluka: 'MORMUGAO', region: 'SOUTH_GOA' },
  { village: 'Curca', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Curchorem', taluka: 'QUEPEM', region: 'SOUTH_GOA' },
  { village: 'Dabolim', taluka: 'MORMUGAO', region: 'SOUTH_GOA' },
  { village: 'Diwar', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Dona Paula', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Duler', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Goa Velha', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Gogol', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Guirim', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Kadamba Plateau', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Kerim', taluka: 'PERNEM', region: 'NORTH_GOA' },
  { village: 'Loutolim', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Mandrem', taluka: 'PERNEM', region: 'NORTH_GOA' },
  { village: 'Mapusa', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Marcela', taluka: 'PONDA', region: 'SOUTH_GOA' },
  { village: 'Margao', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Merces', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Miramar', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Moira', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Mopa', taluka: 'PERNEM', region: 'NORTH_GOA' },
  { village: 'Morjim', taluka: 'PERNEM', region: 'NORTH_GOA' },
  { village: 'Nachinola', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Nagoa', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Navelim', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Nerul', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'North Goa', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Old Goa', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Oxel', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Panjim', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Parra', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Pernem', taluka: 'PERNEM', region: 'NORTH_GOA' },
  { village: 'Pilar', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Pilerne', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Ponda', taluka: 'PONDA', region: 'SOUTH_GOA' },
  { village: 'Porvorim', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Porvorim Succour', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Raibander', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Reis Magos', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Saligao', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Salvador do Mundo', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Sangolda', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Siolim', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'South Goa', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'St. Cruz', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'St. Inez', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Succour', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Taleigao', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Tambdi Surla', taluka: 'SANGUEM', region: 'SOUTH_GOA' },
  { village: 'Tivim', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Tonca', taluka: 'TISWADI', region: 'NORTH_GOA' },
  { village: 'Uccassaim', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Valpoi', taluka: 'BICHOLIM', region: 'NORTH_GOA' },
  { village: 'Varca', taluka: 'SALCETE', region: 'SOUTH_GOA' },
  { village: 'Vasco', taluka: 'MORMUGAO', region: 'SOUTH_GOA' },
  { village: 'Vagator', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Verem', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Verla', taluka: 'BARDEZ', region: 'NORTH_GOA' },
  { village: 'Verna', taluka: 'SALCETE', region: 'SOUTH_GOA' },
]

const LOCATION_OPTIONS = PROPERTY_LOCATIONS.map((l) => ({
  value: l.village,
  label: l.village,
  taluka: l.taluka,
  region: l.region,
  village: l.village,
}))

function findLocationOption(taluka: string, village: string) {
  return LOCATION_OPTIONS.find((o) => o.village === village) ?? LOCATION_OPTIONS.find((o) => o.taluka === taluka && o.village === village)
}

interface PropertyFormProps {
  propertyId?: string // undefined = new, string = edit
}

interface ExistingMedia {
  id: string
  url: string
  isCover: boolean
}

interface ApiPropertyDetail {
  title: string
  propertyType: string
  listingType: string
  region: 'NORTH_GOA' | 'SOUTH_GOA'
  taluka: string
  village: string
  address?: string | null
  googleMapsUrl?: string | null
  salePrice?: string | number | null
  rentPrice?: string | number | null
  priceNegotiable: boolean
  priceOnRequest: boolean
  bedrooms?: number | null
  bathrooms?: number | null
  areaSqFt?: string | number | null
  plotAreaSqFt?: string | number | null
  furnishing?: string | null
  parking?: number | null
  reraNumber?: string | null
  possessionStatus?: string | null
  description?: string | null
  amenities: string[]
  isFeatured: boolean
  isPremium: boolean
  agents: { isPrimary: boolean; agent: { id: string } }[]
  media: ExistingMedia[]
}

interface PropertyFormState {
  title: string
  propertyType: string
  listingType: string
  region: 'NORTH_GOA' | 'SOUTH_GOA'
  taluka: string
  village: string
  address: string
  googleMapsUrl: string
  salePrice: string
  rentPrice: string
  priceNegotiable: boolean
  priceOnRequest: boolean
  bedrooms: string
  bathrooms: string
  areaSqFt: string
  plotAreaSqFt: string
  furnishing: string
  parking: string
  reraNumber: string
  possessionStatus: string
  description: string
  amenities: string[]
  isFeatured: boolean
  isPremium: boolean
  assignedAgentId: string
}

const EMPTY_FORM: PropertyFormState = {
  title: '',
  propertyType: 'VILLA',
  listingType: 'SALE',
  region: 'NORTH_GOA',
  taluka: 'BARDEZ',
  village: '',
  address: '',
  googleMapsUrl: '',
  salePrice: '',
  rentPrice: '',
  priceNegotiable: false,
  priceOnRequest: false,
  bedrooms: '',
  bathrooms: '',
  areaSqFt: '',
  plotAreaSqFt: '',
  furnishing: '',
  parking: '0',
  reraNumber: '',
  possessionStatus: '',
  description: '',
  amenities: [],
  isFeatured: false,
  isPremium: false,
  assignedAgentId: '',
}

const COMMON_AMENITIES = [
  'Swimming Pool', 'Private Pool', 'Garden', 'Terrace', 'Lift',
  'Generator Backup', 'Solar Power', 'CCTV', 'Covered Parking',
  'Modular Kitchen', 'Gym', 'Clubhouse', 'Sea View', 'Beach Access',
  'Wi-Fi Ready', 'Gated Community', '24/7 Security',
]

function buildPayload(form: PropertyFormState) {
  const num = (v: string) => (v.trim() === '' ? undefined : v)
  const applicable = getFieldsForPropertyType(form.propertyType)
  const field = <T,>(name: SpecField, value: T): T | undefined => (applicable.includes(name) ? value : undefined)
  return {
    title: form.title,
    description: form.description || undefined,
    propertyType: form.propertyType,
    listingType: form.listingType,
    region: form.region,
    taluka: form.taluka,
    village: form.village,
    address: form.address || undefined,
    googleMapsUrl: form.googleMapsUrl || undefined,
    salePrice: num(form.salePrice),
    rentPrice: num(form.rentPrice),
    priceNegotiable: form.priceNegotiable,
    priceOnRequest: form.priceOnRequest,
    // Fields not applicable to the selected property type are stripped
    // (sent as undefined) instead of forwarding stale values — e.g.
    // bedrooms shouldn't ride along when the type is "Plots".
    bedrooms: field('bedrooms', num(form.bedrooms)),
    bathrooms: field('bathrooms', num(form.bathrooms)),
    areaSqFt: field('areaSqFt', num(form.areaSqFt)),
    plotAreaSqFt: field('plotAreaSqFt', num(form.plotAreaSqFt)),
    furnishing: field('furnishing', form.furnishing || undefined),
    parking: field('parking', num(form.parking)),
    reraNumber: field('reraNumber', form.reraNumber || undefined),
    possessionStatus: field('possessionStatus', form.possessionStatus || undefined),
    amenities: form.amenities,
    isFeatured: form.isFeatured,
    isPremium: form.isPremium,
    ...(form.assignedAgentId && { assignedAgentIds: [form.assignedAgentId], primaryAgentId: form.assignedAgentId }),
  }
}

export default function PropertyForm({ propertyId }: PropertyFormProps) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const isEdit = !!propertyId
  const [form, setForm] = useState<PropertyFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'media'>('basic')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([])

  const { data: existing } = useSWR<ApiPropertyDetail>(isEdit ? `/api/properties/${propertyId}` : null, fetcher)
  const { data: agents } = useSWR<UserType[]>(isAdmin ? '/api/users' : null, fetcher)
  // Only real, active sales agents are assignable — matches the Agents page
  // (no admins, no suspended/legacy accounts showing up here).
  const salesAgents = (agents ?? []).filter((a) => a.role === 'SALES_EXECUTIVE' && a.status === 'ACTIVE')

  useEffect(() => {
    if (existing) {
      setForm((f) => ({
        ...f,
        title: existing.title,
        propertyType: existing.propertyType,
        listingType: existing.listingType,
        region: existing.region,
        taluka: existing.taluka,
        village: existing.village,
        address: existing.address ?? '',
        googleMapsUrl: existing.googleMapsUrl ?? '',
        salePrice: existing.salePrice != null ? String(existing.salePrice) : '',
        rentPrice: existing.rentPrice != null ? String(existing.rentPrice) : '',
        priceNegotiable: existing.priceNegotiable,
        priceOnRequest: existing.priceOnRequest,
        bedrooms: existing.bedrooms != null ? String(existing.bedrooms) : '',
        bathrooms: existing.bathrooms != null ? String(existing.bathrooms) : '',
        areaSqFt: existing.areaSqFt != null ? String(existing.areaSqFt) : '',
        plotAreaSqFt: existing.plotAreaSqFt != null ? String(existing.plotAreaSqFt) : '',
        furnishing: existing.furnishing ?? '',
        parking: existing.parking != null ? String(existing.parking) : '0',
        reraNumber: existing.reraNumber ?? '',
        possessionStatus: existing.possessionStatus ?? '',
        description: existing.description ?? '',
        amenities: existing.amenities ?? [],
        isFeatured: existing.isFeatured,
        isPremium: existing.isPremium,
        assignedAgentId: existing.agents?.find((a) => a.isPrimary)?.agent.id ?? existing.agents?.[0]?.agent.id ?? '',
      }))
      setExistingMedia(existing.media ?? [])
    }
  }, [existing])

  function set<K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  function toggleAmenity(a: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e['title'] = 'Title is required'
    else if (form.title.length < 5) e['title'] = 'Title must be at least 5 characters'
    if (!form.village.trim()) e['village'] = 'Village / area is required'
    if ((form.listingType === 'SALE' || form.listingType === 'SALE_AND_RENT') && !form.priceOnRequest && !form.salePrice)
      e['salePrice'] = 'Sale price is required (or tick Price on Request)'
    if ((form.listingType === 'RENT' || form.listingType === 'SALE_AND_RENT') && !form.rentPrice)
      e['rentPrice'] = 'Rent price is required'
    // Land-only categories (Plots, Agriculture, Resort Plots) have no
    // built-up area — Plot Area is their primary "size" field instead.
    if (LAND_ONLY_PROPERTY_TYPES.includes(form.propertyType as (typeof LAND_ONLY_PROPERTY_TYPES)[number]) && !form.plotAreaSqFt.trim())
      e['plotAreaSqFt'] = 'Plot area is required for this property type'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setNewFiles((f) => [...f, ...files])
    e.target.value = ''
  }

  async function handleDeleteExistingMedia(mediaId: string) {
    if (!propertyId) return
    await api.delete(`/api/properties/${propertyId}/media/${mediaId}`)
    setExistingMedia((m) => m.filter((x) => x.id !== mediaId))
  }

  async function handleSave() {
    if (!validate()) { setActiveTab('basic'); return }
    setSaving(true)
    setSaveError('')
    try {
      const payload = buildPayload(form)
      const property = isEdit
        ? await api.put<{ id: string }>(`/api/properties/${propertyId}`, payload)
        : await api.post<{ id: string }>('/api/properties', payload)

      if (newFiles.length > 0) {
        const formData = new FormData()
        newFiles.forEach((file) => formData.append('files', file))
        await api.post(`/api/properties/${property.id}/media`, formData)
      }

      setSaving(false)
      setSaved(true)
      setTimeout(() => { setSaved(false); router.push('/properties') }, 1000)
    } catch (err) {
      setSaving(false)
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save property')
    }
  }

  // Value for the combined location <select>. Falls back to a synthetic
  // option if the stored village isn't in the canonical list (e.g. legacy
  // free-text data), so the picker never silently shows a blank selection.
  const matchedLocation = findLocationOption(form.taluka, form.village)
  const locationValue = matchedLocation?.value ?? form.village
  const locationOptionsWithFallback = matchedLocation || !form.village
    ? LOCATION_OPTIONS
    : [{ value: form.village, label: form.village, taluka: form.taluka as TalukaKey, region: form.region, village: form.village }, ...LOCATION_OPTIONS]

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title={isEdit ? 'Edit Property' : 'Add New Property'}
        subtitle={isEdit ? 'Update the property details and save' : 'Fill in the details to list a new property'}
      />

      <div className="flex-1 p-6 max-w-[900px] mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-slate-400 mb-5">
          <Link href="/properties" className="hover:text-navy flex items-center gap-1">
            <ArrowLeft size={13} /> Properties
          </Link>
          <span>/</span>
          <span className="text-navy">{isEdit ? 'Edit' : 'New Property'}</span>
        </div>

        {/* Tab nav */}
        <div className="flex gap-0 border-b border-slate-200 mb-6 overflow-x-auto">
          {(['basic', 'details', 'media'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-[13px] font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-gold text-gold'
                  : 'border-transparent text-slate-500 hover:text-navy'
              }`}
            >
              {tab === 'basic' ? 'Basic Info' : tab === 'media' ? 'Photos & Media' : 'Property Details'}
            </button>
          ))}
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-[13px] text-red-600">{saveError}</div>
        )}

        <div className="space-y-5">

          {/* ── BASIC INFO ── */}
          {activeTab === 'basic' && (
            <>
              <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
                <h3 className="text-[14px] font-semibold text-navy">Basic Information</h3>

                <div>
                  <label className="crm-label">Property Title *</label>
                  <input
                    className={clsxInput(!!errors['title'])}
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. 3 BHK Luxury Villa in Vagator"
                  />
                  {errors['title'] && <p className="text-red-500 text-[12px] mt-1">{errors['title']}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="crm-label">Property Type *</label>
                    <Dropdown
                      value={form.propertyType}
                      onChange={(v) => {
                        // Clear spec values that no longer apply to the new
                        // type — don't let a stale "3 bedrooms" ride along
                        // silently when switching e.g. Villa -> Plots.
                        const applicable = getFieldsForPropertyType(v)
                        setForm((f) => ({
                          ...f,
                          propertyType: v,
                          bedrooms: applicable.includes('bedrooms') ? f.bedrooms : '',
                          bathrooms: applicable.includes('bathrooms') ? f.bathrooms : '',
                          areaSqFt: applicable.includes('areaSqFt') ? f.areaSqFt : '',
                          plotAreaSqFt: applicable.includes('plotAreaSqFt') ? f.plotAreaSqFt : '',
                          furnishing: applicable.includes('furnishing') ? f.furnishing : '',
                          parking: applicable.includes('parking') ? f.parking : '0',
                          possessionStatus: applicable.includes('possessionStatus') ? f.possessionStatus : '',
                          reraNumber: applicable.includes('reraNumber') ? f.reraNumber : '',
                        }))
                      }}
                      options={PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                    />
                  </div>
                  <div>
                    <label className="crm-label">Listing For *</label>
                    <select className="crm-select" value={form.listingType} onChange={(e) => set('listingType', e.target.value)}>
                      <option value="SALE">Sale</option>
                      <option value="RENT">Rent / Lease</option>
                      <option value="SALE_AND_RENT">Sale & Rent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="crm-label">Property Location *</label>
                  <Dropdown
                    value={locationValue}
                    error={!!errors['village']}
                    placeholder="-Select Location-"
                    options={locationOptionsWithFallback}
                    onChange={(v) => {
                      const opt = LOCATION_OPTIONS.find((o) => o.value === v)
                      if (!opt) return
                      setForm((f) => ({ ...f, region: opt.region, taluka: opt.taluka, village: opt.village }))
                      if (errors['village']) setErrors((er) => { const n = { ...er }; delete n['village']; return n })
                    }}
                  />
                  {errors['village'] && <p className="text-red-500 text-[12px] mt-1">{errors['village']}</p>}
                </div>

                <div>
                  <label className="crm-label">Address / Landmark</label>
                  <input className="crm-input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Street address or landmark" />
                </div>

                <div>
                  <label className="crm-label">Google Maps Link</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="url"
                      className="crm-input pl-10"
                      value={form.googleMapsUrl}
                      onChange={(e) => set('googleMapsUrl', e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paste the &quot;Share&quot; link from Google Maps. On the public site and in the CRM this opens directly in the Google Maps app on mobile, or Google Maps in browser on desktop.
                  </p>
                  {form.googleMapsUrl && (
                    <a
                      href={form.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gold hover:underline mt-2"
                    >
                      <ExternalLink size={12} /> Open in Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
                <h3 className="text-[14px] font-semibold text-navy">Pricing</h3>

                <div className="flex flex-wrap gap-5 mb-2">
                  <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={form.priceNegotiable} onChange={(e) => set('priceNegotiable', e.target.checked)} className="accent-gold" />
                    Price Negotiable
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={form.priceOnRequest} onChange={(e) => set('priceOnRequest', e.target.checked)} className="accent-gold" />
                    Price on Request
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(form.listingType === 'SALE' || form.listingType === 'SALE_AND_RENT') && (
                    <div>
                      <label className="crm-label">Sale Price (₹) {!form.priceOnRequest && '*'}</label>
                      <input
                        type="number"
                        className={clsxInput(!!errors['salePrice'])}
                        value={form.salePrice}
                        onChange={(e) => set('salePrice', e.target.value)}
                        placeholder="e.g. 4200000"
                        disabled={form.priceOnRequest}
                      />
                      {errors['salePrice'] && <p className="text-red-500 text-[12px] mt-1">{errors['salePrice']}</p>}
                    </div>
                  )}
                  {(form.listingType === 'RENT' || form.listingType === 'SALE_AND_RENT') && (
                    <div>
                      <label className="crm-label">Rent / Month (₹) *</label>
                      <input
                        type="number"
                        className={clsxInput(!!errors['rentPrice'])}
                        value={form.rentPrice}
                        onChange={(e) => set('rentPrice', e.target.value)}
                        placeholder="e.g. 25000"
                      />
                      {errors['rentPrice'] && <p className="text-red-500 text-[12px] mt-1">{errors['rentPrice']}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment */}
              {isAdmin && (
                <div className="bg-white rounded-xl border border-slate-100 p-6">
                  <h3 className="text-[14px] font-semibold text-navy mb-4">Assign Agent</h3>
                  <select className="crm-select max-w-xs" value={form.assignedAgentId} onChange={(e) => set('assignedAgentId', e.target.value)}>
                    <option value="">Select agent (defaults to you)</option>
                    {salesAgents.map((a) => (
                      <option key={a.id} value={a.id}>{a.firstName} {a.lastName} — {a.locationTags?.join(', ')}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* ── PROPERTY DETAILS ── */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
              <h3 className="text-[14px] font-semibold text-navy">Property Specifications</h3>

              {(() => {
                const show = (field: SpecField) => isFieldApplicable(form.propertyType, field)
                return (
                  <>
                    {(show('bedrooms') || show('bathrooms') || show('areaSqFt') || show('plotAreaSqFt')) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {show('bedrooms') && (
                          <div>
                            <label className="crm-label">Bedrooms</label>
                            <input type="number" className="crm-input" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} placeholder="0" min="0" max="20" />
                          </div>
                        )}
                        {show('bathrooms') && (
                          <div>
                            <label className="crm-label">Bathrooms</label>
                            <input type="number" className="crm-input" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} placeholder="0" min="0" max="20" />
                          </div>
                        )}
                        {show('areaSqFt') && (
                          <div>
                            <label className="crm-label">Built-up Area (sq.ft)</label>
                            <input type="number" className="crm-input" value={form.areaSqFt} onChange={(e) => set('areaSqFt', e.target.value)} placeholder="e.g. 2200" />
                          </div>
                        )}
                        {show('plotAreaSqFt') && (
                          <div>
                            <label className="crm-label">Plot Area (sq.ft) {LAND_ONLY_PROPERTY_TYPES.includes(form.propertyType as (typeof LAND_ONLY_PROPERTY_TYPES)[number]) && '*'}</label>
                            <input type="number" className={clsxInput(!!errors['plotAreaSqFt'])} value={form.plotAreaSqFt} onChange={(e) => set('plotAreaSqFt', e.target.value)} placeholder="e.g. 4500" />
                            {errors['plotAreaSqFt'] && <p className="text-red-500 text-[12px] mt-1">{errors['plotAreaSqFt']}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {(show('furnishing') || show('parking') || show('possessionStatus')) && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                          <div>
                            <label className="crm-label">Parking Spots</label>
                            <input type="number" className="crm-input" value={form.parking} onChange={(e) => set('parking', e.target.value)} min="0" max="10" />
                          </div>
                        )}
                        {show('possessionStatus') && (
                          <div>
                            <label className="crm-label">Possession Status</label>
                            <select className="crm-select" value={form.possessionStatus} onChange={(e) => set('possessionStatus', e.target.value)}>
                              <option value="">Select</option>
                              <option value="ready">Ready to Move</option>
                              <option value="under-construction">Under Construction</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {show('reraNumber') && (
                      <div>
                        <label className="crm-label">RERA Number</label>
                        <input className="crm-input max-w-xs" value={form.reraNumber} onChange={(e) => set('reraNumber', e.target.value)} placeholder="e.g. PRGO123456" />
                      </div>
                    )}
                  </>
                )
              })()}

              <div>
                <label className="crm-label">Description</label>
                <textarea
                  className="crm-input resize-none"
                  rows={5}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe the property — key features, surroundings, unique aspects..."
                />
              </div>

              <div>
                <label className="crm-label mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_AMENITIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`text-[12px] px-3 py-1.5 rounded-full border transition-all ${
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
            </div>
          )}

          {/* ── PHOTOS ── */}
          {activeTab === 'media' && (
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h3 className="text-[14px] font-semibold text-navy mb-1">Photos & Media</h3>
              <p className="text-[12px] text-slate-400 mb-5">
                {isEdit ? 'Upload images, videos, and floor plans.' : 'Photos upload right after you save this property below.'} First image becomes the cover.
              </p>

              {/* Upload zone */}
              <label className="block border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-gold transition-colors cursor-pointer group">
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf" className="hidden" onChange={handleFilePick} />
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload size={22} className="text-slate-400 group-hover:text-gold transition-colors" />
                </div>
                <p className="text-[14px] font-medium text-slate-700 mb-1">Drop photos here or click to upload</p>
                <p className="text-[12px] text-slate-400">JPG, PNG, WebP, MP4, PDF — max 10MB each. Up to 20 files.</p>
                <span className="btn-secondary mt-4 mx-auto inline-flex">
                  <ImageIcon size={14} /> Choose Files
                </span>
              </label>

              {/* Newly selected files (not yet uploaded) */}
              {newFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-[12px] text-slate-400 mb-2">Selected — will upload when you save</p>
                  <div className="flex gap-3 flex-wrap">
                    {newFiles.map((file, i) => (
                      <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-500 px-1 text-center line-clamp-3">{file.name}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setNewFiles((f) => f.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing images in edit mode */}
              {isEdit && existingMedia.length > 0 && (
                <div className="mt-4">
                  <p className="text-[12px] text-slate-400 mb-2">Current images</p>
                  <div className="flex gap-3 flex-wrap">
                    {existingMedia.map((m) => (
                      <div key={m.id} className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-100">
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                        {m.isCover && <span className="absolute top-1 left-1 text-[9px] bg-navy text-white px-1.5 py-0.5 rounded font-bold">COVER</span>}
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingMedia(m.id)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save bar */}
        <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-200">
          <Link href="/properties" className="btn-secondary">
            <ArrowLeft size={14} /> Cancel
          </Link>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Saving...</>
              ) : saved ? (
                <><span className="text-green-700">✓</span> Saved!</>
              ) : (
                <><Save size={14} /> {isEdit ? 'Save Changes' : 'Create Property'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function clsxInput(hasError: boolean) {
  return `crm-input ${hasError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`
}
