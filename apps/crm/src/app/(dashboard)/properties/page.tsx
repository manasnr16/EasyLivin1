'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Topbar from '@/components/layout/Topbar'
import {
  Plus, Search, Edit2, Trash2, Building2, MapPin, AlertCircle,
} from 'lucide-react'
import { formatPrice, formatDate, STATUS_BADGE } from '@/lib/data'
import { api, fetcher, ApiError } from '@/lib/api'
import { adaptProperty, type ApiProperty } from '@/lib/adapters'
import type { PropertyStatus } from '@/types'
import { PROPERTY_TYPES } from '@easyliving/shared'
import clsx from 'clsx'

const STATUS_LABELS: Record<PropertyStatus, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  PUBLISHED: 'Published',
  UNDER_NEGOTIATION: 'Under Negotiation',
  ARCHIVED: 'Archived',
  SOLD: 'Sold',
  RENTED: 'Rented',
}

const PROPERTY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPES.map((t) => [t.value, t.label])
)

export default function PropertiesPage() {
  const { user, isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: apiProperties, error, isLoading, mutate } = useSWR<ApiProperty[]>(user ? '/api/properties' : null, fetcher)

  if (!user) return null
  const allProperties = (apiProperties ?? []).map(adaptProperty)

  const filtered = allProperties.filter((p) => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.village.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesType = typeFilter === 'all' || p.propertyType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this property?')) return
    setDeletingId(id)
    try {
      await api.delete(`/api/properties/${id}`)
      await mutate()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Properties"
        subtitle={isAdmin ? `${allProperties.length} total · manage all listings` : `${allProperties.length} assigned to you`}
      />

      <div className="flex-1 p-6">

        {/* Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Property Listings</h2>
            <p className="page-subtitle">
              {isAdmin ? 'All properties across all agents' : 'Properties assigned to you'}
            </p>
          </div>
          <Link href="/properties/new" className="btn-primary">
            <Plus size={15} /> Add Property
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or village..."
              className="bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400 w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="crm-select w-auto min-w-[160px]"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="crm-select w-auto min-w-[140px]"
          >
            <option value="all">All Types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <span className="text-[12px] text-slate-400 ml-auto">
            {filtered.length} of {allProperties.length} properties
          </span>
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-slate-400 text-[13px]">Loading properties...</div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-[13px] text-red-600 flex items-center gap-2">
            <AlertCircle size={15} /> Failed to load properties. {error instanceof ApiError ? error.message : ''}
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
                      <th className="pl-5 w-[40%]">Property</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      {isAdmin && <th>Agent</th>}
                      <th>Views</th>
                      <th>Added</th>
                      <th className="pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={isAdmin ? 8 : 7} className="pl-5 py-12 text-center text-slate-400 text-[13px]">
                          No properties match your filters.
                        </td>
                      </tr>
                    )}
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td className="pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              {p.coverImage ? (
                                <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Building2 size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <Link href={`/properties/${p.id}/edit`} className="font-semibold text-navy hover:text-gold transition-colors text-[13px] leading-snug line-clamp-1">
                                {p.title}
                              </Link>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {p.village}, {p.region === 'NORTH_GOA' ? 'North' : 'South'} Goa
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-[12px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {PROPERTY_TYPE_LABELS[p.propertyType] ?? p.propertyType}
                          </span>
                        </td>
                        <td className="font-semibold text-[13px]">
                          {p.salePrice ? formatPrice(p.salePrice) : p.rentPrice ? `${formatPrice(p.rentPrice)}/mo` : '—'}
                        </td>
                        <td>
                          <span className={clsx('badge', STATUS_BADGE[p.status])}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="text-[12px] text-slate-500">
                            {p.agent.firstName} {p.agent.lastName}
                          </td>
                        )}
                        <td className="text-[12px] text-slate-500">{p.viewCount}</td>
                        <td className="text-[12px] text-slate-400">{formatDate(p.createdAt)}</td>
                        <td className="pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/properties/${p.id}/edit`} className="btn-icon">
                              <Edit2 size={14} />
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={deletingId === p.id}
                              className="btn-icon hover:text-red-500 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                            </button>
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
                  No properties match your filters.
                </div>
              )}
              {filtered.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="w-16 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {p.coverImage ? (
                        <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Building2 size={18} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/properties/${p.id}/edit`} className="font-semibold text-navy text-[13px] leading-snug line-clamp-2">{p.title}</Link>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {p.village}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={clsx('badge text-[10px]', STATUS_BADGE[p.status])}>{STATUS_LABELS[p.status]}</span>
                    <span className="font-semibold text-[13px]">{p.salePrice ? formatPrice(p.salePrice) : p.rentPrice ? `${formatPrice(p.rentPrice)}/mo` : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/properties/${p.id}/edit`} className="btn-secondary flex-1 justify-center text-[11px] py-2"><Edit2 size={12} /> Edit</Link>
                    <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="btn-secondary flex-1 justify-center text-[11px] py-2 hover:text-red-500 disabled:opacity-50"><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
