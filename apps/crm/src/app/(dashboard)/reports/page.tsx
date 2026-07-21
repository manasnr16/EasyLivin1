'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import { Download, TrendingUp, Users, Building2, CheckCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  MOCK_LEADS, MOCK_PROPERTIES, MOCK_AGENTS,
  formatPrice, STAGE_LABELS, SOURCE_COLOURS,
} from '@/lib/data'
import clsx from 'clsx'

const MONTHLY_LEADS = [
  { month: 'Sep', leads: 4, won: 1 }, { month: 'Oct', leads: 6, won: 2 },
  { month: 'Nov', leads: 5, won: 1 }, { month: 'Dec', leads: 8, won: 3 },
  { month: 'Jan', leads: 10, won: 2 }, { month: 'Feb', leads: 8, won: 2 },
]

const MONTHLY_PROPERTIES = [
  { month: 'Sep', added: 3, published: 2 }, { month: 'Oct', added: 5, published: 4 },
  { month: 'Nov', added: 4, published: 3 }, { month: 'Dec', added: 7, published: 6 },
  { month: 'Jan', added: 9, published: 7 }, { month: 'Feb', added: 6, published: 5 },
]

export default function ReportsPage() {
  const { user, isAdmin } = useAuth()
  const [dateRange, setDateRange] = useState('30d')

  if (!user || !isAdmin) return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Reports" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Admin access only.</p>
      </div>
    </div>
  )

  const sourceData = [
    { source: 'Website', count: 3, fill: SOURCE_COLOURS.Website },
    { source: 'WhatsApp', count: 1, fill: SOURCE_COLOURS.WhatsApp },
    { source: 'Facebook', count: 1, fill: SOURCE_COLOURS.Facebook },
    { source: 'MagicBricks', count: 1, fill: SOURCE_COLOURS.MagicBricks },
    { source: 'Referral', count: 1, fill: SOURCE_COLOURS.Referral },
    { source: 'Walk-In', count: 1, fill: SOURCE_COLOURS['Walk-In'] },
  ]

  const agentPerf = MOCK_AGENTS.map((a) => ({
    name: `${a.firstName} ${a.lastName}`,
    properties: MOCK_PROPERTIES.filter((p) => p.agent.id === a.id).length,
    leads: MOCK_LEADS.filter((l) => l.assignedTo?.id === a.id).length,
    won: MOCK_LEADS.filter((l) => l.assignedTo?.id === a.id && l.stage === 'CLOSED_WON').length,
  }))

  function exportCSV() {
    const rows = [
      ['Agent', 'Properties', 'Leads', 'Won'],
      ...agentPerf.map((a) => [a.name, a.properties, a.leads, a.won]),
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
            <p className="page-subtitle">Team performance, lead trends, and property metrics</p>
          </div>
          <div className="flex gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="crm-select w-auto">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last 1 year</option>
            </select>
            <button onClick={exportCSV} className="btn-secondary">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: MOCK_LEADS.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+18%' },
            { label: 'Properties Published', value: MOCK_PROPERTIES.filter((p) => p.status === 'PUBLISHED').length, icon: Building2, color: 'text-navy', bg: 'bg-navy/8', change: '+5%' },
            { label: 'Deals Won', value: MOCK_LEADS.filter((l) => l.stage === 'CLOSED_WON').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', change: '+25%' },
            { label: 'Conversion Rate', value: `${Math.round(MOCK_LEADS.filter((l) => l.stage === 'CLOSED_WON').length / MOCK_LEADS.length * 100)}%`, icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10', change: '+3pp' },
          ].map(({ label, value, icon: Icon, color, bg, change }) => (
            <div key={label} className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-slate-400">{label}</span>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', bg)}>
                  <Icon size={15} className={color} />
                </div>
              </div>
              <div className={clsx('font-display text-[2rem] font-bold leading-none', color)}>{value}</div>
              <div className="text-[12px] text-green-600 font-medium">{change} vs last period</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="text-[14px] font-semibold text-navy mb-4">Monthly Lead Trends</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MONTHLY_LEADS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="leads" stroke="#b59762" strokeWidth={2.5} dot={{ r: 4, fill: '#b59762' }} name="Total Leads" />
                <Line type="monotone" dataKey="won" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} name="Won" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="text-[14px] font-semibold text-navy mb-4">Leads by Source</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" nameKey="source" paddingAngle={3}>
                  {sourceData.map((entry) => <Cell key={entry.source} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="text-[14px] font-semibold text-navy mb-4">Monthly Property Activity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_PROPERTIES} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
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
                  <tr key={a.name}>
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
          </div>
        </div>

      </div>
    </div>
  )
}
