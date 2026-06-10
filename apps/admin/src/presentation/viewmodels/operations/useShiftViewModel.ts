import { defineStore } from 'pinia'

export interface ShiftSession {
  id: string
  name: string
  openedAt: string
  closedAt?: string
  openedBy: string
  openingCash: number
  closingCash?: number
  totalSales: number
  orderCount: number
  note?: string
}

export const useShiftStore = defineStore('shift', {
  state: () => ({
    currentShift: null as ShiftSession | null,
    shiftHistory: [] as ShiftSession[],
  }),
  actions: {
    startShift(name: string, openedBy: string, openingCash = 0) {
      if (this.currentShift) return
      this.currentShift = {
        id: `shift_${Date.now()}`,
        name,
        openedAt: new Date().toISOString(),
        openedBy,
        openingCash,
        totalSales: 0,
        orderCount: 0,
      }
    },
    closeShift(orderCount: number, totalSales: number, closingCash: number, note?: string) {
      if (!this.currentShift) return
      const closed: ShiftSession = {
        ...this.currentShift,
        closedAt: new Date().toISOString(),
        closingCash,
        totalSales,
        orderCount,
        note,
      }
      this.currentShift = null
      this.shiftHistory.unshift(closed)
    },
  },
  getters: {
    isOpen: (state) => !!state.currentShift,
    currentShiftId: (state) => state.currentShift?.id ?? null,
    currentDuration: (state) => {
      if (!state.currentShift) return '-'
      const ms = Date.now() - new Date(state.currentShift.openedAt).getTime()
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      return `${h}h ${m}m`
    },
  },
  persist: true,
})
