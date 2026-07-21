'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import { Save, User, Lock, Bell, Plug } from 'lucide-react'
import { getInitials, TALUKAS } from '@/lib/data'
import { api, ApiError } from '@/lib/api'
import clsx from 'clsx'

type SettingsTab = 'profile' | 'password' | 'notifications' | 'integrations'

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

  // Notification prefs
  const [notifs, setNotifs] = useState({ email: true, whatsapp: false, newLead: true, approval: true, report: false })

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
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(isAdmin ? [{ id: 'integrations' as SettingsTab, label: 'Integrations', icon: Plug }] : []),
  ]

  const INTEGRATIONS = [
    { id: 'WHATSAPP', label: 'WhatsApp Business API', desc: 'Auto-capture leads from WhatsApp messages and broadcasts', status: 'DISCONNECTED', soon: false },
    { id: 'META', label: 'Facebook & Instagram', desc: 'Auto-post new properties and capture Lead Ads', status: 'DISCONNECTED', soon: false },
    { id: 'MAGICBRICKS', label: 'MagicBricks', desc: 'XML property feed + lead capture (requires paid portal account)', status: 'DISCONNECTED', soon: false },
    { id: 'ACRES_99', label: '99acres', desc: 'XML property feed + lead capture (requires paid portal account)', status: 'DISCONNECTED', soon: false },
    { id: 'LINKEDIN', label: 'LinkedIn Marketing', desc: 'Auto-post commercial/B2B listings to Company Page', status: 'DISCONNECTED', soon: true },
    { id: 'YOUTUBE', label: 'YouTube', desc: 'Auto-upload walkthrough videos via YouTube Data API', status: 'DISCONNECTED', soon: true },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Settings" subtitle="Manage your profile, password and preferences" />

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
                <p className="text-[12px] text-slate-400 capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
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

        {/* Notifications tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
            <h3 className="text-[14px] font-semibold text-navy">Notification Preferences</h3>

            <div>
              <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Delivery Channels</p>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email notifications', desc: 'Send alerts to ' + user.email },
                  { key: 'whatsapp', label: 'WhatsApp notifications', desc: 'Send alerts to your registered phone (Phase 3)' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-slate-700">{label}</p>
                      <p className="text-[11px] text-slate-400">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                      className={clsx('w-10 h-5 rounded-full transition-all relative', notifs[key as keyof typeof notifs] ? 'bg-gold' : 'bg-slate-200')}
                    >
                      <span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', notifs[key as keyof typeof notifs] ? 'left-5' : 'left-0.5')} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Notify Me When</p>
              <div className="space-y-3">
                {[
                  { key: 'newLead', label: 'New lead assigned to me', desc: 'Alert when a lead is assigned to you from any source' },
                  { key: 'approval', label: 'Property pending approval', desc: 'Admin: alert when an agent submits a property for review' },
                  { key: 'report', label: 'Weekly summary report', desc: 'Receive a weekly digest every Monday morning' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-slate-700">{label}</p>
                      <p className="text-[11px] text-slate-400">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                      className={clsx('w-10 h-5 rounded-full transition-all relative', notifs[key as keyof typeof notifs] ? 'bg-gold' : 'bg-slate-200')}
                    >
                      <span className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', notifs[key as keyof typeof notifs] ? 'left-5' : 'left-0.5')} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saved ? '✓ Saved!' : <><Save size={14} /> Save Preferences</>}
              </button>
            </div>
          </div>
        )}

        {/* Integrations tab */}
        {activeTab === 'integrations' && isAdmin && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-amber-700">
              <strong>Note:</strong> Each integration requires a paid third-party account. These cannot be activated until the client arranges the respective accounts. Status shown is from the database.
            </div>
            {INTEGRATIONS.map((integ) => (
              <div key={integ.id} className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plug size={18} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-navy">{integ.label}</p>
                  <p className="text-[12px] text-slate-400">{integ.desc}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={clsx('badge', integ.status === 'CONNECTED' ? 'badge-published' : 'badge-draft')}>
                    {integ.status}
                  </span>
                  {integ.soon ? (
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded">Coming Soon</span>
                  ) : (
                    <button className="btn-secondary text-[11px] py-1.5 px-3">Configure</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
