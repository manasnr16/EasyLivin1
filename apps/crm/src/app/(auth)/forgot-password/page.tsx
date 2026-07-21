'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800)) // TODO Phase 3: POST /api/auth/forgot-password
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-white/10">
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle size={44} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-display text-[1.5rem] font-semibold text-navy mb-2">Check your email</h2>
            <p className="text-slate-400 text-[13px] mb-6 leading-relaxed">
              If an account exists for <strong className="text-slate-600">{email}</strong>, you'll receive a password reset link within a few minutes.
            </p>
            <Link href="/login" className="btn-primary w-full justify-center">Back to Login</Link>
          </div>
        ) : (
          <>
            <Link href="/login" className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-navy mb-5 transition-colors">
              <ArrowLeft size={13} /> Back to login
            </Link>
            <h1 className="font-display text-[1.7rem] font-semibold text-navy mb-1">Reset password</h1>
            <p className="text-slate-400 text-[13px] mb-7">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="crm-label">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="crm-input pl-9"
                    placeholder="you@easylivingoa.com"
                    disabled={loading}
                    required
                  />
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
      <p className="text-center text-[12px] text-white/30 mt-5">Easy Livin Goa CRM — Internal use only</p>
    </div>
  )
}
