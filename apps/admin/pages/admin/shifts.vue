<template>
  <div class="ops-page">
    <header class="ops-header">
      <div>
        <h1 class="ops-title">Shifts</h1>
        <p class="text-muted">Track cashier sessions, sales, and cash difference</p>
      </div>
      <span class="shift-badge" :class="shiftStore.isOpen ? 'open' : 'closed'">
        {{ shiftStore.isOpen ? 'Shift Open' : 'No Active Shift' }}
      </span>
    </header>

    <section class="card shift-panel">
      <template v-if="shiftStore.currentShift">
        <div>
          <h2>{{ shiftStore.currentShift.name }}</h2>
          <p class="text-muted">Opened by {{ shiftStore.currentShift.openedBy }} · {{ shiftStore.currentDuration }}</p>
        </div>
        <div class="shift-stats">
          <div><span class="label">Orders</span><strong>{{ currentShiftOrders.length }}</strong></div>
          <div><span class="label">Sales</span><strong>{{ currencyStore.format(currentShiftSales) }}</strong></div>
          <div><span class="label">Opening Cash</span><strong>{{ currencyStore.format(shiftStore.currentShift.openingCash) }}</strong></div>
        </div>
        <div class="close-form">
          <input v-model.number="closingCash" type="number" min="0" step="0.01" placeholder="Closing cash" />
          <input v-model="closeNote" placeholder="Closing note" />
          <button class="btn btn-danger" @click="closeShift">Close Shift</button>
        </div>
      </template>

      <template v-else>
        <div>
          <h2>Start Shift</h2>
          <p class="text-muted">Open a morning, afternoon, or night shift before service.</p>
        </div>
        <div class="start-form">
          <input v-model="shiftName" placeholder="Morning Shift" />
          <input v-model.number="openingCash" type="number" min="0" step="0.01" placeholder="Opening cash" />
          <button class="btn btn-primary" @click="startShift">Start Shift</button>
        </div>
      </template>
    </section>

    <section class="card table-card">
      <div class="table-header"><h2>Shift History</h2></div>
      <table class="ops-table">
        <thead>
          <tr>
            <th>Shift</th>
            <th>Opened</th>
            <th>Closed</th>
            <th>Orders</th>
            <th>Sales</th>
            <th>Cash Diff</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shift in shiftStore.shiftHistory" :key="shift.id">
            <td><strong>{{ shift.name }}</strong><span class="subtle">{{ shift.openedBy }}</span></td>
            <td>{{ formatDateTime(shift.openedAt) }}</td>
            <td>{{ shift.closedAt ? formatDateTime(shift.closedAt) : '-' }}</td>
            <td>{{ shift.orderCount }}</td>
            <td>{{ currencyStore.format(shift.totalSales) }}</td>
            <td>{{ currencyStore.format((shift.closingCash ?? 0) - shift.openingCash - shift.totalSales) }}</td>
          </tr>
          <tr v-if="shiftStore.shiftHistory.length === 0">
            <td colspan="6" class="empty-row">No closed shifts yet.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const shiftStore = useShiftStore()
const orderStore = useOrderStore()
const currencyStore = useCurrencyStore()
const authStore = useAuthStore()

const shiftName = ref('Morning Shift')
const openingCash = ref(0)
const closingCash = ref(0)
const closeNote = ref('')

const currentShiftOrders = computed(() => {
  const shiftId = shiftStore.currentShiftId
  return shiftId ? orderStore.completedOrders.filter(order => order.shiftId === shiftId) : []
})
const currentShiftSales = computed(() => currentShiftOrders.value.reduce((sum, order) => sum + order.total, 0))

const startShift = () => {
  shiftStore.startShift(shiftName.value || 'Shift', authStore.user?.name || 'Admin', openingCash.value || 0)
}
const closeShift = () => {
  shiftStore.closeShift(currentShiftOrders.value.length, currentShiftSales.value, closingCash.value || 0, closeNote.value || undefined)
  closingCash.value = 0
  closeNote.value = ''
}
const formatDateTime = (value: string) => new Date(value).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
</script>

<style scoped>
.ops-page { padding:28px; display:flex; flex-direction:column; gap:20px; flex:1; overflow-y:auto; }
.ops-header { display:flex; align-items:flex-start; justify-content:space-between; }
.ops-title { font-size:26px; font-weight:800; }
.shift-badge { padding:8px 12px; border-radius:99px; font-size:12px; font-weight:800; }
.shift-badge.open { background:#dcfce7; color:#15803d; }
.shift-badge.closed { background:#fff1f2; color:#be123c; }
.shift-panel { display:flex; flex-direction:column; gap:18px; border-radius:8px; }
.shift-panel h2 { font-size:18px; margin:0 0 4px; }
.shift-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.shift-stats div { background:var(--color-surface-2); border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:4px; }
.shift-stats strong { font-size:24px; }
.label { font-size:11px; font-weight:800; color:var(--color-muted); text-transform:uppercase; }
.start-form, .close-form { display:grid; grid-template-columns:1fr 180px auto; gap:10px; }
.start-form input, .close-form input { border:1px solid var(--color-border); border-radius:8px; padding:10px 12px; font-family:var(--font); }
.table-card { padding:0; overflow:hidden; border-radius:8px; }
.table-header { padding:16px 20px; border-bottom:1px solid var(--color-border); }
.table-header h2 { font-size:16px; margin:0; }
.ops-table { width:100%; border-collapse:collapse; font-size:13px; }
.ops-table th { text-align:left; padding:10px 16px; color:var(--color-muted); background:var(--color-surface-2); font-size:11px; text-transform:uppercase; }
.ops-table td { padding:12px 16px; border-top:1px solid var(--color-border); }
.subtle { display:block; color:var(--color-muted); font-size:11px; }
.empty-row { text-align:center; color:var(--color-muted); padding:28px; }
</style>
