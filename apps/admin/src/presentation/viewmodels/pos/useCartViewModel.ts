import { defineStore } from 'pinia'

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  subtotal: number
  size?: string
  modifiers?: { id: string, name: string, price: number }[]
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    tableNumber: '',
    customerPhone: '',
    coupon: '',
    discount: 0,
    paymentMethod: 'cash'
  }),
  actions: {
    addItem(item: { id: string; name: string; price: number; size?: string; modifiers?: { id: string, name: string, price: number }[] }) {
      // Check if same item with same size AND same modifiers exists
      const modString = item.modifiers ? item.modifiers.map(m => m.id).sort().join(',') : ''
      const existing = this.items.find(i => {
        const iModString = i.modifiers ? i.modifiers.map(m => m.id).sort().join(',') : ''
        return i.menuItemId === item.id && i.size === item.size && iModString === modString
      })
      
      const modifiersTotal = item.modifiers ? item.modifiers.reduce((sum, m) => sum + m.price, 0) : 0
      const unitPrice = item.price + modifiersTotal

      if (existing) {
        existing.quantity++
        existing.subtotal = existing.quantity * unitPrice
      } else {
        this.items.push({
          id: crypto.randomUUID(),
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          modifiers: item.modifiers || [],
          subtotal: unitPrice,
          size: item.size
        })
      }
    },
    removeItem(cartItemId: string) {
      this.items = this.items.filter(i => i.id !== cartItemId)
    },
    updateQty(cartItemId: string, qty: number) {
      if (qty <= 0) {
        this.removeItem(cartItemId)
        return
      }
      const existing = this.items.find(i => i.id === cartItemId)
      if (existing) {
        const modifiersTotal = existing.modifiers ? existing.modifiers.reduce((sum, m) => sum + m.price, 0) : 0
        existing.quantity = qty
        existing.subtotal = qty * (existing.price + modifiersTotal)
      }
    },
    replaceItems(items: CartItem[]) {
      this.items = items.map(item => {
        const modifiersTotal = item.modifiers ? item.modifiers.reduce((sum, m) => sum + m.price, 0) : 0
        return {
          ...item,
          id: crypto.randomUUID(),
          subtotal: (item.price + modifiersTotal) * item.quantity,
        }
      })
    },
    clearCart() {
      this.items = []
      this.tableNumber = ''
      this.customerPhone = ''
      this.coupon = ''
      this.discount = 0
      this.paymentMethod = 'cash'
    },
    applyDiscount(amount: number) {
      this.discount = amount
    }
  },
  getters: {
    subtotal: (state) => {
      return state.items.reduce((sum, item) => sum + item.subtotal, 0)
    },
    tax: (state) => {
      // Assuming 10% tax as per instructions for payment modal
      const sub = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      return Math.round(sub * 0.1 * 100) / 100
    },
    total: (state) => {
      const sub = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      const t = Math.round(sub * 0.1 * 100) / 100
      return sub + t - state.discount
    }
  },
  persist: true
})
