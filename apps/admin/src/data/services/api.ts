import { storage } from '../../core/helpers/storage'

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const config = useRuntimeConfig()
  const token  = storage.getToken()

  const res = await fetch(`${config.public.apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
  return res.json()
}
