'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError, setTokens, clearTokens } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  isAdmin: boolean
  isAgent: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  async function refreshUser() {
    const me = await api.get<User>('/api/auth/me')
    setUser(me)
  }

  useEffect(() => {
    ;(async () => {
      const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('crm_access_token')
      if (!hasToken) {
        setLoading(false)
        return
      }
      try {
        await refreshUser()
      } catch {
        clearTokens()
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function login(email: string, password: string) {
    try {
      const data = await api.post<{ tokens: { accessToken: string; refreshToken: string } }>(
        '/api/auth/login',
        { email, password }
      )
      setTokens(data.tokens.accessToken, data.tokens.refreshToken)
      await refreshUser()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof ApiError ? err.message : 'Login failed' }
    }
  }

  function logout() {
    api.post('/api/auth/logout').catch(() => {})
    clearTokens()
    setUser(null)
    router.push('/login')
  }

  const isAdmin = user?.role === 'CLIENT_ADMIN' || user?.role === 'SUPER_ADMIN'
  const isAgent = user?.role === 'SALES_EXECUTIVE'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAdmin, isAgent }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
