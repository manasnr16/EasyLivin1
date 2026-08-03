'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import { Save, User, Lock } from 'lucide-react'
import { getInitials, getRoleLabel, TALUKAS } from '@/lib/data'
import { api, ApiError } from '@/lib/api'
import clsx from 'clsx'

// Notifications and Integrations tabs were UI-only mockups that never
// persisted anything — removed rather than shipped half-built. Reinstate
// once notification prefs are wired to the DB and a real integration exists.
type SettingsTab = 'profile' | 'password'

export default function SettingsPage() {
  const { user, isAdmin, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Profile form state
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    locationTags: user?.locationTags ?? [],
  })

  // Password form state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')

  if (!user) return null

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      await api.put('/api/auth/me', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || undefined,
        locationTags: profile.locationTags,
      })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return }
    if (pwForm.newPw.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      await api.put('/api/auth/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
        confirmPassword: pwForm.confirm,
      })
      setSaved(true)
      setPwForm({ current: '', newPw: '', confirm: '' })
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Settings" subtitle="Manage your profile and password" />

      <div className="flex-1 p-6 max-w-[800px] mx-auto w-full">

        {/* Tab nav */}
        <div className="flex gap-0 border-b border-slate-200 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === id ? 'border-gold text-gold' : 'border-transparent text-slate-500 hover:text-navy'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-gold text-[22px] font-bold">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <div>
                <p className="font-semibold text-navy text-[15px]">{user.firstName} {user.lastName}</p>
                <p className="text-[12px] text-slate-400">{getRoleLabel(user.role)}</p>
                <p className="text-[12px] text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="crm-label">First Name</label>
                <input className="crm-input" value={profile.firstName} onChange={(e) => setProfile((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="crm-label">Last Name</label>
                <input className="crm-input" value={profile.lastName} onChange={(e) => setProfile((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="crm-label">Email Address</label>
              <input type="email" className="crm-input bg-slate-50" value={profile.email} disabled />
              <p className="text-[11px] text-slate-400 mt-1">Contact your admin to change your email address</p>
            </div>
            <div>
              <label className="crm-label">Phone Number</label>
              <input type="tel" className="crm-input" value={profile.phone} onChange={(e) => setProfile((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
            </div>

            {!isAdmin && (
              <div>
                <label className="crm-label">My Location Specialisation</label>
                <p className="text-[11px] text-slate-400 mb-2">Select the talukas you cover — leads and properties in these areas will be prioritised for you</p>
                <div className="flex flex-wrap gap-2">
                  {TALUKAS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setProfile((f) => ({
                        ...f,
                        locationTags: f.locationTags.includes(t) ? f.locationTags.filter((x) => x !== t) : [...f.locationTags, t]
                      }))}
                      className={clsx('text-[11px] px-3 py-1.5 rounded-full border transition-all',
                        profile.locationTags.includes(t) ? 'bg-gold text-navy-deep border-gold font-semibold' : 'bg-white text-slate-500 border-slate-200 hover:border-gold'
                      )}
                    >
                      {t[0] + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {saveError && <p className="text-red-500 text-[12px]">{saveError}</p>}
            <div className="flex justify-end pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : saved ? '✓ Saved!' : <><Save size={14} /> Save Profile</>}
              </button>
            </div>
          </div>
        )}

        {/* Password tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="text-[14px] font-semibold text-navy mb-5">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
              <div>
                <label className="crm-label">Current Password</label>
                <input required type="password" className="crm-input" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} placeholder="••••••••" />
              </div>
              <div>
                <label className="crm-label">New Password</label>
                <input required type="password" className="crm-input" value={pwForm.newPw} onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))} placeholder="Min 8 chars, 1 number, 1 symbol" />
              </div>
              <div>
                <label className="crm-label">Confirm New Password</label>
                <input required type="password" className="crm-input" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter new password" />
              </div>
              {pwError && <p className="text-red-500 text-[12px]">{pwError}</p>}
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
                {saving ? 'Changing...' : saved ? '✓ Password Changed!' : <><Lock size={14} /> Change Password</>}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
