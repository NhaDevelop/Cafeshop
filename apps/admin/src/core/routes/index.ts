// ── App Routes ────────────────────────────────────────────
// All route constants in one place.
// Update these when integrating with a real backend router.

export const ROUTES = {
  // ─── Public ───────────────────────────────────────────
  LOGIN: '/login',

  // ─── POS Terminal ─────────────────────────────────────
  POS:     '/pos',
  KITCHEN: '/kitchen',

  // ─── Admin Panel (/admin/*) ───────────────────────────
  DASHBOARD:   '/admin/dashboard',
  DAILY_SALES: '/admin/daily-sales',
  REPORTS:     '/admin/reports',
  PRODUCTS:    '/admin/products',
  INVENTORY:   '/admin/inventory',
  SHIFTS:      '/admin/shifts',
  LOYALTY:     '/admin/loyalty',
  EXPENSES:    '/admin/expenses',
} as const
