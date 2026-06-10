<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-box full-modal">
        <div class="modal-head">
          <h3><ArrowRightLeft :size="20" class="icon-inline" /> Transaction History</h3>
          <button class="modal-close" @click="close"><X :size="24" /></button>
        </div>
        
        <div class="modal-body tx-body">
          <!-- Summary Bar -->
          <div class="stats-bar">
            <div class="stat-card">
              <span class="s-label">Total Orders (Today)</span>
              <span class="s-val">{{ stats.totalOrders }}</span>
            </div>
            <div class="stat-card">
              <span class="s-label">Total Revenue</span>
              <span class="s-val text-success">${{ stats.revenue.toFixed(2) }}</span>
            </div>
            <div class="stat-card">
              <span class="s-label">Avg Order Value</span>
              <span class="s-val">${{ stats.avgOrder.toFixed(2) }}</span>
            </div>
            <div class="stat-card">
              <span class="s-label">Voided</span>
              <span class="s-val text-danger">{{ stats.voidedOrders }}</span>
            </div>
          </div>

          <!-- Filters -->
          <div class="filters-row">
            <div class="filter-group">
              <label>Status</label>
              <select v-model="filterStatus">
                <option value="All">All Status</option>
                <option value="completed">Completed</option>
                <option value="voided">Voided</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Payment Method</label>
              <select v-model="filterPayment">
                <option value="All">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Points">Points</option>
              </select>
            </div>
            <div class="filter-actions">
              <button class="btn btn-outline" @click="exportCSV"><Download :size="16" class="icon-inline"/> Export CSV</button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-wrap">
            <table class="tx-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Time</th>
                  <th>Cashier</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="tx in paginatedTxs" :key="tx.orderId">
                  <tr @click="expandedRow = expandedRow === tx.orderId ? null : tx.orderId" class="tx-tr">
                    <td class="font-bold">{{ tx.orderId }}</td>
                    <td>{{ new Date(tx.timestamp).toLocaleTimeString() }}</td>
                    <td>{{ tx.cashier }}</td>
                    <td>{{ tx.items.reduce((s,i) => s + i.quantity, 0) }} items</td>
                    <td class="font-bold">${{ tx.total.toFixed(2) }}</td>
                    <td>{{ tx.paymentMethod || '-' }}</td>
                    <td><span class="badge" :class="tx.status">{{ tx.status }}</span></td>
                    <td class="text-right">
                      <ChevronDown :size="16" :class="{ 'rotate-180': expandedRow === tx.orderId }" class="expand-icon" />
                    </td>
                  </tr>
                  <tr v-if="expandedRow === tx.orderId" class="expanded-tr">
                    <td colspan="8">
                      <div class="expanded-content">
                        <h4>Order Details</h4>
                        <div class="item-list">
                          <div v-for="item in tx.items" :key="item.menuItemId" class="e-item">
                            <span>{{ item.quantity }}x {{ item.name }}</span>
                            <span>${{ item.subtotal.toFixed(2) }}</span>
                          </div>
                        </div>
                        <div class="e-totals" v-if="tx.status === 'completed'">
                          <span>Change Given: ${{ tx.change.toFixed(2) }}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
                <tr v-if="filteredTxs.length === 0">
                  <td colspan="8" class="text-center py-8 text-muted">No transactions found</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <span class="text-muted">Showing {{ pageStart }} - {{ pageEnd }} of {{ filteredTxs.length }}</span>
            <div class="page-controls">
              <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">Prev</button>
              <button class="page-btn" :disabled="currentPage === totalPages || totalPages === 0" @click="currentPage++">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowRightLeft, X, Download, ChevronDown } from '@lucide/vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

const orderStore = useOrderStore()

const filterStatus = ref('All')
const filterPayment = ref('All')
const currentPage = ref(1)
const rowsPerPage = 10
const expandedRow = ref<string | null>(null)

const allTxs = computed(() => {
  return [...orderStore.completedOrders, ...orderStore.voidedOrders].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const stats = computed(() => {
  const completed = orderStore.todayOrders
  const voided = orderStore.voidedOrders.filter(o => new Date(o.timestamp).toLocaleDateString() === new Date().toLocaleDateString())
  const rev = completed.reduce((s, o) => s + o.total, 0)
  return {
    totalOrders: completed.length,
    revenue: rev,
    avgOrder: completed.length ? rev / completed.length : 0,
    voidedOrders: voided.length
  }
})

const filteredTxs = computed(() => {
  return allTxs.value.filter(tx => {
    if (filterStatus.value !== 'All' && tx.status !== filterStatus.value) return false
    if (filterPayment.value !== 'All' && tx.paymentMethod !== filterPayment.value) return false
    return true
  })
})

const totalPages = computed(() => Math.ceil(filteredTxs.value.length / rowsPerPage))
const paginatedTxs = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  return filteredTxs.value.slice(start, start + rowsPerPage)
})
const pageStart = computed(() => filteredTxs.value.length ? (currentPage.value - 1) * rowsPerPage + 1 : 0)
const pageEnd = computed(() => Math.min(currentPage.value * rowsPerPage, filteredTxs.value.length))

const exportCSV = () => {
  const rows = [['Order ID', 'Date', 'Cashier', 'Status', 'Payment Method', 'Total', 'Items']]
  filteredTxs.value.forEach(tx => {
    const items = tx.items.map((i: any) => `${i.quantity}x ${i.name}`).join(' | ')
    rows.push([tx.orderId, tx.timestamp, tx.cashier, tx.status, tx.paymentMethod || '', tx.total.toString(), items])
  })
  
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `transactions_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.full-modal { width: 90vw; height: 90vh; background: #F8FAFC; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.2); }
.modal-head { padding: 24px 32px; background: white; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
.modal-head h3 { font-size: 20px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 12px; color: #1E293B; }
.modal-close { background: transparent; border: none; cursor: pointer; color: #64748B; transition: color 0.2s; }
.modal-close:hover { color: #EF4444; }

.tx-body { flex: 1; overflow-y: auto; padding: 24px 32px; display: flex; flex-direction: column; gap: 24px; }

.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.s-label { font-size: 13px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
.s-val { font-size: 28px; font-weight: 900; color: #1E293B; }
.text-success { color: #10B981; }
.text-danger { color: #EF4444; }

.filters-row { display: flex; gap: 16px; align-items: flex-end; background: white; padding: 16px; border-radius: 12px; border: 1px solid var(--color-border); }
.filter-group { display: flex; flex-direction: column; gap: 6px; }
.filter-group label { font-size: 12px; font-weight: 600; color: #475569; }
.filter-group select { padding: 10px 16px; border-radius: 8px; border: 1px solid var(--color-border); background: #F8FAFC; outline: none; font-size: 14px; min-width: 150px; }
.filter-actions { margin-left: auto; }
.btn-outline { background: white; border: 1px solid var(--color-border); padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.btn-outline:hover { background: #F1F5F9; }

.table-wrap { flex: 1; background: white; border-radius: 12px; border: 1px solid var(--color-border); overflow-x: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.tx-table { width: 100%; border-collapse: collapse; text-align: left; }
.tx-table th { padding: 16px; font-size: 13px; font-weight: 700; color: #64748B; border-bottom: 1px solid var(--color-border); background: #F8FAFC; text-transform: uppercase; letter-spacing: 0.5px; }
.tx-table td { padding: 16px; font-size: 14px; border-bottom: 1px solid var(--color-border); color: #334155; }
.tx-tr { cursor: pointer; transition: background 0.2s; }
.tx-tr:hover { background: #F8FAFC; }
.font-bold { font-weight: 700; color: #1E293B; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.badge.completed { background: #D1FAE5; color: #059669; }
.badge.voided { background: #FEE2E2; color: #DC2626; }
.expand-icon { color: #94A3B8; transition: transform 0.2s; }
.rotate-180 { transform: rotate(180deg); }
.text-right { text-align: right; }
.text-center { text-align: center; }

.expanded-tr { background: #F8FAFC; }
.expanded-tr td { padding: 0; }
.expanded-content { padding: 24px; border-bottom: 1px solid var(--color-border); }
.expanded-content h4 { margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #1E293B; }
.item-list { display: flex; flex-direction: column; gap: 8px; max-width: 400px; margin-bottom: 16px; }
.e-item { display: flex; justify-content: space-between; font-size: 13px; color: #475569; padding-bottom: 8px; border-bottom: 1px dashed var(--color-border); }
.e-totals { font-weight: 600; font-size: 13px; color: #1E293B; }

.pagination { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 12px; border: 1px solid var(--color-border); }
.page-controls { display: flex; gap: 8px; }
.page-btn { padding: 8px 16px; background: white; border: 1px solid var(--color-border); border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-btn:not(:disabled):hover { background: #F1F5F9; }
.text-muted { color: #64748B; }

.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.98) translateY(10px); }
</style>
