import { defineStore } from 'pinia'

export interface LoyaltyCustomer {
  id: string
  name: string
  phone: string
  points: number
  visits: number
  totalSpent: number
  lastVisit?: string
}

export const useLoyaltyStore = defineStore('loyalty', {
  state: () => ({
    customers: [
      { id: 'cust_1', name: 'Walk-in Regular', phone: '010000001', points: 42, visits: 6, totalSpent: 128, lastVisit: new Date().toISOString() },
    ] as LoyaltyCustomer[],
  }),
  actions: {
    registerCustomer(name: string, phone: string) {
      const existing = this.customers.find(customer => customer.phone === phone)
      if (existing) {
        existing.name = name || existing.name
        return existing
      }
      const customer: LoyaltyCustomer = {
        id: `cust_${Date.now()}`,
        name: name || 'Cafe Customer',
        phone,
        points: 0,
        visits: 0,
        totalSpent: 0,
      }
      this.customers.unshift(customer)
      return customer
    },
    applyOrder(phone: string, total: number) {
      if (!phone.trim()) return
      const customer = this.registerCustomer('Cafe Customer', phone.trim())
      customer.points += Math.floor(total)
      customer.visits += 1
      customer.totalSpent = Number((customer.totalSpent + total).toFixed(2))
      customer.lastVisit = new Date().toISOString()
    },
    adjustPoints(customerId: string, delta: number) {
      const customer = this.customers.find(item => item.id === customerId)
      if (customer) customer.points = Math.max(0, customer.points + delta)
    },
  },
  getters: {
    topCustomers: (state) => [...state.customers].sort((a, b) => b.points - a.points).slice(0, 5),
    customerByPhone: (state) => (phone: string) => state.customers.find(customer => customer.phone === phone),
  },
  persist: true,
})
