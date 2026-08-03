'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, BarChart3,
  Settings, LogOut, ChevronRight, UserPlus, X, Menu, PanelLeftClose, PanelLeftOpen,
  // Upload, // only used by the disabled Bulk Upload nav entry below
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getInitials, getRoleLabel } from '@/lib/data'
import clsx from 'clsx'

const COLLAPSE_KEY = 'crm-sidebar-collapsed'

// Automation isn't a real integration yet (see /automation) — no nav entry
// until it's wired to something. Nav is otherwise Admin vs Agent only.
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/properties', label: 'Properties', icon: Building2, adminOnly: false },
  { href: '/leads', label: 'Leads', icon: Users, adminOnly: false },
  // Bulk Upload nav entry disabled per request — page/route left intact,
  // just not linked from the sidebar for now.
  // { href: '/upload', label: 'Bulk Upload', icon: Upload, adminOnly: true },
  { href: '/agents', label: 'Agents', icon: UserPlus, adminOnly: true },
  { href: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
  { href: '/settings', label: 'Settings', icon: Settings, adminOnly: false },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Restore collapse preference and drive the content-area margin via a CSS
  // var so the layout doesn't need its own copy of this state.
  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY) === '1'
    setCollapsed(stored)
    document.documentElement.style.setProperty('--sidebar-w', stored ? '76px' : '240px')
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      document.documentElement.style.setProperty('--sidebar-w', next ? '76px' : '240px')
      return next
    })
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  const SidebarContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo row + collapse toggle (top, ChatGPT-style). When collapsed,
          only the expand icon shows — no logo/initials placeholder. */}
      <div className={clsx('py-4 border-b border-white/8 flex items-center', compact ? 'px-3 justify-center' : 'px-4 justify-between')}>
        {!compact && (
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0" onClick={() => setMobileOpen(false)}>
            <Image src="/images/logo1.png" alt="Easy Livin Goa" width={168} height={56} className="h-14 w-auto object-contain flex-shrink-0" />
          </Link>
        )}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>
      {!compact && (
        <div className="px-4 pt-2 text-[10px] font-semibold tracking-[0.16em] uppercase text-white/30">
          Admin Portal
        </div>
      )}

      {/* Nav */}
      <nav className={clsx('flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden', compact ? 'px-2' : 'px-3')}>
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={compact ? label : undefined}
              className={clsx('nav-item group', active && 'active', compact && 'justify-center px-0')}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!compact && <span>{label}</span>}
              {!compact && active && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Role badge */}
      {!compact && (
        <div className="px-3 py-2">
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/30 mb-0.5">Role</p>
            <p className="text-[12px] text-gold-light font-semibold">
              {user ? getRoleLabel(user.role) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* User + logout */}
      <div className={clsx('pb-5 pt-2 border-t border-white/8 mt-2', compact ? 'px-2' : 'px-3')}>
        {user && !compact && (
          <div className="flex items-center gap-3 px-2 py-2.5">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold-light text-[12px] font-bold flex-shrink-0">
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
          title={compact ? 'Log Out' : undefined}
          className={clsx('nav-item w-full mt-1 text-red-400/70 hover:text-red-400 hover:bg-red-500/10', compact && 'justify-center px-0')}
        >
          <LogOut size={16} />
          {!compact && <span>Log Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        style={{ width: 'var(--sidebar-w, 240px)' }}
        className="hidden lg:flex flex-col bg-navy-deep border-r border-white/5 fixed top-0 left-0 bottom-0 z-30 transition-[width] duration-150"
      >
        <SidebarContent compact={collapsed} />
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
