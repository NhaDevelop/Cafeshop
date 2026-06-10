import type { Order, CreateOrderDTO } from '../../types'
import { menuRepository } from './menu.repository'

const API = 'http://localhost:3099'

export const orderRepository = {
  create: async (data: CreateOrderDTO): Promise<Order> => {
    // Resolve item names and prices from the menu so the API stores real data
    let menuItems: any[] = []
    try { menuItems = await menuRepository.getMenuItems() } catch { /* use fallback */ }

    const enrichedItems = (data.items ?? []).map((i, idx) => {
      const found = menuItems.find(m => m.id === i.menuItemId)
      return {
        menuItemId: i.menuItemId,
        name: found?.name || 'Item',
        quantity: i.quantity,
        price: found?.price ?? 0,
        note: i.note
      }
    })

    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId:    data.tableId,
        tableLabel: data.tableLabel,
        source:     data.source ?? 'online',
        items:      enrichedItems
      })
    })
    if (!res.ok) throw new Error('Failed to place order')
    return res.json()
  },

  getById: async (id: string): Promise<Order> => {
    const res = await fetch(`${API}/orders/${id}`)
    if (!res.ok) throw new Error('Order not found')
    return res.json()
  },

  getAll: async (): Promise<Order[]> => {
    const res = await fetch(`${API}/orders`)
    if (!res.ok) throw new Error('Failed to load orders')
    return res.json()
  }
}
