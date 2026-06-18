// ── Reports & Analytics Types ─────────────────────────────

export interface SalesSummary {
  date: string
  revenue: number
  orderCount: number
  avgOrderValue: number
}

export interface TopItem {
  menuItemId: string
  name: string
  quantity: number
  revenue: number
}

export interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  avgOrderValue: number
  activeTables: number
  topItems: TopItem[]
}
