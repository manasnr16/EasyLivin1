'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { submitEnquiry } from '@/lib/api'

interface EnquiryModalProps {
  open: boolean
  onClose: () => void
  propertyTitle?: string
  propertyId?: string
}

const EMPTY_FORM = { name: '', phone: '', email: '', message: '' }

export default function EnquiryModal({ open, onClose, propertyTitle, propertyId }: EnquiryModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM)
      setSubmitted(false)
      setError('')
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and mobile number are required')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await submitEnquiry({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        message: form.message || (propertyTitle ? `I am interested in: ${propertyTitle}` : undefined),
        propertyId,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[2000] bg-navy-deep/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X size={15} />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h3 className="font-display text-[1.3rem] font-semibold text-navy mb-1">Thank you!</h3>
            <p className="text-slate-400 text-[13px]">Our team will contact you shortly.</p>
          </div>
        ) : (
          <>
            <h3 className="font-display text-[1.5rem] font-semibold text-navy mb-1">Enquire Now</h3>
            <p className="text-slate-400 text-[13px] mb-6">
              {propertyTitle
                ? `Enquiring about: ${propertyTitle}`
                : "Send us your details and Urmilla will call you back within 24 hours."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <p className="text-red-500 text-[12px]">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Name *</label>
                  <input className="form-input" type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Mobile *</label>
                  <input className="form-input" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Message</label>
                <textarea
                  className="form-input resize-none"
                  rows={3}
                  placeholder="Tell us what you are looking for..."
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full justify-center py-3.5 text-[13px] disabled:opacity-60"
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : 'Send Enquiry'}
              </button>
              <p className="text-center text-[11px] text-slate-400">
                We&apos;ll respond within 24 hours ·{' '}
                <a href="tel:+918888806964" className="text-gold hover:underline">
                  +91 88888 06964
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
