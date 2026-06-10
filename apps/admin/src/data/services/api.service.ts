import { storage } from '../../core/helpers/storage'

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const config = useRuntimeConfig()
  const url = `${config.public.apiUrl}${endpoint}`
  const token = storage.getToken()
  
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody.message || `API error: ${res.statusText}`)
  }
  return res.json()
}
