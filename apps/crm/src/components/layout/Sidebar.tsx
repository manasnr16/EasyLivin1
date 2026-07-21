'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, Upload, BarChart3,
  Settings, LogOut, ChevronRight, UserPlus, X, Menu, Share2,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getInitials } from '@/lib/data'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/properties', label: 'Properties', icon: Building2, adminOnly: false },
  { href: '/leads', label: 'Leads', icon: Users, adminOnly: false },
  { href: '/upload', label: 'Bulk Upload', icon: Upload, adminOnly: true },
  { href: '/agents', label: 'Agents', icon: UserPlus, adminOnly: true },
  { href: '/automation', label: 'Automation', icon: Share2, adminOnly: true },
  { href: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
  { href: '/settings', label: 'Settings', icon: Settings, adminOnly: false },
]

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  CLIENT_ADMIN: 'Client Admin',
  SALES_EXECUTIVE: 'Sales Executive',
  MARKETING_MANAGER: 'Marketing Manager',
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Image src="/images/logo1.png" alt="Easy Livin Goa" width={120} height={40} className="h-10 w-auto object-contain" />
        </Link>
        <div className="mt-2 text-[10px] font-semibold tracking-[0.16em] uppercase text-white/30">
          Admin Portal
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={clsx('nav-item group', active && 'active')}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Role badge */}
      <div className="px-3 py-2">
        <div className="bg-white/5 rounded-lg px-3 py-2">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/30 mb-0.5">Role</p>
          <p className="text-[12px] text-gold font-semibold">
            {user ? ROLE_LABELS[user.role] ?? user.role : '—'}
          </p>
        </div>
      </div>

      {/* User + logout */}
      <div className="px-3 pb-5 pt-2 border-t border-white/8 mt-2">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[12px] font-bold flex-shrink-0">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white/90 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="nav-item w-full mt-1 text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] bg-navy-deep border-r border-white/5 fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-navy-deep rounded-lg flex items-center justify-center text-white shadow-lg"
      >
        <Menu size={18} />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 w-[240px] bg-navy-deep z-50 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
