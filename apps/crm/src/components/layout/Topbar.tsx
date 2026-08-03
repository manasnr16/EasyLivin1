'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, Search, Plus, Building2, UserPlus, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getInitials, getRoleLabel } from '@/lib/data'

interface TopbarProps {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuth()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setQuickAddOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="pl-12 lg:pl-0 min-w-0">
        <h1 className="text-[15px] font-semibold text-navy leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-52 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15 transition-colors">
          <Search size={13} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search leads, properties..."
            className="bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400 w-full"
          />
        </div>

        {/* Quick add */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setQuickAddOpen((v) => !v)}
            className="hidden sm:inline-flex items-center gap-1.5 bg-gold hover:bg-gold-dark text-white text-[12.5px] font-semibold px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} /> Quick Add <ChevronDown size={13} className="opacity-70" />
          </button>
          {quickAddOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg py-1.5 z-30">
              <Link
                href="/properties/new"
                onClick={() => setQuickAddOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50"
              >
                <Building2 size={15} className="text-slate-400" /> Add Property
              </Link>
              <Link
                href="/leads"
                onClick={() => setQuickAddOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50"
              >
                <UserPlus size={15} className="text-slate-400" /> Add Lead
              </Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Avatar + role */}
        {user && (
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-gold-light text-[12px] font-bold flex-shrink-0">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <span className="hidden md:block text-[11px] font-medium text-slate-500">{getRoleLabel(user.role)}</span>
          </div>
        )}
      </div>
    </header>
  )
}
