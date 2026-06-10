import type { DashboardStats, SalesSummary } from '../../types'

const pastDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export const reportRepository = {
  getDashboardStats: async () => new Promise<DashboardStats>(resolve => setTimeout(() => resolve({
    todayRevenue: 0,
    todayOrders: 0,
    avgOrderValue: 0,
    activeTables: 0,
    topItems: []
  }), 300)),
  
  getSalesByRange: async (_from: string, _to: string) => new Promise<SalesSummary[]>(resolve => setTimeout(() => resolve([
    { date: pastDays(6), revenue: 850,  orderCount: 65,  avgOrderValue: 13.0 },
    { date: pastDays(5), revenue: 920,  orderCount: 70,  avgOrderValue: 13.1 },
    { date: pastDays(4), revenue: 1100, orderCount: 82,  avgOrderValue: 13.4 },
    { date: pastDays(3), revenue: 1250, orderCount: 90,  avgOrderValue: 13.8 },
    { date: pastDays(2), revenue: 1480, orderCount: 110, avgOrderValue: 13.4 },
    { date: pastDays(1), revenue: 1850, orderCount: 135, avgOrderValue: 13.7 },
    { date: pastDays(0), revenue: 0,    orderCount: 0,   avgOrderValue: 0    },
  ]), 300)),
}
