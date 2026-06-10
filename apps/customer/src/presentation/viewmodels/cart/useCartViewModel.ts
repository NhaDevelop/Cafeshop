import { defineStore } from 'pinia'
import type { MenuItem } from '../../../types'
import { calculateTotal } from '../../../utils'
interface CartItem { id: string; menuItemId: string; name: string; price: number; quantity: number; subtotal: number; note?: string; size?: string }
export const useCartStore = defineStore('cart', () => {
  const items   = ref<CartItem[]>([])
  const tableId = ref<string | null>(null)
  const totals  = computed(() => calculateTotal(items.value.reduce((s, i) => s + i.subtotal, 0)))
  const count   = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  
  const add = (item: MenuItem, sizeName?: string, note?: string) => {
    const sizeObj = sizeName ? item.sizes?.find(s => s.name === sizeName) : null
    const price = sizeObj ? sizeObj.price : item.price
    const name = sizeName ? `${item.name} (${sizeName})` : item.name

    const existing = items.value.find(c => c.menuItemId === item.id && c.size === sizeName)
    if (existing) { existing.quantity++; existing.subtotal = existing.quantity * price }
    else items.value.push({ id: crypto.randomUUID(), menuItemId: item.id, name, price, quantity: 1, subtotal: price, note, size: sizeName })
  }
  
  const remove    = (id: string) => { items.value = items.value.filter(c => c.id !== id) }
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return remove(id)
    const item = items.value.find(c => c.id === id)
    if (item) { item.quantity = qty; item.subtotal = qty * item.price }
  }
  const clear = () => { items.value = [] }
  
  return { items, tableId, totals, count, add, remove, updateQty, clear }
})
