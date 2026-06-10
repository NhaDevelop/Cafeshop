import { defineStore } from 'pinia'
import type { CartItem } from './useCartViewModel'

const orderDateKey = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface Order {
  orderId: string
  items: CartItem[]
  total: number
  paymentMethod: string
  cashier: string
  timestamp: string
  businessDate?: string
  shiftId?: string
  customerPhone?: string
  change: number
  status: 'completed' | 'voided'
}

export const useOrderStore = defineStore('order', {
  state: () => ({
    completedOrders: [] as Order[],
    voidedOrders: [] as Order[]
  }),
  actions: {
    addOrder(order: Order) {
      this.completedOrders.unshift(order)
    },
    voidOrder(order: Order) {
      this.voidedOrders.unshift(order)
    }
  },
  getters: {
    todayOrders: (state) => {
      const today = orderDateKey(new Date())
      return state.completedOrders.filter(o => (o.businessDate ?? orderDateKey(o.timestamp)) === today)
    },
    todayRevenue: (state) => {
      const today = orderDateKey(new Date())
      return state.completedOrders
        .filter(o => (o.businessDate ?? orderDateKey(o.timestamp)) === today)
        .reduce((sum, o) => sum + o.total, 0)
    },
    ordersByDate: (state) => (dateKey: string) => {
      return state.completedOrders.filter(o => (o.businessDate ?? orderDateKey(o.timestamp)) === dateKey)
    },
    revenueByDate: (state) => (dateKey: string) => {
      return state.completedOrders
        .filter(o => (o.businessDate ?? orderDateKey(o.timestamp)) === dateKey)
        .reduce((sum, o) => sum + o.total, 0)
    },
    orderById: (state) => (id: string) => {
      return state.completedOrders.find(o => o.orderId === id) || state.voidedOrders.find(o => o.orderId === id)
    }
  },
  persist: {
    pick: ['completedOrders'] // Exclude voidedOrders
  }
})
