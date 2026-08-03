'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { api, ApiError } from '@/lib/api'

function ResetPasswordForm() {
  const router = useRouter()
  const token = useSearchParams().get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) { setError('This reset link is missing its token. Please request a new one.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { token, password, confirmPassword })
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center py-4">
        <AlertCircle size={44} className="text-red-500 mx-auto mb-4" />
        <h2 className="font-display text-[1.5rem] font-semibold text-navy mb-2">Invalid reset link</h2>
        <p className="text-slate-400 text-[13px] mb-6 leading-relaxed">
          This link is missing its reset token. Please request a new password reset.
        </p>
        <Link href="/forgot-password" className="btn-primary w-full justify-center">Request New Link</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <CheckCircle size={44} className="text-green-500 mx-auto mb-4" />
        <h2 className="font-display text-[1.5rem] font-semibold text-navy mb-2">Password reset</h2>
        <p className="text-slate-400 text-[13px] mb-6 leading-relaxed">Redirecting you to login...</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="font-display text-[1.7rem] font-semibold text-navy mb-1">Set a new password</h1>
      <p className="text-slate-400 text-[13px] mb-7">Choose a strong password for your account.</p>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="crm-label">New Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="crm-input pr-10"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">Min 8 characters, with uppercase, lowercase, number, and symbol.</p>
        </div>

        <div>
          <label className="crm-label">Confirm New Password</label>
          <input
            type={showPass ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="crm-input"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center py-3 text-[13px] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Resetting...</> : 'Reset Password'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-[400px]">
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-white/10">
        <Suspense fallback={<div className="py-10 text-center text-slate-400 text-[13px]">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <p className="text-center text-[12px] text-white/30 mt-5">Easy Livin Goa CRM — Internal use only</p>
    </div>
  )
}
