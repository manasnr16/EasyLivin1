'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { submitEnquiry } from '@/lib/api'

interface EnquiryFormInlineProps {
  propertyTitle: string
  propertyId: string
}

const EMPTY_FORM = { name: '', email: '', phone: '', city: '', message: '' }

// The inline "Enquire about this property" form shown at the bottom of
// every property page — separate from EnquiryModal (the quick popup CTA in
// the sidebar); this one sits directly on the page, matching the layout of
// the original site.
export default function EnquiryFormInline({ propertyTitle, propertyId }: EnquiryFormInlineProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Name, email and telephone are required')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await submitEnquiry({
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: [form.city && `City: ${form.city}`, form.message || `I am interested in: ${propertyTitle}`].filter(Boolean).join(' — '),
        propertyId,
      })
      setSubmitted(true)
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t border-slate-100 pt-6">
      <h2 className="font-display font-semibold text-[1.1rem] text-navy mb-4">Enquire About This Property</h2>

      {submitted ? (
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
          <p className="text-[13.5px] text-green-700">Thank you — our team will contact you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-100 rounded-xl p-6">
          {error && <p className="text-red-500 text-[12.5px] mb-3">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Telephone *</label>
              <input type="tel" className="form-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Query</label>
              <textarea className="form-input resize-none" rows={1} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={`I am interested in: ${propertyTitle}`} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-gold px-8 py-3 text-[13px] disabled:opacity-60">
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : 'Submit'}
          </button>
        </form>
      )}
    </div>
  )
}
