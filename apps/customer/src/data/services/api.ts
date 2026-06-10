export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const config = useRuntimeConfig()
  const url = `${config.public.apiUrl}${endpoint}`
  
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody.message || `API error: ${res.statusText}`)
  }
  return res.json()
}
