<template>
  <div class="kitchen-page">
    <header class="kitchen-header">
      <div class="kh-left">
        <h1 class="kitchen-title flex-align"><ChefHat :size="24" class="icon-inline text-primary" /> Kitchen Display</h1>
        <span class="live-badge"><span class="live-dot" /> LIVE</span>
      </div>
      <div class="kh-right text-muted">{{ time }}</div>
    </header>

    <div v-if="store.loading" class="loading-state">
      <div class="spinner" /> Waiting for orders…
    </div>

    <div v-else-if="store.activeOrders.length === 0" class="empty-kitchen">
      <CheckCircle2 :size="64" class="empty-icon" />
      <h2>All caught up!</h2>
      <p class="text-muted">No active orders right now</p>
    </div>

    <div v-else class="orders-grid">
      <div
        v-for="order in store.activeOrders"
        :key="order.id"
        class="order-ticket fade-in"
        :class="`ticket-${order.status}`"
      >
        <div class="ticket-header">
          <div class="ticket-id">#{{ order.id.slice(-4).toUpperCase() }}</div>
          <span :class="`badge badge-${order.status}`">{{ order.status }}</span>
        </div>
        <div class="ticket-meta">
          <span class="flex-align"><component :is="order.tableId ? MapPin : Globe" :size="12" class="icon-inline text-muted"/> {{ order.tableId ? `Table ${order.tableLabel}` : 'Online' }}</span>
          <span class="text-muted">{{ elapsed(order.createdAt) }}</span>
        </div>

        <ul class="ticket-items">
          <li v-for="item in order.items" :key="item.id" class="ticket-item">
            <span class="ti-qty">×{{ item.quantity }}</span>
            <span class="ti-name">{{ item.name }}</span>
            <span v-if="item.note" class="ti-note flex-align"><Pencil :size="10" class="icon-inline"/> {{ item.note }}</span>
          </li>
        </ul>

        <div class="ticket-actions">
          <button
            v-if="order.status === 'pending'"
            class="btn btn-primary action-btn"
            @click="store.updateStatus(order.id, 'preparing')"
          ><Play :size="14" class="icon-inline" /> Start Preparing</button>
          <button
            v-else-if="order.status === 'preparing'"
            class="btn btn-success action-btn"
            @click="store.updateStatus(order.id, 'ready')"
          ><Check :size="14" class="icon-inline" /> Mark Ready</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChefHat, CheckCircle2, MapPin, Globe, Pencil, Play, Check } from '@lucide/vue'

definePageMeta({ layout: false, middleware: 'auth' })

const store = useKitchenStore()
const time  = ref('')
let pollInterval: ReturnType<typeof setInterval>

onMounted(() => {
  store.load()
  
  // Real-time polling every 3 seconds for the kitchen
  pollInterval = setInterval(() => {
    store.load()
  }, 3000)

  const tick = () => { time.value = new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) }
  tick()
  setInterval(tick, 1000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

const elapsed = (createdAt: string) => {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  return diff < 1 ? 'Just now' : `${diff}m ago`
}
</script>

<style scoped>
.kitchen-page { padding:24px; display:flex; flex-direction:column; gap:24px; min-height:100vh; }

.kitchen-header { display:flex; align-items:center; justify-content:space-between; }
.kh-left { display:flex; align-items:center; gap:16px; }
.kitchen-title { font-size:24px; font-weight:800; }
.live-badge { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:var(--color-success); background:rgba(76,175,80,.12); padding:4px 12px; border-radius:100px; }
.live-dot { width:7px; height:7px; background:var(--color-success); border-radius:50%; animation:pulse 1.5s infinite; }
.kh-right { font-size:20px; font-weight:600; font-family:monospace; }

.empty-kitchen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:80px; }
.empty-icon { color:var(--color-success); opacity:0.8; }
.empty-kitchen h2 { font-size:24px; font-weight:700; }
.flex-align { display:flex; align-items:center; gap:6px; }
.text-primary { color:var(--color-primary); }

.orders-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; align-items:start; }

.order-ticket {
  background:var(--color-surface); border:2px solid var(--color-border);
  border-radius:var(--radius-lg); padding:20px; display:flex; flex-direction:column; gap:14px;
  transition:all var(--transition);
}
.ticket-pending   { border-color:var(--status-pending); }
.ticket-preparing { border-color:var(--status-preparing); background:rgba(200,134,10,.04); }

.ticket-header { display:flex; justify-content:space-between; align-items:center; }
.ticket-id { font-size:20px; font-weight:800; font-family:monospace; letter-spacing:.04em; }
.ticket-meta { display:flex; justify-content:space-between; font-size:13px; }

.ticket-items { list-style:none; display:flex; flex-direction:column; gap:8px; border-top:1px solid var(--color-border); padding-top:12px; }
.ticket-item { display:flex; align-items:baseline; gap:10px; font-size:14px; }
.ti-qty { font-weight:800; color:var(--color-accent); min-width:24px; }
.ti-name { font-weight:500; flex:1; }
.ti-note { font-size:11px; color:var(--color-muted); background:var(--color-surface-2); padding:2px 8px; border-radius:4px; }

.ticket-actions { border-top:1px solid var(--color-border); padding-top:12px; }
.action-btn { width:100%; padding:12px; font-size:14px; }

.loading-state { display:flex; align-items:center; gap:12px; padding:40px; color:var(--color-muted); }
.spinner { width:20px; height:20px; border:2px solid var(--color-border); border-top-color:var(--color-primary); border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
</style>
