'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Phone, Mail, MessageCircle, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface LeadFormData {
  name: string
  phone: string
  whatsapp: string
  email: string
  source: string
  status: string
  priority: string
  lookingTo: string
  propertyType: string
  location: string
  budgetMin: string
  budgetMax: string
  bedrooms: string
  assignedTo: string
  notes: string
}

const EMPTY: LeadFormData = {
  name: '', phone: '', whatsapp: '', email: '',
  source: '', status: 'New Lead', priority: 'Warm',
  lookingTo: 'Buy', propertyType: '', location: '',
  budgetMin: '', budgetMax: '', bedrooms: 'Any',
  assignedTo: 'Urmilla Dias', notes: '',
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: LeadFormData) => void
  initial?: LeadFormData
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#b59762] whitespace-nowrap">{title}</p>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-slate-500 mb-1">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function Input({ icon: Icon, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType; error?: boolean }) {
  return (
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      <input
        {...props}
        className={clsx(
          'w-full py-2.5 border rounded-lg text-[13px] text-slate-800 bg-white',
          'focus:outline-none focus:ring-2 transition-all',
          Icon ? 'pl-9 pr-3' : 'px-3',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-slate-200 focus:border-[#b59762] focus:ring-[#b59762]/15',
          props.disabled && 'bg-slate-50 cursor-not-allowed text-slate-400'
        )}
      />
    </div>
  )
}

function Select({ children, value, onChange }: { children: React.ReactNode; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 bg-white
                   appearance-none cursor-pointer focus:outline-none focus:border-[#b59762] focus:ring-2
                   focus:ring-[#b59762]/15 transition-all pr-9"
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}

export default function AddLeadDrawer({ open, onClose, onSave, initial }: Props) {
  const [mounted, setMounted] = useState(false)
  const [form, setForm]       = useState<LeadFormData>(EMPTY)
  const [samePhone, setSamePhone] = useState(false)
  const [errors, setErrors]   = useState<Partial<Record<keyof LeadFormData, string>>>({})

  // Portal needs DOM
  useEffect(() => { setMounted(true) }, [])

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...EMPTY })
      setSamePhone(false)
      setErrors({})
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, initial])

  function set(field: keyof LeadFormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validate() {
    const e: Partial<Record<keyof LeadFormData, string>> = {}
    if (!form.name.trim())  e.name   = 'Name is required'
    if (!form.phone.trim()) e.phone  = 'Phone is required'
    if (!form.source)       e.source = 'Select a source'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave({ ...form, whatsapp: samePhone ? form.phone : form.whatsapp })
  }

  if (!mounted) return null

  const isEdit = !!initial

  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 bg-black/50 z-[998] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* ── Drawer ── */}
      <div
        className={clsx(
          'fixed top-0 right-0 h-screen w-full sm:w-[520px] bg-white z-[999]',
          'flex flex-col shadow-2xl transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">
              {isEdit ? 'Update the details below' : 'Fill in the lead details to add to your pipeline'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Contact Information ── */}
          <SectionTitle title="Contact Information" />

          <div>
            <FieldLabel required>Full Name</FieldLabel>
            <Input
              icon={User}
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              error={!!errors.name}
            />
            {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Phone Number</FieldLabel>
              <Input
                icon={Phone}
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                onChange={e => {
                  set('phone', e.target.value)
                  if (samePhone) set('whatsapp', e.target.value)
                }}
                error={!!errors.phone}
              />
              {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <FieldLabel>WhatsApp</FieldLabel>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3 h-3 accent-[#b59762]"
                    checked={samePhone}
                    onChange={e => {
                      setSamePhone(e.target.checked)
                      if (e.target.checked) set('whatsapp', form.phone)
                      else set('whatsapp', '')
                    }}
                  />
                  <span className="text-[10px] text-slate-400 select-none">Same</span>
                </label>
              </div>
              <Input
                icon={MessageCircle}
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={samePhone ? form.phone : form.whatsapp}
                disabled={samePhone}
                onChange={e => set('whatsapp', e.target.value)}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Email Address</FieldLabel>
            <Input
              icon={Mail}
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
          </div>

          {/* ── Lead Details ── */}
          <SectionTitle title="Lead Details" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Lead Source</FieldLabel>
              <Select value={form.source} onChange={v => set('source', v)}>
                <option value="">Select source…</option>
                {['Website', 'WhatsApp', 'Referral', 'Walk-in', 'Social Media',
                  'Google Ads', '99acres', 'MagicBricks', 'Cold Call', 'Email', 'Other'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              {errors.source && <p className="text-[11px] text-red-400 mt-1">{errors.source}</p>}
            </div>
            <div>
              <FieldLabel>Lead Status</FieldLabel>
              <Select value={form.status} onChange={v => set('status', v)}>
                {['New Lead', 'Contacted', 'Site Visit Scheduled', 'Site Visit Done',
                  'Negotiation', 'Closed Won', 'Closed Lost'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Priority</FieldLabel>
              <div className="flex gap-2">
                {[
                  { v: 'Hot',  on: 'bg-red-500 text-white border-red-500',    off: 'bg-red-50 text-red-600 border-red-200' },
                  { v: 'Warm', on: 'bg-amber-500 text-white border-amber-500', off: 'bg-amber-50 text-amber-600 border-amber-200' },
                  { v: 'Cold', on: 'bg-sky-500 text-white border-sky-500',    off: 'bg-sky-50 text-sky-600 border-sky-200' },
                ].map(({ v, on, off }) => (
                  <button
                    key={v} type="button"
                    onClick={() => set('priority', v)}
                    className={clsx('flex-1 py-2 rounded-lg text-[12px] font-semibold border transition-all', form.priority === v ? on : off)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Assigned To</FieldLabel>
              <Select value={form.assignedTo} onChange={v => set('assignedTo', v)}>
                {['Urmilla Dias', 'Unassigned'].map(a => <option key={a}>{a}</option>)}
              </Select>
            </div>
          </div>

          {/* ── Property Requirements ── */}
          <SectionTitle title="Property Requirements" />

          <div>
            <FieldLabel>Looking To</FieldLabel>
            <div className="flex gap-2">
              {['Buy', 'Rent', 'Invest'].map(opt => (
                <button
                  key={opt} type="button"
                  onClick={() => set('lookingTo', opt)}
                  className={clsx(
                    'flex-1 py-2.5 rounded-lg text-[12px] font-semibold border transition-all',
                    form.lookingTo === opt
                      ? 'bg-[#0f172a] border-[#0f172a] text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Property Type</FieldLabel>
              <Select value={form.propertyType} onChange={v => set('propertyType', v)}>
                <option value="">Select type…</option>
                {['Villa', 'Apartment/Flat', 'Plot/Land', 'Commercial', 'Farm House',
                  'Row House', 'Studio', 'Penthouse', 'Portuguese House', 'Other'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </div>
            <div>
              <FieldLabel>Bedrooms</FieldLabel>
              <Select value={form.bedrooms} onChange={v => set('bedrooms', v)}>
                {[
                  { v: 'Any', l: 'Any' }, { v: '1', l: '1 BHK' }, { v: '2', l: '2 BHK' },
                  { v: '3', l: '3 BHK' }, { v: '4', l: '4 BHK' }, { v: '5+', l: '5+ BHK' },
                  { v: 'N/A', l: 'Not Applicable' },
                ].map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <FieldLabel>Preferred Location</FieldLabel>
            <Input
              placeholder="e.g. Calangute, Baga, Anjuna…"
              value={form.location}
              onChange={e => set('location', e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">You can mention multiple areas</p>
          </div>

          <div>
            <FieldLabel>Budget Range (₹)</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">₹</span>
                <input
                  className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800
                             bg-white focus:outline-none focus:border-[#b59762] focus:ring-2 focus:ring-[#b59762]/15 transition-all"
                  placeholder="Minimum"
                  value={form.budgetMin}
                  onChange={e => set('budgetMin', e.target.value)}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">₹</span>
                <input
                  className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800
                             bg-white focus:outline-none focus:border-[#b59762] focus:ring-2 focus:ring-[#b59762]/15 transition-all"
                  placeholder="Maximum"
                  value={form.budgetMax}
                  onChange={e => set('budgetMax', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Notes ── */}
          <SectionTitle title="Additional Notes" />

          <div>
            <textarea
              rows={4}
              placeholder="Specific requirements, timeline, any other details…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800
                         bg-white resize-none focus:outline-none focus:border-[#b59762]
                         focus:ring-2 focus:ring-[#b59762]/15 transition-all"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0 bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-[13px] font-semibold
                       text-slate-600 bg-white hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-[#0f172a]
                       bg-[#b59762] hover:bg-[#d4b87a] transition-all"
          >
            {isEdit ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
