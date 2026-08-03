'use client'

import useSWR from 'swr'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import { Download, TrendingUp, Users, Building2, CheckCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { SOURCE_LABELS, SOURCE_COLOURS } from '@/lib/data'
import { fetcher } from '@/lib/api'
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

interface MonthlyLeads { month: string; leads: number; won: number }
interface MonthlyProperties { month: string; added: number; published: number }
interface AgentPerf { id: string; name: string; properties: number; leads: number; won: number }

export default function ReportsPage() {
  const { user, isAdmin } = useAuth()

  const { data: leadStats } = useSWR<LeadStats>(isAdmin ? '/api/leads/stats' : null, fetcher)
  const { data: propertyStats } = useSWR<PropertyStats>(isAdmin ? '/api/properties/stats' : null, fetcher)
  const { data: monthlyLeads } = useSWR<MonthlyLeads[]>(isAdmin ? '/api/leads/stats/monthly' : null, fetcher)
  const { data: monthlyProperties } = useSWR<MonthlyProperties[]>(isAdmin ? '/api/properties/stats/monthly' : null, fetcher)
  const { data: agentPerf } = useSWR<AgentPerf[]>(isAdmin ? '/api/leads/stats/by-agent' : null, fetcher)

  if (!user || !isAdmin) return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Reports" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Admin access only.</p>
      </div>
    </div>
  )

  const wonCount = leadStats?.byStage.find((s) => s.stage === 'CLOSED_WON')?._count ?? 0
  const totalLeads = leadStats?.total ?? 0
  const publishedCount = propertyStats?.byStatus.find((s) => s.status === 'PUBLISHED')?._count ?? 0
  const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0

  const sourceData = (leadStats?.bySource ?? [])
    .filter((s) => s._count > 0)
    .map((s) => ({
      source: SOURCE_LABELS[s.source] ?? s.source,
      count: s._count,
      fill: SOURCE_COLOURS[s.source] ?? '#94a3b8',
    }))

  function exportCSV() {
    const rows = [
      ['Agent', 'Properties', 'Leads', 'Won'],
      ...(agentPerf ?? []).map((a) => [a.name, a.properties, a.leads, a.won]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'easyliving-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Reports" subtitle="Analytics and performance overview" />

      <div className="flex-1 p-6 space-y-5">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Analytics & Reports</h2>
            <p className="page-subtitle">Team performance, lead trends, and property metrics — last 6 months</p>
          </div>
          <button onClick={exportCSV} className="btn-secondary">
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Properties Published', value: publishedCount, icon: Building2, color: 'text-navy', bg: 'bg-navy/8' },
            { label: 'Deals Won', value: wonCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-slate-400">{label}</span>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', bg)}>
                  <Icon size={15} className={color} />
                </div>
              </div>
              <div className={clsx('font-display text-[2rem] font-bold leading-none', color)}>{value}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="text-[14px] font-semibold text-navy mb-4">Monthly Lead Trends</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyLeads ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="leads" stroke="#b59762" strokeWidth={2.5} dot={{ r: 4, fill: '#b59762' }} name="Total Leads" />
                <Line type="monotone" dataKey="won" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} name="Won" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="text-[14px] font-semibold text-navy mb-4">Leads by Source</h3>
            {sourceData.length === 0 ? (
              <p className="text-[13px] text-slate-400 py-16 text-center">No leads yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" nameKey="source" paddingAngle={3}>
                    {sourceData.map((entry) => <Cell key={entry.source} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="text-[14px] font-semibold text-navy mb-4">Monthly Property Activity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyProperties ?? []} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="added" fill="#1e2444" radius={[4, 4, 0, 0]} name="Added" />
                <Bar dataKey="published" fill="#b59762" radius={[4, 4, 0, 0]} name="Published" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Agent performance table */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="text-[14px] font-semibold text-navy mb-4">Agent Performance</h3>
            {(!agentPerf || agentPerf.length === 0) ? (
              <p className="text-[13px] text-slate-400 py-10 text-center">No agents yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Props</th>
                    <th>Leads</th>
                    <th>Won</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {agentPerf.map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium text-navy text-[13px]">{a.name}</td>
                      <td>{a.properties}</td>
                      <td>{a.leads}</td>
                      <td className="text-green-600 font-semibold">{a.won}</td>
                      <td className="text-[12px] text-slate-500">
                        {a.leads > 0 ? `${Math.round(a.won / a.leads * 100)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
