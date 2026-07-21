'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import {
  UserPlus, Mail, Phone, MapPin, AlertCircle,
  CheckCircle, XCircle, User, Trash2, Loader2,
} from 'lucide-react'
import { api, fetcher, ApiError } from '@/lib/api'
import { getInitials } from '@/lib/data'
import type { User as UserType } from '@/types'
import clsx from 'clsx'

const TALUKAS = ['BARDEZ', 'PERNEM', 'BICHOLIM', 'TISWADI', 'SALCETE', 'MORMUGAO', 'QUEPEM', 'SANGUEM', 'CANACONA', 'PONDA']

interface DeleteState {
  agent: UserType
  step: 'confirm' | 'reassign'
  counts?: { propertiesOwned: number; leadsCreated: number; leadsAssigned: number; activities: number }
  reassignToId: string
  error?: string
  loading: boolean
}

export default function AgentsPage() {
  const { user, isAdmin } = useAuth()
  const { data: agents, error, isLoading, mutate } = useSWR<UserType[]>(isAdmin ? '/api/users' : null, fetcher)

  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    locationTags: [] as string[],
  })
  const [savingAgent, setSavingAgent] = useState(false)
  const [savedAgent, setSavedAgent] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null)

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Agents" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Admin access only.</p>
        </div>
      </div>
    )
  }

  async function toggleStatus(agentId: string, current: string) {
    const next = current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    setStatusUpdatingId(agentId)
    try {
      await api.patch(`/api/users/${agentId}/status`, { status: next })
      await mutate()
    } finally {
      setStatusUpdatingId(null)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegisterError('')
    setSavingAgent(true)
    try {
      await api.post('/api/auth/register', { ...registerForm, role: 'SALES_EXECUTIVE' })
      setSavingAgent(false)
      setSavedAgent(true)
      await mutate()
      setTimeout(() => {
        setSavedAgent(false)
        setShowRegisterModal(false)
        setRegisterForm({ firstName: '', lastName: '', email: '', phone: '', password: '', locationTags: [] })
      }, 1200)
    } catch (err) {
      setSavingAgent(false)
      setRegisterError(err instanceof ApiError ? err.message : 'Failed to register agent')
    }
  }

  async function handleDelete(agent: UserType, reassignToId?: string) {
    setDeleteState((s) => (s ? { ...s, loading: true, error: undefined } : s))
    try {
      await api.delete<{ mode: 'DELETED' | 'DEACTIVATED' }>(`/api/users/${agent.id}`, reassignToId ? { reassignToId } : undefined)
      setDeleteState(null)
      await mutate()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'REASSIGNMENT_REQUIRED') {
        setDeleteState({
          agent, step: 'reassign', counts: err.details as DeleteState['counts'], reassignToId: '', loading: false,
        })
        return
      }
      setDeleteState((s) => (s ? { ...s, loading: false, error: err instanceof ApiError ? err.message : 'Failed to delete agent' } : s))
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Agents" subtitle={agents ? `${agents.length} sales executives on your team` : 'Loading...'} />

      <div className="flex-1 p-6">

        <div className="page-header">
          <div>
            <h2 className="page-title">Sales Team</h2>
            <p className="page-subtitle">Manage your agents — register, assign locations, activate, suspend or delete</p>
          </div>
          <button onClick={() => setShowRegisterModal(true)} className="btn-primary">
            <UserPlus size={14} /> Register Agent
          </button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 h-[220px] animate-pulse" />
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-[13px] text-red-600 flex items-center gap-2">
            <AlertCircle size={15} /> Failed to load agents. {error instanceof ApiError ? error.message : ''}
          </div>
        )}

        {!isLoading && !error && agents && agents.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400 text-[13px]">
            No agents yet. Register your first agent to get started.
          </div>
        )}

        {/* Agent cards */}
        {!isLoading && !error && agents && agents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => {
              const status = agent.status
              const propertiesCount = agent._count?.propertiesOwned ?? 0
              const leadsCount = agent._count?.leadsAssigned ?? 0
              return (
                <div key={agent.id} className="bg-white rounded-xl border border-slate-100 p-5">
                  {/* Avatar + status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-gold font-bold text-[16px] flex-shrink-0">
                        {getInitials(agent.firstName, agent.lastName)}
                      </div>
                      <div>
                        <p className="font-semibold text-navy text-[14px]">{agent.firstName} {agent.lastName}</p>
                        <p className="text-[11px] text-slate-400 capitalize">{agent.role.replace('_', ' ').toLowerCase()}</p>
                      </div>
                    </div>
                    <span className={clsx('badge text-[10px]', status === 'ACTIVE' ? 'badge-published' : 'badge-lost')}>
                      {status}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-[12px] text-slate-500 flex items-center gap-2">
                      <Mail size={11} className="text-slate-400 flex-shrink-0" /> <span className="truncate">{agent.email}</span>
                    </p>
                    {agent.phone && (
                      <p className="text-[12px] text-slate-500 flex items-center gap-2">
                        <Phone size={11} className="text-slate-400 flex-shrink-0" /> {agent.phone}
                      </p>
                    )}
                    {agent.locationTags && agent.locationTags.length > 0 && (
                      <p className="text-[12px] text-slate-500 flex items-start gap-2">
                        <MapPin size={11} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-tight">{agent.locationTags.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 rounded-lg p-3">
                    <div className="text-center">
                      <p className="font-display text-[1.3rem] font-bold text-navy">{propertiesCount}</p>
                      <p className="text-[10px] text-slate-400">Properties</p>
                    </div>
                    <div className="text-center border-l border-slate-200">
                      <p className="font-display text-[1.3rem] font-bold text-navy">{leadsCount}</p>
                      <p className="text-[10px] text-slate-400">Leads</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(agent.id, status)}
                      disabled={statusUpdatingId === agent.id}
                      className={clsx(
                        'flex-1 justify-center text-[11px] py-2 inline-flex items-center gap-1.5 rounded-lg border font-semibold transition-all disabled:opacity-60',
                        status === 'ACTIVE'
                          ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                      )}
                    >
                      {statusUpdatingId === agent.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : status === 'ACTIVE' ? (
                        <><XCircle size={12} /> Suspend</>
                      ) : (
                        <><CheckCircle size={12} /> Activate</>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteState({ agent, step: 'confirm', reassignToId: '', loading: false })}
                      className="justify-center text-[11px] py-2 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                      title="Delete agent"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Register agent modal */}
        {showRegisterModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowRegisterModal(false)}
          >
            <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="font-display text-[1.4rem] font-semibold text-navy mb-1">Register New Agent</h3>
              <p className="text-[12px] text-slate-400 mb-6">The agent can log in immediately with these credentials.</p>

              {registerError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
                  <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-600">{registerError}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="crm-label">First Name *</label>
                    <input required className="crm-input" value={registerForm.firstName} onChange={(e) => setRegisterForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
                  </div>
                  <div>
                    <label className="crm-label">Last Name *</label>
                    <input required className="crm-input" value={registerForm.lastName} onChange={(e) => setRegisterForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <label className="crm-label">Email *</label>
                  <input required type="email" className="crm-input" value={registerForm.email} onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))} placeholder="agent@easylivingoa.com" />
                </div>
                <div>
                  <label className="crm-label">Phone *</label>
                  <input required type="tel" className="crm-input" value={registerForm.phone} onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="crm-label">Temporary Password *</label>
                  <input required type="password" className="crm-input" value={registerForm.password} onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 chars, upper, lower, number, symbol" />
                </div>
                <div>
                  <label className="crm-label">Location Specialisation</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {TALUKAS.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setRegisterForm((f) => ({
                          ...f,
                          locationTags: f.locationTags.includes(t) ? f.locationTags.filter((x) => x !== t) : [...f.locationTags, t]
                        }))}
                        className={clsx('text-[11px] px-2.5 py-1 rounded-full border transition-all', registerForm.locationTags.includes(t) ? 'bg-gold text-navy-deep border-gold font-semibold' : 'bg-white text-slate-500 border-slate-200 hover:border-gold')}
                      >
                        {t[0] + t.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button type="submit" disabled={savingAgent} className="btn-primary flex-1 justify-center disabled:opacity-60">
                    {savingAgent ? 'Registering...' : savedAgent ? '✓ Registered!' : 'Register Agent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete / reassign modal */}
        {deleteState && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteState(null)}
          >
            <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl">
              {deleteState.step === 'confirm' ? (
                <>
                  <h3 className="font-display text-[1.3rem] font-semibold text-navy mb-2">Delete {deleteState.agent.firstName} {deleteState.agent.lastName}?</h3>
                  <p className="text-[13px] text-slate-500 mb-6">If this agent has no properties or leads, they'll be deleted permanently. Otherwise you'll be asked to reassign their work first.</p>
                  {deleteState.error && <p className="text-red-500 text-[12px] mb-4">{deleteState.error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteState(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                    <button
                      onClick={() => handleDelete(deleteState.agent)}
                      disabled={deleteState.loading}
                      className="flex-1 justify-center inline-flex items-center gap-1.5 rounded-lg bg-red-500 text-white font-semibold text-[13px] py-2.5 hover:bg-red-600 disabled:opacity-60"
                    >
                      {deleteState.loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-display text-[1.3rem] font-semibold text-navy mb-2">Reassign before deleting</h3>
                  <p className="text-[13px] text-slate-500 mb-4">
                    {deleteState.agent.firstName} has {deleteState.counts?.propertiesOwned ?? 0} properties, {deleteState.counts?.leadsCreated ?? 0} created leads and {deleteState.counts?.leadsAssigned ?? 0} assigned leads. Choose who should take these over — {deleteState.agent.firstName} will be deactivated, not deleted.
                  </p>
                  <label className="crm-label">Reassign to</label>
                  <select
                    className="crm-select mb-4"
                    value={deleteState.reassignToId}
                    onChange={(e) => setDeleteState((s) => (s ? { ...s, reassignToId: e.target.value } : s))}
                  >
                    <option value="">Select a user</option>
                    {agents?.filter((a) => a.id !== deleteState.agent.id && a.status === 'ACTIVE').map((a) => (
                      <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
                    ))}
                  </select>
                  {deleteState.error && <p className="text-red-500 text-[12px] mb-4">{deleteState.error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteState(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                    <button
                      onClick={() => deleteState.reassignToId && handleDelete(deleteState.agent, deleteState.reassignToId)}
                      disabled={deleteState.loading || !deleteState.reassignToId}
                      className="btn-primary flex-1 justify-center disabled:opacity-60"
                    >
                      {deleteState.loading ? <Loader2 size={13} className="animate-spin" /> : 'Reassign & Deactivate'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
