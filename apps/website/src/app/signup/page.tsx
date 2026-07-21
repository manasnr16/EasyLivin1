'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)

  return (
    <>
      {/* Hero header */}
      <div className="relative pt-20 md:pt-[116px] pb-10" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e2444 100%)' }}>
        <div className="relative max-w-[1200px] mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-3 text-[12px]">
            <Link href="/" className="text-white/40 hover:text-gold transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <span className="text-gold">Create Account</span>
          </div>
          <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white mb-2">Join EasyLivin Goa</h1>
          <p className="text-white/55 text-[14px]">Create your free account and start finding the perfect property in Goa.</p>
        </div>
      </div>

      {/* Content */}
      <section className="bg-slate-50 py-14">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Left — brand panel */}
            <div className="lg:col-span-2 bg-navy rounded-2xl p-8 hidden lg:block">
              <div className="mb-6">
                <Image
                  src="/images/logo1.png"
                  alt="EasyLivin Goa"
                  width={228}
                  height={288}
                  className="object-contain h-16 w-auto"
                />
              </div>
              <h2 className="font-display text-[1.6rem] font-semibold text-white leading-tight mb-3">
                Find Your Perfect<br />Property in Goa
              </h2>
              <p className="text-white/55 text-[13.5px] leading-relaxed mb-8">
                Create a free account to save your favourite properties, get personalised
                recommendations, and connect directly with Urmilla.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Save & compare properties',
                  'Direct enquiries to Urmilla',
                  'Get new listing alerts',
                  'Access exclusive property deals',
                  'NRI investment support',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/65 text-[13px]">
                    <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold text-[10px] font-bold">✓</span>
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6">
                <p className="text-white/35 text-[12px] leading-relaxed">
                  Trusted by 1,000+ property buyers, sellers, and investors across Goa since 1998.
                </p>
              </div>
            </div>

            {/* Right — form card */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <h2 className="font-display text-[1.6rem] font-semibold text-navy mb-1">Create Account</h2>
              <p className="text-slate-400 text-[13px] mb-7">Join thousands of property seekers in Goa</p>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="form-label">Full Name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      className="form-input pl-10"
                      type="text"
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email + Phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Email Address *</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        className="form-input pl-10"
                        type="email"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        className="form-input pl-10"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>

                {/* Password + Confirm row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Password *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        className="form-input pl-10 pr-11"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        className="form-input pl-10 pr-11"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-[#b59762] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-[12.5px] text-slate-500 leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-gold font-semibold hover:text-gold-light transition-colors">
                      Terms &amp; Conditions
                    </Link>{' '}
                    and confirm I am 18 years or older
                  </span>
                </label>

                {/* Submit */}
                <button
                  className="btn-gold w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  disabled={!agreed}
                >
                  Create Account
                </button>

                {/* Divider */}
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[11px] text-slate-400 font-medium">OR CONTINUE WITH</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Google */}
                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
              </div>

              {/* Login link */}
              <p className="text-center text-[13px] text-slate-400 mt-7 pt-6 border-t border-slate-100">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-gold hover:text-gold-light transition-colors">
                  Sign In
                </Link>
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
