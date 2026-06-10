import { defineStore } from 'pinia'
import type { CartItem } from './useCartViewModel'

export interface HoldOrder {
  id: string // timestamp
  items: CartItem[]
  tableNumber: string
  customerPhone?: string
  savedAt: string // datetime
  total: number
}

export const useHoldStore = defineStore('hold', {
  state: () => ({
    holds: [] as HoldOrder[]
  }),
  actions: {
    holdCart(cartState: { items: CartItem[], tableNumber: string, customerPhone?: string, total: number }) {
      const now = new Date()
      this.holds.unshift({
        id: Date.now().toString(),
        items: JSON.parse(JSON.stringify(cartState.items)),
        tableNumber: cartState.tableNumber,
        customerPhone: cartState.customerPhone,
        savedAt: now.toLocaleString(),
        total: cartState.total
      })
    },
    resumeHold(id: string) {
      const holdIndex = this.holds.findIndex(h => h.id === id)
      if (holdIndex > -1) {
        const hold = this.holds[holdIndex]
        this.holds.splice(holdIndex, 1)
        return hold
      }
      return null
    },
    deleteHold(id: string) {
      this.holds = this.holds.filter(h => h.id !== id)
    }
  },
  persist: true
})
