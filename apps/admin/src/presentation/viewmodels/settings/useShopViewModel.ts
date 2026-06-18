import { defineStore } from 'pinia'

const businessDateKey = (value: string | Date = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface ShopSession {
  shiftId: string
  openedAt: string
  closedAt?: string
  businessDate: string
  openedBy: string
  openingNote?: string
  closingNote?: string
  openingFloat: number
  closingFloat: number
  totalOrders: number
  totalRevenue: number
}

export const useShopStore = defineStore('shop', {
  state: () => ({
    isOpen: false,
    currentSession: null as ShopSession | null,
    sessionHistory: [] as ShopSession[]
  }),
  actions: {
    openShop(cashier: string, openingFloat: number, businessDateOverride?: string, note?: string) {
      if (this.isOpen && this.currentSession) return
      const openedAt = new Date()
      this.isOpen = true
      this.currentSession = {
        shiftId: `SHIFT-${Date.now().toString(36).toUpperCase()}`,
        openedAt: openedAt.toISOString(),
        businessDate: businessDateOverride || businessDateKey(openedAt),
        openedBy: cashier,
        openingFloat,
        closingFloat: 0,
        openingNote: note,
        totalOrders: 0,
        totalRevenue: 0
      }
    },
    closeShop(totalOrders: number, totalRevenue: number, closingFloat: number, note?: string) {
      if (!this.currentSession) return
      const closed: ShopSession = {
        ...this.currentSession,
        businessDate: this.currentSession.businessDate ?? businessDateKey(this.currentSession.openedAt),
        closedAt: new Date().toISOString(),
        closingFloat,
        closingNote: note,
        totalOrders,
        totalRevenue
      }
      this.currentSession = null
      this.isOpen = false
      const existingIndex = this.sessionHistory.findIndex(
        session => (session.businessDate ?? businessDateKey(session.openedAt)) === closed.businessDate
      )
      if (existingIndex >= 0) {
        this.sessionHistory.splice(existingIndex, 1, closed)
      } else {
        this.sessionHistory.unshift(closed)
      }
    }
  },
  getters: {
    lastSession: (state) => state.sessionHistory[0] ?? null,
    currentBusinessDate: (state) => {
      if (!state.currentSession) return businessDateKey()
      return state.currentSession.businessDate ?? businessDateKey(state.currentSession.openedAt)
    },
    openDuration: (state) => {
      if (!state.currentSession) return '–'
      const ms = Date.now() - new Date(state.currentSession.openedAt).getTime()
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      return `${h}h ${m}m`
    }
  },
  persist: true
})
