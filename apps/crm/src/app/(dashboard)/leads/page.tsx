'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import {
  Search, Phone, Mail, MessageSquare, User,
  ChevronDown, AlertCircle,
} from 'lucide-react'
import {
  formatPrice, formatDate, STAGE_LABELS, STAGE_BADGE,
} from '@/lib/data'
import { api, fetcher, ApiError } from '@/lib/api'
import { adaptLead, type ApiLead } from '@/lib/adapters'
import type { Lead, LeadStage, User as UserType } from '@/types'
import clsx from 'clsx'

const ALL_STAGES: LeadStage[] = [
  'NEW', 'CONTACTED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_DONE',
  'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST',
]

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: 'Website', WHATSAPP: 'WhatsApp', FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram', MAGICBRICKS: 'MagicBricks',
  ACRES_99: '99acres', REFERRAL: 'Referral', WALK_IN: 'Walk-In', OTHER: 'Other',
}

export default function LeadsPage() {
  const { user, isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [addNoteLeadId, setAddNoteLeadId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const { data: apiLeads, error, isLoading, mutate } = useSWR<ApiLead[]>(user ? '/api/leads' : null, fetcher)
  const { data: agentList } = useSWR<UserType[]>(isAdmin ? '/api/users' : null, fetcher)

  if (!user) return null
  const allLeads: Lead[] = (apiLeads ?? []).map(adaptLead)

  const filtered = allLeads.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch = !search || l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.email?.toLowerCase().includes(q) ?? false)
    const matchStage = stageFilter === 'all' || l.stage === stageFilter
    const matchSource = sourceFilter === 'all' || l.source === sourceFilter
    const matchAgent = agentFilter === 'all' || l.assignedTo?.id === agentFilter
    return matchSearch && matchStage && matchSource && matchAgent
  })

  async function handleStageChange(leadId: string, stage: LeadStage) {
    await api.patch(`/api/leads/${leadId}`, { stage })
    await mutate()
  }

  async function handleAddNote(leadId: string) {
    if (!noteText.trim()) return
    setSavingNote(true)
    try {
      await api.post(`/api/leads/${leadId}/activity`, { type: 'note', note: noteText })
      setAddNoteLeadId(null)
      setNoteText('')
      await mutate()
    } finally {
      setSavingNote(false)
    }
  }

  async function logCall(leadId: string) {
    api.post(`/api/leads/${leadId}/activity`, { type: 'call', note: 'Called via CRM' }).then(() => mutate()).catch(() => {})
  }

  const wonCount = allLeads.filter((l) => l.stage === 'CLOSED_WON').length
  const newCount = allLeads.filter((l) => l.stage === 'NEW').length

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Leads"
        subtitle={isAdmin ? `${allLeads.length} total leads across all agents` : `${allLeads.length} leads assigned to you`}
      />

      <div className="flex-1 p-6">

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total', value: allLeads.length, color: 'text-navy' },
            { label: 'New', value: newCount, color: 'text-blue-600' },
            { label: 'In Progress', value: allLeads.filter((l) => ['CONTACTED','SITE_VISIT_SCHEDULED','SITE_VISIT_DONE','NEGOTIATION'].includes(l.stage)).length, color: 'text-amber-600' },
            { label: 'Won', value: wonCount, color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="stat-card py-3">
              <span className="text-[12px] text-slate-400">{s.label}</span>
              <span className={`font-display text-[1.7rem] font-bold leading-none ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Lead Pipeline</h2>
            <p className="page-subtitle">{filtered.length} leads shown</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-5 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400 w-full"
            />
          </div>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="crm-select w-auto min-w-[170px]">
            <option value="all">All Stages</option>
            {ALL_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="crm-select w-auto min-w-[140px]">
            <option value="all">All Sources</option>
            {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {isAdmin && (
            <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="crm-select w-auto min-w-[150px]">
              <option value="all">All Agents</option>
              {(agentList ?? []).map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
            </select>
          )}
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400 text-[13px]">Loading leads...</div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-[13px] text-red-600 flex items-center gap-2">
            <AlertCircle size={15} /> Failed to load leads. {error instanceof ApiError ? error.message : ''}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="pl-5">Lead</th>
                      <th>Source</th>
                      <th>Stage</th>
                      <th>Budget</th>
                      <th>Property Interest</th>
                      {isAdmin && <th>Agent</th>}
                      <th>Last Contact</th>
                      <th className="pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={isAdmin ? 8 : 7} className="pl-5 py-12 text-center text-slate-400 text-[13px]">
                          No leads match your filters.
                        </td>
                      </tr>
                    )}
                    {filtered.map((lead) => (
                      <tr key={lead.id}>
                        <td className="pl-5">
                          <Link href={`/leads/${lead.id}`} className="font-semibold text-navy hover:text-gold transition-colors text-[13px]">
                            {lead.name}
                          </Link>
                          <p className="text-[11px] text-slate-400 mt-0.5">{lead.phone}</p>
                          {lead.email && <p className="text-[11px] text-slate-400">{lead.email}</p>}
                        </td>
                        <td>
                          <span className="text-[12px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {SOURCE_LABELS[lead.source] ?? lead.source}
                          </span>
                        </td>
                        <td>
                          <div className="relative group">
                            <span className={clsx('badge cursor-pointer', STAGE_BADGE[lead.stage])}>
                              {STAGE_LABELS[lead.stage]}
                              <ChevronDown size={10} className="ml-0.5" />
                            </span>
                            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-10 hidden group-hover:block">
                              {ALL_STAGES.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleStageChange(lead.id, s)}
                                  className={`w-full text-left px-3 py-2 text-[12px] hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${lead.stage === s ? 'font-bold text-navy' : 'text-slate-600'}`}
                                >
                                  {STAGE_LABELS[s]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="font-medium text-[13px]">{formatPrice(lead.budget)}</td>
                        <td className="text-[12px] text-slate-500 max-w-[160px]">
                          <span className="line-clamp-1">{lead.propertyTitle ?? lead.requirementNote ?? '—'}</span>
                        </td>
                        {isAdmin && (
                          <td className="text-[12px] text-slate-500">
                            {lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : '—'}
                          </td>
                        )}
                        <td className="text-[12px] text-slate-400">
                          {lead.lastContactAt ? formatDate(lead.lastContactAt) : 'Not contacted'}
                        </td>
                        <td className="pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <a href={`tel:${lead.phone}`} onClick={() => logCall(lead.id)} className="btn-icon" title="Call">
                              <Phone size={13} />
                            </a>
                            {lead.email && (
                              <a href={`mailto:${lead.email}`} className="btn-icon" title="Email">
                                <Mail size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => { setAddNoteLeadId(lead.id); setNoteText('') }}
                              className="btn-icon"
                              title="Add note"
                            >
                              <MessageSquare size={13} />
                            </button>
                            <Link href={`/leads/${lead.id}`} className="btn-icon" title="View detail">
                              <User size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {filtered.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400 text-[13px]">
                  No leads match your filters.
                </div>
              )}
              {filtered.map((lead) => (
                <div key={lead.id} className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link href={`/leads/${lead.id}`} className="font-semibold text-navy text-[14px]">{lead.name}</Link>
                      <p className="text-[12px] text-slate-400">{lead.phone}</p>
                    </div>
                    <span className={clsx('badge text-[10px]', STAGE_BADGE[lead.stage])}>{STAGE_LABELS[lead.stage]}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-slate-500 mb-3">
                    <span>{SOURCE_LABELS[lead.source] ?? lead.source}</span>
                    <span className="font-medium">{formatPrice(lead.budget)}</span>
                  </div>
                  {isAdmin && lead.assignedTo && (
                    <p className="text-[11px] text-slate-400 mb-3">Agent: {lead.assignedTo.firstName} {lead.assignedTo.lastName}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <a href={`tel:${lead.phone}`} onClick={() => logCall(lead.id)} className="btn-secondary flex-1 justify-center text-[11px] py-2"><Phone size={12} /> Call</a>
                    <Link href={`/leads/${lead.id}`} className="btn-secondary flex-1 justify-center text-[11px] py-2"><User size={12} /> View</Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Quick note modal */}
        {addNoteLeadId && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setAddNoteLeadId(null)}
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-display text-[1.2rem] font-semibold text-navy mb-1">Add Activity Note</h3>
              <p className="text-[12px] text-slate-400 mb-4">
                Lead: <strong className="text-slate-600">{allLeads.find((l) => l.id === addNoteLeadId)?.name}</strong>
              </p>
              <textarea
                autoFocus
                className="crm-input resize-none mb-4"
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Called — client confirmed site visit for Saturday 10am"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setAddNoteLeadId(null)} className="btn-secondary">Cancel</button>
                <button onClick={() => handleAddNote(addNoteLeadId)} disabled={savingNote} className="btn-primary disabled:opacity-60">
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
