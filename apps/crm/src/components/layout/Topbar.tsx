'use client'

import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getInitials } from '@/lib/data'

interface TopbarProps {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuth()

  return (
    <header className="h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="pl-12 lg:pl-0 min-w-0">
        <h1 className="text-[15px] font-semibold text-navy leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-48">
          <Search size={13} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400 w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        {user && (
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-gold text-[12px] font-bold flex-shrink-0 ml-1">
            {getInitials(user.firstName, user.lastName)}
          </div>
        )}
      </div>
    </header>
  )
}
