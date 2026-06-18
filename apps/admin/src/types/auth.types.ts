// ── Auth & User Types ─────────────────────────────────────

export type UserRole = 'admin' | 'cashier' | 'kitchen'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginDTO {
  email: string
  password: string
}
