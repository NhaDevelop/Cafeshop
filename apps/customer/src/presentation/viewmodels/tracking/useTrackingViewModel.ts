import { defineStore } from 'pinia'
import type { Order } from '../../../types'
import { orderRepository } from '../../../data/repositories/order.repository'
export const useTrackingStore = defineStore('tracking', () => {
  const order   = ref<Order | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)
  const statusSteps = ['pending','preparing','ready','completed']
  const currentStep = computed(() => statusSteps.indexOf(order.value?.status ?? 'pending'))
  const load = async (orderId: string) => {
    loading.value = true
    try { order.value = await orderRepository.getById(orderId) }
    catch (e: unknown) { error.value = e instanceof Error ? e.message : 'Failed' }
    finally { loading.value = false }
  }
  return { order, loading, error, currentStep, statusSteps, load }
})
