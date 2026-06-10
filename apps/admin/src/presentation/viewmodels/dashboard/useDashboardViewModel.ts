import { defineStore } from 'pinia'
import type { DashboardStats, SalesSummary } from '../../../types'
import { reportRepository } from '../../../data/repositories/report.repository'
export const useDashboardStore = defineStore('dashboard', () => {
  const stats   = ref<DashboardStats | null>(null)
  const sales   = ref<SalesSummary[]>([])
  const loading = ref(true)
  const error   = ref<string | null>(null)
  const load = async () => {
    loading.value = true
    try {
      const today = new Date().toISOString().split('T')[0]
      const week  = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      const [s, sv] = await Promise.all([reportRepository.getDashboardStats(), reportRepository.getSalesByRange(week, today)])
      stats.value = s; sales.value = sv
    } catch { /* no backend yet */ }
    finally { loading.value = false }
  }
  return { stats, sales, loading, error, load }
})
