const TOKEN_KEY = 'cafe_session'
export const storage = {
  getSession:   (): string | null => import.meta.client ? localStorage.getItem(TOKEN_KEY) : null,
  setSession:   (t: string)       => localStorage.setItem(TOKEN_KEY, t),
  clearSession: ()                => localStorage.removeItem(TOKEN_KEY),
}
