const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  code?: string
  details?: unknown
  constructor(public status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.code = code
    this.details = details
  }
}

function getAccessToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('crm_access_token') : null
}

function getRefreshToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('crm_refresh_token') : null
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('crm_access_token', accessToken)
  localStorage.setItem('crm_refresh_token', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('crm_access_token')
  localStorage.removeItem('crm_refresh_token')
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) return false
  const json = await res.json()
  setTokens(json.data.accessToken, json.data.refreshToken)
  return true
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken()
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshToken()
    if (refreshed) return request<T>(path, options, false)
    clearTokens()
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new ApiError(res.status, json.error ?? 'Request failed', json.code, json.details)
  }
  return json.data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'DELETE', ...(body ? { body: JSON.stringify(body) } : {}) }),
}

// For SWR's useSWR(key, fetcher)
export const fetcher = <T>(path: string) => api.get<T>(path)
