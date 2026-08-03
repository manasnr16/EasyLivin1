'use client'

import useSWR from 'swr'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import {
  Building2, Users, Clock, ArrowUpRight,
  CheckCircle, AlertCircle, Eye, UserPlus, Upload,
  TrendingUp, MessageSquare, PhoneCall, FileText, UserCog,
} from 'lucide-react'
import {
  formatPrice, formatDate, STAGE_LABELS, SOURCE_LABELS, SOURCE_COLOURS, STAGE_BADGE, ALL_STAGES,
} from '@/lib/data'
import { fetcher } from '@/lib/api'
import { adaptLead, type ApiLead } from '@/lib/adapters'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import Link from 'next/link'
import clsx from 'clsx'

interface LeadStats {
  byStage: { stage: string; _count: number }[]
  bySource: { source: string; _count: number }[]
  total: number
  thisWeek: number
}

interface PropertyStats {
  byStatus: { status: string; _count: number }[]
  total: number
}

interface RecentActivityItem {
  id: string
  type: string
  text: string
  createdAt: string
  user: string
}

const ACTIVITY_ICON: Record<string, React.ElementType> = {
  stage_change: TrendingUp,
  assignment: UserCog,
  call: PhoneCall,
  note: MessageSquare,
  whatsapp: MessageSquare,
  email: MessageSquare,
  site_visit: Clock,
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()

  const { data: leadStats } = useSWR<LeadStats>(user ? '/api/leads/stats' : null, fetcher)
  const { data: propertyStats } = useSWR<PropertyStats>(user ? '/api/properties/stats' : null, fetcher)
  const { data: recentLeadsRaw } = useSWR<ApiLead[]>(user ? '/api/leads?limit=5' : null, fetcher)
  const { data: recentActivity } = useSWR<RecentActivityItem[]>(user ? '/api/leads/activity/recent?limit=6' : null, fetcher)

  if (!user) return null

  const recentLeads = (recentLeadsRaw ?? []).map(adaptLead)

  const totalProperties = propertyStats?.total ?? 0
  const publishedCount = propertyStats?.byStatus.find((s) => s.status === 'PUBLISHED')?._count ?? 0
  const pendingCount = propertyStats?.byStatus.find((s) => s.status === 'PENDING_APPROVAL')?._count ?? 0

  const totalLeads = leadStats?.total ?? 0
  const newThisWeek = leadStats?.thisWeek ?? 0
  const wonCount = leadStats?.byStage.find((s) => s.stage === 'CLOSED_WON')?._count ?? 0
  const lostCount = leadStats?.byStage.find((s) => s.stage === 'CLOSED_LOST')?._count ?? 0

  const stageData = ALL_STAGES.map((stage) => ({
    stage,
    count: leadStats?.byStage.find((s) => s.stage === stage)?._count ?? 0,
  })).filter((s) => s.count > 0)

  const sourceData = (leadStats?.bySource ?? [])
    .filter((s) => s._count > 0)
    .map((s) => ({
      source: SOURCE_LABELS[s.source] ?? s.source,
      count: s._count,
      fill: SOURCE_COLOURS[s.source] ?? '#94a3b8',
    }))

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title={`Good morning, ${user.firstName} 👋`}
        subtitle={isAdmin ? 'Here\'s what\'s happening across your team today.' : 'Here\'s your activity summary.'}
      />

      <div className="flex-1 p-6 space-y-6">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-400">Total Properties</span>
              <div className="w-8 h-8 bg-navy/8 rounded-lg flex items-center justify-center">
                <Building2 size={15} className="text-navy" />
              </div>
            </div>
            <div className="font-display text-[2rem] font-bold text-navy leading-none">{totalProperties}</div>
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="text-green-600 font-medium flex items-center gap-0.5"><ArrowUpRight size={12} /> {publishedCount} published</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-400">Pending Approval</span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock size={15} className="text-amber-600" />
              </div>
            </div>
            <div className="font-display text-[2rem] font-bold text-amber-600 leading-none">{pendingCount}</div>
            {pendingCount > 0 && (
              <Link href="/properties?status=PENDING_APPROVAL" className="text-[12px] text-amber-600 hover:underline">
                Review now →
              </Link>
            )}
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-400">Total Leads</span>
              <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
                <Users size={15} className="text-gold" />
              </div>
            </div>
            <div className="font-display text-[2rem] font-bold text-navy leading-none">{totalLeads}</div>
            <div className="text-[12px] text-slate-400">{newThisWeek} new this week</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-400">Closed Won</span>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle size={15} className="text-green-600" />
              </div>
            </div>
            <div className="font-display text-[2rem] font-bold text-green-600 leading-none">{wonCount}</div>
            <div className="text-[12px] text-slate-400">{lostCount} lost</div>
          </div>
        </div>

        {/* ── Pending approval alert (admin only) ── */}
        {isAdmin && pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-amber-800">
                  {pendingCount} {pendingCount === 1 ? 'property' : 'properties'} waiting for your approval
                </p>
              </div>
            </div>
            <Link href="/properties?status=PENDING_APPROVAL" className="btn-primary flex-shrink-0 text-[11px] py-2 px-4">
              Review
            </Link>
          </div>
        )}

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pipeline chart */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-[14px] font-semibold text-navy mb-4">Lead Pipeline</h2>
            {stageData.length === 0 ? (
              <p className="text-[13px] text-slate-400 py-16 text-center">No active leads yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stageData} barSize={32} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => STAGE_LABELS[v] ?? v}
                    width={130}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={(v: number) => [v, 'Leads']}
                    labelFormatter={(l) => STAGE_LABELS[l as string] ?? l}
                  />
                  <Bar dataKey="count" fill="#b59762" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Source pie chart */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-[14px] font-semibold text-navy mb-4">Leads by Source</h2>
            {sourceData.length === 0 ? (
              <p className="text-[13px] text-slate-400 py-16 text-center">No leads yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="count"
                    nameKey="source"
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {sourceData.map((entry) => (
                      <Cell key={entry.source} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Recent leads + activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent leads */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-semibold text-navy">Recent Leads</h2>
              <Link href="/leads" className="text-[12px] font-semibold text-gold hover:underline">View all →</Link>
            </div>
            {recentLeads.length === 0 ? (
              <p className="text-[13px] text-slate-400 py-10 text-center">No leads yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="pl-5">Lead</th>
                    <th>Source</th>
                    <th>Stage</th>
                    <th className="pr-5">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="pl-5">
                        <Link href={`/leads/${lead.id}`} className="hover:text-navy font-medium">{lead.name}</Link>
                        <p className="text-[11px] text-slate-400">{lead.phone}</p>
                      </td>
                      <td>
                        <span className="text-[12px]">{SOURCE_LABELS[lead.source] ?? lead.source}</span>
                      </td>
                      <td>
                        <span className={clsx('badge', STAGE_BADGE[lead.stage])}>
                          {STAGE_LABELS[lead.stage]}
                        </span>
                      </td>
                      <td className="pr-5 font-medium">{formatPrice(lead.budget)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-semibold text-navy">Recent Activity</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {(!recentActivity || recentActivity.length === 0) && (
                <p className="text-[13px] text-slate-400 py-10 text-center">No activity yet.</p>
              )}
              {recentActivity?.map((item) => {
                const Icon = ACTIVITY_ICON[item.type] ?? FileText
                return (
                  <div key={item.id} className="flex gap-3 px-5 py-3.5">
                    <div className="mt-0.5 flex-shrink-0 text-gold">
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-[12.5px] text-slate-700 leading-snug">{item.text}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.user} · {formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-[14px] font-semibold text-navy mb-4">Quick Actions</h2>
          <div className="flex gap-3 flex-wrap">
            <Link href="/properties/new" className="btn-primary">
              <Building2 size={14} /> Add Property
            </Link>
            <Link href="/leads" className="btn-secondary">
              <UserPlus size={14} /> Add Lead
            </Link>
            {isAdmin && (
              <Link href="/upload" className="btn-secondary">
                <Upload size={14} /> Bulk Upload
              </Link>
            )}
            <Link href="/properties" className="btn-secondary">
              <Eye size={14} /> View All Properties
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
