import type { Order, OrderStatus, CreateOrderDTO } from '../../types'

const API = 'http://localhost:3099'

export const orderRepository = {
  getAll: async (params?: { status?: string }): Promise<Order[]> => {
    const url = new URL(`${API}/orders`)
    if (params?.status) url.searchParams.set('status', params.status)
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Failed to load orders')
    return res.json()
  },

  getById: async (id: string): Promise<Order> => {
    const res = await fetch(`${API}/orders/${id}`)
    if (!res.ok) throw new Error('Order not found')
    return res.json()
  },

  create: async (data: CreateOrderDTO): Promise<Order> => {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create order')
    return res.json()
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const res = await fetch(`${API}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (!res.ok) throw new Error('Failed to update status')
    return res.json()
  },

  updatePaymentStatus: async (id: string, paymentStatus: 'paid' | 'unpaid'): Promise<Order> => {
    const res = await fetch(`${API}/orders/${id}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus })
    })
    if (!res.ok) throw new Error('Failed to update payment status')
    return res.json()
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`${API}/orders/${id}`, { method: 'DELETE' })
  }
}
