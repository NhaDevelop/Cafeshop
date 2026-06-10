import { defineStore } from 'pinia'
import type { Order, OrderStatus } from '../../../types'
import { orderRepository } from '../../../data/repositories/order.repository'
export const useKitchenStore = defineStore('kitchen', () => {
  const orders  = ref<Order[]>([])
  const loading = ref(true)
  const activeOrders = computed(() => orders.value.filter(o => ['pending','preparing'].includes(o.status)))
  const addOrUpdate = (order: Order) => {
    const idx = orders.value.findIndex(o => o.id === order.id)
    if (idx !== -1) orders.value[idx] = order
    else orders.value.unshift(order)
  }
  const load = async () => {
    try { orders.value = await orderRepository.getAll({ status: 'pending' }) }
    catch { /* no backend yet */ }
    finally { loading.value = false }
  }
  const updateStatus = async (id: string, status: OrderStatus) => {
    try { const updated = await orderRepository.updateStatus(id, status); addOrUpdate(updated) }
    catch { /* offline */ }
  }
  return { activeOrders, loading, load, updateStatus }
})
