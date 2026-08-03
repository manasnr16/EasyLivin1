// Requests go to the CRM's own origin and are proxied to the API by
// next.config.js `rewrites()` — this keeps the auth cookies first-party
// (required for SameSite=Strict) instead of talking cross-origin to the API.
const API_BASE_URL = ''

export class ApiError extends Error {
  code?: string
  details?: unknown
  constructor(public status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.code = code
    this.details = details
  }
}

// Auth tokens live in httpOnly cookies set by the API — the browser attaches
// them automatically via `credentials: 'include'`. No client-side JS ever
// touches the raw tokens (keeps them safe from XSS).

async function tryRefreshToken(): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  return res.ok
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401 && retry) {
    const refreshed = await tryRefreshToken()
    if (refreshed) return request<T>(path, options, false)
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
