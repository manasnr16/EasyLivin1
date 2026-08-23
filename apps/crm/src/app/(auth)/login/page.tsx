'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Already logged in
  if (user) { router.push('/dashboard'); return null }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Please enter your email address'); return }
    if (!password) { setError('Please enter your password'); return }

    setLoading(true)
    const result = await login(email.trim(), password)
    setLoading(false)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error ?? 'Login failed. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-[360px]">
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/60 border border-slate-100">
        <h1 className="font-display text-[1.5rem] font-semibold text-navy">Welcome back</h1>
        <p className="text-[12.5px] text-slate-400 mt-0.5 mb-5">Sign in to continue to your dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-600">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="crm-label">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="crm-input pl-10"
                placeholder="you@easylivingoa.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="crm-label mb-0">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-gold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="crm-input pl-10 pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 text-[13px] mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-2">
            <Sparkles size={11} className="text-gold" /> Demo Credentials
          </p>
          <div className="space-y-1.5">
            {[
              { label: 'Admin (Urmilla)', email: 'admin@easylivingoa.com', pass: 'Admin@2026' },
              { label: 'Agent (Rahul)', email: 'rahul@easylivingoa.com', pass: 'Agent@123!' },
            ].map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => { setEmail(cred.email); setPassword(cred.pass); setError('') }}
                className="w-full text-left px-3 py-1.5 bg-gold-pale/60 hover:bg-gold-pale rounded-lg transition-colors border border-gold/10"
              >
                <p className="text-[12px] font-semibold text-navy">{cred.label}</p>
                <p className="text-[11px] text-slate-400">{cred.email}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-[12px] text-slate-400 mt-4">
        Easy Livin Goa CRM — Internal use only
      </p>
    </div>
  )
}
