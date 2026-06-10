<template>
  <Transition name="drawer">
    <div v-if="modelValue" class="drawer-overlay" @click.self="close">
      <div class="drawer-panel">
        <div class="drawer-header">
          <div class="h-title">
            <h3>Today's Orders</h3>
            <span class="badge">{{ filteredOrders.length }}</span>
          </div>
          <button class="drawer-close" @click="close"><X :size="20" /></button>
        </div>

        <div class="drawer-tabs">
          <button v-for="tab in ['All', 'Completed', 'Held', 'Voided']" :key="tab" 
            class="d-tab" :class="{ active: currentTab === tab }" @click="currentTab = tab">
            {{ tab }}
          </button>
        </div>

        <div class="drawer-body">
          <div v-if="filteredOrders.length === 0" class="empty-state">
            <ListOrdered :size="48" class="text-muted mb-3" style="opacity: 0.3" />
            <p>No orders yet today</p>
          </div>
          
          <div v-else class="orders-list">
            <div v-for="order in filteredOrders" :key="order.id" class="order-card">
              <div class="o-head">
                <span class="o-num">{{ order.id }}</span>
                <span class="o-status" :class="order.status">{{ order.status }}</span>
              </div>
              <div class="o-meta">
                <span class="text-muted"><Clock :size="12" class="icon-inline" /> {{ order.time }}</span>
                <span class="text-muted" v-if="order.paymentMethod"><CreditCard :size="12" class="icon-inline" /> {{ order.paymentMethod }}</span>
              </div>
              <div class="o-items">{{ order.summary }}</div>
              <div class="o-foot">
                <span class="o-total">${{ order.total.toFixed(2) }}</span>
                <button v-if="order.status === 'completed'" class="btn btn-sm btn-ghost" :disabled="!shopStore.isOpen" @click="reorder(order.rawItems)">
                  <RefreshCw :size="12" class="icon-inline" /> Reorder
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-footer">
          <div class="revenue-box">
            <span class="text-muted">Today's Revenue</span>
            <span class="revenue-val">${{ orderStore.todayRevenue.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Clock, CreditCard, RefreshCw, ListOrdered } from '@lucide/vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'close'])

const orderStore = useOrderStore()
const holdStore = useHoldStore()
const cartStore = useCartStore()
const shopStore = useShopStore()

const currentTab = ref('All')

const close = () => emit('update:modelValue', false)

const allOrders = computed(() => {
  const completed = orderStore.todayOrders.map(o => ({
    id: o.orderId,
    time: new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    summary: o.items.map((i: any) => `${i.name} x${i.quantity}`).join(', '),
    total: o.total,
    paymentMethod: o.paymentMethod,
    status: 'completed',
    rawItems: o.items
  }))
  
  const voided = orderStore.voidedOrders.map(o => ({
    id: o.orderId,
    time: new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    summary: o.items.map((i: any) => `${i.name} x${i.quantity}`).join(', '),
    total: o.total,
    paymentMethod: o.paymentMethod,
    status: 'voided',
    rawItems: o.items
  }))
  
  const holds = holdStore.holds.map(h => ({
    id: `HOLD-${h.id.slice(-6)}`,
    time: h.savedAt.split(' ')[1] || h.savedAt,
    summary: h.items.map((i: any) => `${i.name} x${i.quantity}`).join(', '),
    total: h.total,
    paymentMethod: '',
    status: 'held',
    rawItems: h.items
  }))
  
  return [...completed, ...voided, ...holds].sort((a, b) => {
    // Sort logic simplified, assume roughly chronological by insertion if we don't parse time strictly
    return -1
  })
})

const filteredOrders = computed(() => {
  if (currentTab.value === 'All') return allOrders.value
  return allOrders.value.filter(o => o.status === currentTab.value.toLowerCase())
})

const reorder = (items: any[]) => {
  if (!shopStore.isOpen) {
    alert('Open shop before adding a reorder to the cart.')
    return
  }
  if (cartStore.items.length > 0) {
    if (!confirm('Clear current cart to reorder?')) return
  }
  cartStore.clearCart()
  items.forEach(item => {
    for(let i=0; i<item.quantity; i++) cartStore.addItem(item)
  })
  close()
}
</script>

<style scoped>
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; justify-content: flex-end; backdrop-filter: blur(2px); }
.drawer-panel { width: 400px; max-width: 100%; background: #F8FAFC; height: 100%; display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.1); }
.drawer-header { padding: 20px 24px; background: white; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
.h-title { display: flex; align-items: center; gap: 12px; }
.h-title h3 { margin: 0; font-size: 18px; font-weight: 800; color: #1E293B; }
.badge { background: #E2E8F0; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 700; }
.drawer-close { background: transparent; border: none; cursor: pointer; color: #64748B; }
.drawer-close:hover { color: #EF4444; }

.drawer-tabs { display: flex; background: white; border-bottom: 1px solid var(--color-border); padding: 0 16px; }
.d-tab { flex: 1; padding: 14px 0; background: transparent; border: none; border-bottom: 2px solid transparent; font-weight: 600; font-size: 13px; color: #64748B; cursor: pointer; transition: all 0.2s; }
.d-tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }

.drawer-body { flex: 1; overflow-y: auto; padding: 20px; }
.empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--color-muted); font-size: 15px; font-weight: 500; }
.orders-list { display: flex; flex-direction: column; gap: 16px; }

.order-card { background: white; border-radius: 12px; padding: 16px; border: 1px solid var(--color-border); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.o-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.o-num { font-weight: 800; font-size: 15px; color: #1E293B; }
.o-status { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; }
.o-status.completed { background: #D1FAE5; color: #059669; }
.o-status.held { background: #FEF3C7; color: #D97706; }
.o-status.voided { background: #FEE2E2; color: #DC2626; }

.o-meta { display: flex; gap: 16px; margin-bottom: 12px; font-size: 12px; }
.o-items { font-size: 13px; color: #475569; margin-bottom: 16px; line-height: 1.5; }
.o-foot { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--color-border); padding-top: 12px; }
.o-total { font-weight: 800; font-size: 16px; color: var(--color-primary); }

.btn-sm { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid var(--color-border); }
.btn-sm:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-ghost { background: white; color: #475569; }
.btn-ghost:hover { background: #F1F5F9; }

.drawer-footer { background: white; padding: 20px 24px; border-top: 1px solid var(--color-border); }
.revenue-box { display: flex; justify-content: space-between; align-items: center; }
.revenue-val { font-size: 24px; font-weight: 900; color: #10B981; }

.text-muted { color: #64748B; }

.drawer-enter-active, .drawer-leave-active { transition: all 0.3s ease; }
.drawer-enter-active .drawer-panel, .drawer-leave-active .drawer-panel { transition: transform 0.3s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer-panel, .drawer-leave-to .drawer-panel { transform: translateX(100%); }
</style>
