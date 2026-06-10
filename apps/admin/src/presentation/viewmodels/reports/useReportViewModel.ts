import { defineStore } from 'pinia'
import type { DashboardStats, SalesSummary } from '@cafe-nux/types'
import { reportApi } from '@cafe-nux/api-client'

export const useReportStore = defineStore('report', {
  state: () => ({
    dashboardStats: null as DashboardStats | null,
    salesByRange: [] as SalesSummary[],
    isLoading: false,
    error: null as string | null
  }),
  actions: {
    async fetchDashboardStats() {
      this.isLoading = true
      this.error = null
      try {
        this.dashboardStats = await reportApi.getDashboardStats()
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch dashboard stats'
        console.error(err)
      } finally {
        this.isLoading = false
      }
    },
    async fetchSalesByRange(from: string, to: string) {
      this.isLoading = true
      this.error = null
      try {
        this.salesByRange = await reportApi.getSalesByRange(from, to)
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch sales report'
        console.error(err)
      } finally {
        this.isLoading = false
      }
    }
  }
})
