'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import {
  ArrowLeft, Phone, Mail, MapPin, MessageSquare,
  TrendingUp, Calendar, UserCog, FileText, PhoneCall,
} from 'lucide-react'
import {
  formatPrice, formatDate, STAGE_LABELS, STAGE_BADGE, ALL_STAGES,
} from '@/lib/data'
import { api, fetcher, ApiError } from '@/lib/api'
import { adaptLead, adaptProperty, type ApiLead, type ApiProperty } from '@/lib/adapters'
import type { LeadStage, User as UserType } from '@/types'
import clsx from 'clsx'

const ACTIVITY_ICON: Record<string, React.ElementType> = {
  stage_change: TrendingUp,
  assignment: UserCog,
  call: PhoneCall,
  note: MessageSquare,
  whatsapp: MessageSquare,
  email: Mail,
  site_visit: Calendar,
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const { user, isAdmin } = useAuth()
  const [note, setNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [changingStage, setChangingStage] = useState(false)
  const [reassigning, setReassigning] = useState(false)

  const { data: apiLead, error, isLoading, mutate } = useSWR<ApiLead>(user ? `/api/leads/${params.id}` : null, fetcher)
  const { data: agentList } = useSWR<UserType[]>(isAdmin ? '/api/users' : null, fetcher)
  const { data: apiProperty } = useSWR<ApiProperty>(
    apiLead?.property?.id ? `/api/properties/${apiLead.property.id}` : null,
    fetcher
  )

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Loading..." />
        <div className="flex-1 flex items-center justify-center text-slate-400 text-[13px]">Loading lead...</div>
      </div>
    )
  }

  if (error || !apiLead) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Lead Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 mb-4">This lead does not exist or you don't have access.</p>
            <Link href="/leads" className="btn-primary">Back to Leads</Link>
          </div>
        </div>
      </div>
    )
  }

  const lead = adaptLead(apiLead)
  const property = apiProperty ? adaptProperty(apiProperty) : null
  const currentStage = lead.stage

  async function handleSaveNote() {
    if (!note.trim()) return
    setSavingNote(true)
    try {
      await api.post(`/api/leads/${params.id}/activity`, { type: 'note', note })
      setNote('')
      await mutate()
    } finally {
      setSavingNote(false)
    }
  }

  async function handleStageChange(s: LeadStage) {
    setChangingStage(true)
    const previous = apiLead
    mutate(apiLead && { ...apiLead, stage: s }, { revalidate: false })
    try {
      await api.patch(`/api/leads/${params.id}`, { stage: s })
      await mutate()
    } catch {
      await mutate(previous, { revalidate: false })
    } finally {
      setChangingStage(false)
    }
  }

  async function handleReassign(agentId: string) {
    if (!agentId) return
    setReassigning(true)
    try {
      await api.patch(`/api/leads/${params.id}`, { assignedToId: agentId })
      await mutate()
    } finally {
      setReassigning(false)
    }
  }

  function logCall() {
    api.post(`/api/leads/${params.id}/activity`, { type: 'call', note: 'Called via CRM' }).then(() => mutate()).catch(() => {})
  }

  const stageIndex = ALL_STAGES.indexOf(currentStage)

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title={lead.name} subtitle={`Lead · ${lead.source} · ${formatDate(lead.createdAt)}`} />

      <div className="flex-1 p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-slate-400 mb-5">
          <Link href="/leads" className="hover:text-navy flex items-center gap-1"><ArrowLeft size={13} /> Leads</Link>
          <span>/</span>
          <span className="text-navy">{lead.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left column: lead info ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stage progress bar */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold text-navy">Pipeline Stage</h2>
                <span className={clsx('badge', STAGE_BADGE[currentStage])}>{STAGE_LABELS[currentStage]}</span>
              </div>
              <div className="flex items-center gap-0 overflow-x-auto pb-2">
                {ALL_STAGES.filter((s) => s !== 'CLOSED_LOST').map((s, i, arr) => {
                  const done = ALL_STAGES.indexOf(s) < stageIndex
                  const active = s === currentStage
                  const isLast = i === arr.length - 1
                  return (
                    <div key={s} className="flex items-center flex-shrink-0">
                      <button
                        onClick={() => handleStageChange(s)}
                        disabled={changingStage}
                        className={clsx(
                          'flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all disabled:cursor-wait',
                          active ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                        )}
                      >
                        <div className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all',
                          done ? 'bg-green-500 text-white' : active ? 'bg-gold text-navy-deep' : 'bg-slate-100 text-slate-500'
                        )}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span className={`text-[10px] text-center leading-tight max-w-[60px] ${active ? 'font-bold text-navy' : 'text-slate-400'}`}>
                          {STAGE_LABELS[s].replace(' Sched.', '')}
                        </span>
                      </button>
                      {!isLast && <div className={`w-6 h-0.5 mx-0.5 flex-shrink-0 ${done ? 'bg-green-400' : 'bg-slate-200'}`} />}
                    </div>
                  )
                })}
                {/* Lost */}
                <div className="flex items-center flex-shrink-0">
                  <div className="w-6 h-0.5 bg-slate-200" />
                  <button
                    onClick={() => handleStageChange('CLOSED_LOST')}
                    disabled={changingStage}
                    className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg disabled:cursor-wait ${currentStage === 'CLOSED_LOST' ? 'opacity-100' : 'opacity-50 hover:opacity-70'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${currentStage === 'CLOSED_LOST' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>✗</div>
                    <span className="text-[10px] text-slate-400 text-center leading-tight max-w-[50px]">Lost</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lead info card */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-[14px] font-semibold text-navy mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0"><Phone size={14} className="text-slate-500" /></div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold tracking-wide uppercase">Phone</p>
                    <a href={`tel:${lead.phone}`} onClick={logCall} className="text-[13px] font-medium text-navy hover:text-gold">{lead.phone}</a>
                  </div>
                </div>
                {lead.email && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0"><Mail size={14} className="text-slate-500" /></div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold tracking-wide uppercase">Email</p>
                      <a href={`mailto:${lead.email}`} className="text-[13px] font-medium text-navy hover:text-gold">{lead.email}</a>
                    </div>
                  </div>
                )}
                {lead.budget && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0"><TrendingUp size={14} className="text-slate-500" /></div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold tracking-wide uppercase">Budget</p>
                      <p className="text-[13px] font-medium text-navy">{formatPrice(lead.budget)}</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0"><Calendar size={14} className="text-slate-500" /></div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold tracking-wide uppercase">Lead Created</p>
                    <p className="text-[13px] font-medium text-navy">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>
              </div>
              {lead.requirementNote && (
                <div className="mt-4 bg-gold-pale border border-gold/20 rounded-lg px-4 py-3">
                  <p className="text-[11px] font-bold tracking-wide uppercase text-gold mb-1">Requirement</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{lead.requirementNote}</p>
                </div>
              )}
            </div>

            {/* Activity + notes */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-[14px] font-semibold text-navy mb-4">Activity Timeline</h2>

              {/* Add note */}
              <div className="mb-5">
                <textarea
                  className="crm-input resize-none"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note — e.g. Called client, sent property details, scheduled visit..."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={handleSaveNote} disabled={savingNote || !note.trim()} className="btn-primary text-[11px] py-2 disabled:opacity-50">
                    {savingNote ? 'Saving...' : 'Add Note'}
                  </button>
                  <button onClick={logCall} className="btn-secondary text-[11px] py-2"><Phone size={12} /> Log Call</button>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {(!lead.activities || lead.activities.length === 0) && (
                  <p className="text-[12px] text-slate-400">No activity yet.</p>
                )}
                {lead.activities?.map((activity) => {
                  const Icon = ACTIVITY_ICON[activity.type] ?? FileText
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className={clsx(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                        activity.type === 'stage_change' ? 'bg-violet-100' : activity.type === 'call' ? 'bg-green-50' : 'bg-blue-50'
                      )}>
                        <Icon size={13} className={clsx(
                          activity.type === 'stage_change' ? 'text-violet-600' : activity.type === 'call' ? 'text-green-600' : 'text-blue-500'
                        )} />
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-semibold text-slate-700">
                            {activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System'}
                          </span>
                          <span className="text-[11px] text-slate-400">{formatDate(activity.createdAt)}</span>
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed">{activity.note}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="text-[13px] font-semibold text-navy mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <a href={`tel:${lead.phone}`} onClick={logCall} className="btn-primary w-full justify-center text-[12px] py-2.5"><Phone size={13} /> Call Now</a>
                {lead.email && <a href={`mailto:${lead.email}`} className="btn-secondary w-full justify-center text-[12px] py-2.5"><Mail size={13} /> Send Email</a>}
                <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener" className="btn-secondary w-full justify-center text-[12px] py-2.5"><MessageSquare size={13} /> WhatsApp</a>
              </div>
            </div>

            {/* Assigned agent */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="text-[13px] font-semibold text-navy mb-3">Assigned Agent</h3>
              {lead.assignedTo ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center text-navy text-[12px] font-bold">
                    {lead.assignedTo.firstName[0]}{lead.assignedTo.lastName[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-navy">{lead.assignedTo.firstName} {lead.assignedTo.lastName}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-slate-400">Not assigned</p>
              )}
              {isAdmin && (
                <div className="mt-3">
                  <select
                    className="crm-select w-full text-[12px]"
                    defaultValue={lead.assignedTo?.id ?? ''}
                    disabled={reassigning}
                    onChange={(e) => handleReassign(e.target.value)}
                  >
                    <option value="">Re-assign agent</option>
                    {(agentList ?? []).map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Interested property */}
            {property && (
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <h3 className="text-[13px] font-semibold text-navy mb-3">Interested Property</h3>
                {property.coverImage && (
                  <img src={property.coverImage} alt={property.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                )}
                <p className="text-[13px] font-semibold text-navy leading-snug mb-1">{property.title}</p>
                <p className="text-[12px] text-slate-400 flex items-center gap-1 mb-2"><MapPin size={11} /> {property.village}, Goa</p>
                <p className="text-[13px] font-bold text-gold">
                  {property.salePrice ? formatPrice(property.salePrice) : property.rentPrice ? `${formatPrice(property.rentPrice)}/mo` : '—'}
                </p>
                <Link href={`/properties/${property.id}/edit`} className="btn-secondary w-full justify-center mt-3 text-[11px] py-2">
                  View Property
                </Link>
              </div>
            )}

            {/* Source info */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="text-[13px] font-semibold text-navy mb-3">Lead Info</h3>
              <dl className="space-y-2">
                {[
                  { label: 'Source', value: lead.source },
                  { label: 'Status', value: lead.status },
                  { label: 'Created', value: formatDate(lead.createdAt) },
                  { label: 'Last Contact', value: lead.lastContactAt ? formatDate(lead.lastContactAt) : 'Never' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[12px]">
                    <dt className="text-slate-400">{label}</dt>
                    <dd className="font-medium text-slate-700">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
