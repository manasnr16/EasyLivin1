'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'
import { getFieldsForPropertyType, LAND_ONLY_PROPERTY_TYPES, type SpecField } from '@easyliving/shared'
import { api, fetcher, ApiError } from '@/lib/api'
import type { User as UserType } from '@/types'
import StepNav from './StepNav'
import CompletionPanel from './CompletionPanel'
import BasicStep from './steps/BasicStep'
import DetailsStep from './steps/DetailsStep'
import LocationStep from './steps/LocationStep'
import PricingStep from './steps/PricingStep'
import FeaturesStep from './steps/FeaturesStep'
import MediaStep from './steps/MediaStep'
import { EMPTY_FORM, STEPS, type ApiLocation, type ApiPropertyDetail, type ExistingMedia, type PropertyFormState, type StepKey } from './formTypes'

interface PropertyFormProps {
  propertyId?: string // undefined = new, string = edit
}

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
    salePrice: num(form.salePrice),
    rentPrice: num(form.rentPrice),
    priceNegotiable: form.priceNegotiable,
    priceOnRequest: form.priceOnRequest,
    // Fields not applicable to the selected property type are stripped
    // (sent as undefined) instead of forwarding stale values.
    bedrooms: field('bedrooms', num(form.bedrooms)),
    bathrooms: field('bathrooms', num(form.bathrooms)),
    balconies: field('balconies', num(form.balconies)),
    areaSqFt: field('areaSqFt', num(form.areaSqFt)),
    plotAreaSqFt: field('plotAreaSqFt', num(form.plotAreaSqFt)),
    floorNumber: field('floorNumber', num(form.floorNumber)),
    floors: field('floors', num(form.floors)),
    furnishing: field('furnishing', form.furnishing || undefined),
    parking: field('parking', num(form.parking)),
    facing: field('facing', form.facing || undefined),
    roadWidthFt: field('roadWidthFt', num(form.roadWidthFt)),
    landUse: field('landUse', form.landUse || undefined),
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
  const [activeStep, setActiveStep] = useState<StepKey>('basic')
  const [visitedSteps, setVisitedSteps] = useState<Set<StepKey>>(new Set(['basic']))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([])
  // How far the staff member has actually progressed — steps beyond this
  // index are locked in StepNav until the current one is fully filled in.
  const [unlockedIndex, setUnlockedIndex] = useState(0)
  const [stepError, setStepError] = useState('')

  const { data: existing } = useSWR<ApiPropertyDetail>(isEdit ? `/api/properties/${propertyId}` : null, fetcher)
  const { data: agents } = useSWR<UserType[]>(isAdmin ? '/api/users' : null, fetcher)
  const { data: locations, mutate: mutateLocations } = useSWR<ApiLocation[]>('/api/locations', fetcher)
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
        salePrice: existing.salePrice != null ? String(existing.salePrice) : '',
        rentPrice: existing.rentPrice != null ? String(existing.rentPrice) : '',
        priceNegotiable: existing.priceNegotiable,
        priceOnRequest: existing.priceOnRequest,
        bedrooms: existing.bedrooms != null ? String(existing.bedrooms) : '',
        bathrooms: existing.bathrooms != null ? String(existing.bathrooms) : '',
        balconies: existing.balconies != null ? String(existing.balconies) : '',
        areaSqFt: existing.areaSqFt != null ? String(existing.areaSqFt) : '',
        plotAreaSqFt: existing.plotAreaSqFt != null ? String(existing.plotAreaSqFt) : '',
        floorNumber: existing.floorNumber != null ? String(existing.floorNumber) : '',
        floors: existing.floors != null ? String(existing.floors) : '',
        furnishing: existing.furnishing ?? '',
        parking: existing.parking != null ? String(existing.parking) : '0',
        facing: existing.facing ?? '',
        roadWidthFt: existing.roadWidthFt != null ? String(existing.roadWidthFt) : '',
        landUse: existing.landUse ?? '',
        possessionStatus: existing.possessionStatus ?? '',
        description: existing.description ?? '',
        amenities: existing.amenities ?? [],
        isFeatured: existing.isFeatured,
        isPremium: existing.isPremium,
        assignedAgentId: existing.agents?.find((a) => a.isPrimary)?.agent.id ?? existing.agents?.[0]?.agent.id ?? '',
      }))
      setExistingMedia(existing.media ?? [])
      // Editing an already-saved property — don't force the staff member
      // back through a step-by-step gate for data that's already there.
      setUnlockedIndex(STEPS.length - 1)
    }
  }, [existing])

  function set<K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key as string]) setErrors((e) => { const n = { ...e }; delete n[key as string]; return n })
    if (stepError) setStepError('')
  }

  function clearError(key: string) {
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  function toggleAmenity(a: string) {
    setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }))
  }

  function handlePropertyTypeChange(v: string) {
    const applicable = getFieldsForPropertyType(v)
    setForm((f) => ({
      ...f,
      propertyType: v,
      bedrooms: applicable.includes('bedrooms') ? f.bedrooms : '',
      bathrooms: applicable.includes('bathrooms') ? f.bathrooms : '',
      balconies: applicable.includes('balconies') ? f.balconies : '',
      areaSqFt: applicable.includes('areaSqFt') ? f.areaSqFt : '',
      plotAreaSqFt: applicable.includes('plotAreaSqFt') ? f.plotAreaSqFt : '',
      floorNumber: applicable.includes('floorNumber') ? f.floorNumber : '',
      floors: applicable.includes('floors') ? f.floors : '',
      furnishing: applicable.includes('furnishing') ? f.furnishing : '',
      parking: applicable.includes('parking') ? f.parking : '0',
      facing: applicable.includes('facing') ? f.facing : '',
      roadWidthFt: applicable.includes('roadWidthFt') ? f.roadWidthFt : '',
      landUse: applicable.includes('landUse') ? f.landUse : '',
      possessionStatus: applicable.includes('possessionStatus') ? f.possessionStatus : '',
    }))
  }

  // The two fields the backend can never save a property without, draft or
  // not — kept separate from full validation so "Save Draft" stays true to
  // its name and doesn't force a staff member to fill in price/photos just
  // to save their progress and come back later.
  function validateMinimal() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e['title'] = 'Please enter a property title'
    else if (form.title.length < 5) e['title'] = 'Title must be at least 5 characters'
    if (!form.village.trim()) e['village'] = 'Please select a property location'
    return e
  }

  // Full validation — required to Publish, not to save a draft.
  function validate() {
    const e = validateMinimal()
    if ((form.listingType === 'SALE' || form.listingType === 'SALE_AND_RENT') && !form.priceOnRequest && !form.salePrice)
      e['salePrice'] = 'Enter a valid property price (or mark Price on Request)'
    if ((form.listingType === 'RENT' || form.listingType === 'SALE_AND_RENT') && !form.rentPrice)
      e['rentPrice'] = 'Enter a valid monthly rent'
    if (LAND_ONLY_PROPERTY_TYPES.includes(form.propertyType as (typeof LAND_ONLY_PROPERTY_TYPES)[number]) && !form.plotAreaSqFt.trim())
      e['plotAreaSqFt'] = 'Plot area is required for this property type'
    setErrors(e)
    return e
  }

  const SPEC_FIELD_LABELS: Record<SpecField, string> = {
    bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', balconies: 'Balconies',
    areaSqFt: 'Built-up Area', plotAreaSqFt: 'Plot Area', floorNumber: 'Property Floor',
    floors: 'Total Floors', furnishing: 'Furnishing', parking: 'Parking Spots',
    facing: 'Facing', possessionStatus: 'Status', roadWidthFt: 'Road Width', landUse: 'Land Use',
  }

  // Everything visible on a given step must be filled in before the wizard
  // lets a staff member move past it — returns per-field errors (for the
  // steps that render them) plus human labels for the "what's missing" banner.
  function validateStep(step: StepKey): { fieldErrors: Record<string, string>; missingLabels: string[] } {
    const fieldErrors: Record<string, string> = {}
    const missingLabels: string[] = []

    if (step === 'basic') {
      if (!form.title.trim()) { fieldErrors['title'] = 'Please enter a property title'; missingLabels.push('Property Title') }
      else if (form.title.length < 5) { fieldErrors['title'] = 'Title must be at least 5 characters'; missingLabels.push('Property Title (min. 5 characters)') }
    }

    if (step === 'details') {
      // Facing is the one deliberate exception — genuinely unknown/not
      // applicable for plenty of real listings, so "Not Specified" (blank)
      // is left as a legitimate answer rather than forced.
      for (const field of getFieldsForPropertyType(form.propertyType)) {
        if (field === 'facing') continue
        if (!(form[field as keyof PropertyFormState] as string).trim()) {
          fieldErrors[field] = 'Required'
          missingLabels.push(SPEC_FIELD_LABELS[field])
        }
      }
    }

    if (step === 'location') {
      if (!form.village.trim()) { fieldErrors['village'] = 'Please select a property location'; missingLabels.push('Property Location') }
      if (!form.address.trim()) { fieldErrors['address'] = 'Please add the address / landmark'; missingLabels.push('Address / Landmark') }
    }

    if (step === 'pricing') {
      if ((form.listingType === 'SALE' || form.listingType === 'SALE_AND_RENT') && !form.priceOnRequest && !form.salePrice) {
        fieldErrors['salePrice'] = 'Enter a valid property price (or mark Price on Request)'; missingLabels.push('Sale Price')
      }
      if ((form.listingType === 'RENT' || form.listingType === 'SALE_AND_RENT') && !form.rentPrice) {
        fieldErrors['rentPrice'] = 'Enter a valid monthly rent'; missingLabels.push('Monthly Rent')
      }
    }

    if (step === 'features') {
      if (!form.description.trim()) { fieldErrors['description'] = 'Please add a description'; missingLabels.push('Description') }
    }

    return { fieldErrors, missingLabels }
  }

  // Validates the given step and, only if it's complete, unlocks/advances
  // to the next one. Returns whether it advanced.
  function tryAdvanceFrom(step: StepKey): boolean {
    const { fieldErrors, missingLabels } = validateStep(step)
    setErrors(fieldErrors)
    if (missingLabels.length > 0) {
      setStepError(`Please complete before continuing: ${missingLabels.join(', ')}.`)
      return false
    }
    setStepError('')
    const i = STEPS.findIndex((s) => s.key === step)
    setUnlockedIndex((u) => Math.max(u, i + 1))
    return true
  }

  // Publish-readiness checklist shown on the Media step (now the last step)
  // — broader than validate(): includes things recommended for a *good*
  // listing (a photo), each pointing back at the step that fixes it.
  const publishIssues: { label: string; step: StepKey }[] = []
  if (!form.title.trim() || form.title.length < 5) publishIssues.push({ label: 'Add a property title (min. 5 characters)', step: 'basic' })
  if (!form.village.trim()) publishIssues.push({ label: 'Add the property location', step: 'location' })
  const priceMissing = form.priceOnRequest ? false : (form.listingType === 'RENT' ? !form.rentPrice : !form.salePrice)
  if (priceMissing) publishIssues.push({ label: 'Add the property price', step: 'pricing' })
  if (newFiles.length === 0 && existingMedia.length === 0) publishIssues.push({ label: 'Add at least one photo', step: 'media' })

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

  // "Save Draft" (redirectAfter=false) only enforces the two fields the
  // backend can't do without; "Publish"/"Save Changes" enforces everything.
  async function handleSave(redirectAfter: boolean) {
    let validationErrors: Record<string, string>
    if (redirectAfter) {
      validationErrors = validate()
    } else {
      validationErrors = validateMinimal()
      setErrors(validationErrors)
    }
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorStep: StepKey = validationErrors['title'] ? 'basic'
        : validationErrors['village'] ? 'location'
        : validationErrors['salePrice'] || validationErrors['rentPrice'] ? 'pricing'
        : validationErrors['plotAreaSqFt'] ? 'details'
        : 'basic'
      setActiveStep(firstErrorStep)
      return
    }
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
        setNewFiles([])
      }

      setSaving(false)
      setLastSavedAt(new Date())
      if (redirectAfter) router.push('/properties')
    } catch (err) {
      setSaving(false)
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save property')
    }
  }

  // Free navigation backward/within what's already unlocked; a step ahead
  // of unlockedIndex is refused with the same "what's missing" banner
  // rather than silently doing nothing.
  // Pure navigation — StepNav only ever offers steps up to unlockedIndex
  // (locked ones are rendered disabled), so this is a straightforward guard
  // rather than where the actual gating decision happens.
  function goToStep(step: StepKey) {
    if (STEPS.findIndex((s) => s.key === step) > unlockedIndex) return
    setActiveStep(step)
    setVisitedSteps((s) => new Set(s).add(step))
    setStepError('')
  }

  // "Continue" — the one place that actually validates the current step
  // and, only if it's complete, unlocks and moves to the next one.
  function handleContinue() {
    if (!tryAdvanceFrom(activeStep)) return
    const next = STEPS[STEPS.findIndex((s) => s.key === activeStep) + 1]
    if (!next) return
    setActiveStep(next.key)
    setVisitedSteps((s) => new Set(s).add(next.key))
  }

  const photoCount = newFiles.length + existingMedia.length

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title={isEdit ? 'Edit Property' : 'Add New Property'}
        subtitle={isEdit ? 'Update the property details and save' : 'Fill in the details to list a new property'}
      />

      <div className="flex-1 p-6 max-w-[1180px] mx-auto w-full">
        {/* Breadcrumb + top actions */}
        <div className="flex items-center justify-between mb-5 gap-3">
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <Link href="/properties" className="hover:text-navy flex items-center gap-1">
              <ArrowLeft size={13} /> Properties
            </Link>
            <span>/</span>
            <span className="text-navy">{isEdit ? 'Edit' : 'New Property'}</span>
            {isEdit && propertyId && <span className="text-slate-300">· ID {propertyId.slice(0, 8).toUpperCase()}</span>}
          </div>
          <div className="flex items-center gap-3">
            {lastSavedAt && <span className="text-[11.5px] text-slate-400">Saved {lastSavedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
            <button type="button" onClick={() => handleSave(false)} disabled={saving} className="btn-secondary disabled:opacity-60">
              Save Draft
            </button>
          </div>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-[13px] text-red-600">{saveError}</div>
        )}

        <StepNav active={activeStep} completed={visitedSteps} unlockedIndex={unlockedIndex} onSelect={goToStep} />

        {stepError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-[13px] text-amber-800">{stepError}</div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {activeStep === 'basic' && (
              <BasicStep form={form} errors={errors} set={set} onPropertyTypeChange={handlePropertyTypeChange} isAdmin={isAdmin} salesAgents={salesAgents} />
            )}
            {activeStep === 'details' && <DetailsStep form={form} errors={errors} set={set} />}
            {activeStep === 'location' && (
              <LocationStep form={form} errors={errors} set={set} clearError={clearError} locations={locations ?? []} mutateLocations={mutateLocations} />
            )}
            {activeStep === 'pricing' && <PricingStep form={form} errors={errors} set={set} />}
            {activeStep === 'features' && <FeaturesStep form={form} errors={errors} set={set} toggleAmenity={toggleAmenity} />}
            {activeStep === 'media' && (
              <MediaStep
                isEdit={isEdit}
                newFiles={newFiles}
                onFilePick={handleFilePick}
                onRemoveNewFile={(i) => setNewFiles((f) => f.filter((_, idx) => idx !== i))}
                existingMedia={existingMedia}
                onDeleteExistingMedia={handleDeleteExistingMedia}
                issues={publishIssues}
                onJumpToStep={goToStep}
                status={existing?.status}
                lastUpdated={existing?.updatedAt ? new Date(existing.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : undefined}
              />
            )}

            {/* Step footer nav */}
            <div className="flex items-center justify-between gap-4 mt-5 pt-5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => { const i = STEPS.findIndex((s) => s.key === activeStep); if (i > 0) goToStep(STEPS[i - 1]!.key) }}
                disabled={activeStep === STEPS[0]!.key}
                className="btn-secondary disabled:opacity-40"
              >
                <ArrowLeft size={14} /> Back
              </button>
              {activeStep === STEPS[STEPS.length - 1]!.key ? (
                <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {isEdit ? 'Save Changes' : 'Publish Property'}</>}
                </button>
              ) : (
                <button type="button" onClick={handleContinue} className="btn-primary">
                  Continue
                </button>
              )}
            </div>
          </div>

          <CompletionPanel form={form} photoCount={photoCount} />
        </div>
      </div>
    </div>
  )
}
