'use client'

import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import {
  Building2, Users, TrendingUp, Clock, ArrowUpRight,
  CheckCircle, AlertCircle, Eye, UserPlus, Upload,
} from 'lucide-react'
import {
  MOCK_DASHBOARD, MOCK_LEADS, MOCK_PROPERTIES,
  getLeadsForUser, getPropertiesForUser,
  formatPrice, formatDate, STAGE_LABELS, STAGE_BADGE, SOURCE_COLOURS,
} from '@/lib/data'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import Link from 'next/link'
import clsx from 'clsx'

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  if (!user) return null

  const leads = getLeadsForUser(user.id, isAdmin)
  const properties = getPropertiesForUser(user.id, isAdmin)
  const stats = MOCK_DASHBOARD

  const stageData = stats.leadsByStage.filter((s) => s.count > 0)
  const sourceData = stats.leadsBySource.map((s) => ({
    ...s,
    fill: SOURCE_COLOURS[s.source] ?? '#94a3b8',
  }))

  const pendingProperties = properties.filter((p) => p.status === 'PENDING_APPROVAL')
  const publishedProperties = properties.filter((p) => p.status === 'PUBLISHED')

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
            <div className="font-display text-[2rem] font-bold text-navy leading-none">{properties.length}</div>
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="text-green-600 font-medium flex items-center gap-0.5"><ArrowUpRight size={12} /> {publishedProperties.length} published</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-400">Pending Approval</span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock size={15} className="text-amber-600" />
              </div>
            </div>
            <div className="font-display text-[2rem] font-bold text-amber-600 leading-none">{pendingProperties.length}</div>
            {pendingProperties.length > 0 && (
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
            <div className="font-display text-[2rem] font-bold text-navy leading-none">{leads.length}</div>
            <div className="text-[12px] text-slate-400">{stats.newLeadsThisWeek} new this week</div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-400">Closed Won</span>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle size={15} className="text-green-600" />
              </div>
            </div>
            <div className="font-display text-[2rem] font-bold text-green-600 leading-none">
              {leads.filter((l) => l.stage === 'CLOSED_WON').length}
            </div>
            <div className="text-[12px] text-slate-400">
              {leads.filter((l) => l.stage === 'CLOSED_LOST').length} lost
            </div>
          </div>
        </div>

        {/* ── Pending approval alert (admin only) ── */}
        {isAdmin && pendingProperties.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-amber-800">
                  {pendingProperties.length} {pendingProperties.length === 1 ? 'property' : 'properties'} waiting for your approval
                </p>
                <p className="text-[12px] text-amber-600 mt-0.5">
                  {pendingProperties.map((p) => p.title).join(' · ')}
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
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stageData} barSize={32} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
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
          </div>

          {/* Source pie chart */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-[14px] font-semibold text-navy mb-4">Leads by Source</h2>
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
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id}>
                    <td className="pl-5">
                      <Link href={`/leads/${lead.id}`} className="hover:text-navy font-medium">{lead.name}</Link>
                      <p className="text-[11px] text-slate-400">{lead.phone}</p>
                    </td>
                    <td>
                      <span className="text-[12px]">{lead.source}</span>
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
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-semibold text-navy">Recent Activity</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {stats.recentActivity.map((item, i) => {
                const Icon = item.type === 'won' ? CheckCircle : item.type === 'lead' ? UserPlus : item.type === 'upload' ? Upload : TrendingUp
                const iconCls = item.type === 'won' ? 'text-green-500' : item.type === 'lead' ? 'text-blue-500' : item.type === 'upload' ? 'text-violet-500' : 'text-gold'
                return (
                  <div key={i} className="flex gap-3 px-5 py-3.5">
                    <div className={clsx('mt-0.5 flex-shrink-0', iconCls)}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-[12.5px] text-slate-700 leading-snug">{item.text}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.time}</p>
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
