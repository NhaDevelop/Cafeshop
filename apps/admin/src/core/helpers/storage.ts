const TOKEN_KEY = 'cafe_token'

export const storage = {
  getToken:   (): string | null => import.meta.client ? localStorage.getItem(TOKEN_KEY) : null,
  setToken:   (t: string)       => localStorage.setItem(TOKEN_KEY, t),
  clearToken: ()                => localStorage.removeItem(TOKEN_KEY),
}
