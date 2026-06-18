<template>
  <div class="reports-page">
    <header class="reports-header">
      <div>
        <h1 class="reports-title">Reports</h1>
        <p class="text-muted">Sales & performance analytics</p>
      </div>
      <div class="date-range">
        <input v-model="fromDate" type="date" class="date-input" @change="loadData" />
        <span class="text-muted">→</span>
        <input v-model="toDate" type="date" class="date-input" @change="loadData" />
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner" /> Loading reports…
    </div>

    <template v-else>
      <!-- Summary Row -->
      <div class="summary-row">
        <div class="summary-card card">
          <div class="s-label text-muted">Total Revenue</div>
          <div class="s-value">${{ totalRevenue.toFixed(2) }}</div>
        </div>
        <div class="summary-card card">
          <div class="s-label text-muted">Total Orders</div>
          <div class="s-value">{{ totalOrders }}</div>
        </div>
        <div class="summary-card card">
          <div class="s-label text-muted">Avg / Day</div>
          <div class="s-value">${{ avgPerDay.toFixed(2) }}</div>
        </div>
        <div class="summary-card card">
          <div class="s-label text-muted">Best Day</div>
          <div class="s-value">{{ bestDay }}</div>
        </div>
      </div>

      <!-- Sales Table -->
      <div class="card">
        <div class="table-header">
          <h3 class="section-title">Daily Sales Breakdown</h3>
          <button class="btn btn-ghost export-btn flex-align" @click="exportCsv"><Download :size="14" class="icon-inline" /> Export CSV</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Revenue</th>
              <th>Orders</th>
              <th>Avg. Order</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in salesData" :key="i" class="table-row">
              <td>{{ formatDate(row.date) }}</td>
              <td class="text-primary">${{ row.revenue.toFixed(2) }}</td>
              <td>{{ row.orderCount }}</td>
              <td>${{ row.avgOrderValue.toFixed(2) }}</td>
              <td>
                <div class="trend-bar">
                  <div class="trend-fill" :style="{ width: trendWidth(row.revenue) + '%' }" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SalesSummary } from '@cafe-nux/types'
import { reportRepository } from '../../src/data/repositories/report.repository'
import { Download } from '@lucide/vue'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const salesData = ref<SalesSummary[]>([])
const loading   = ref(true)

const toDate   = ref(new Date().toISOString().split('T')[0])
const fromDate = ref(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])

const totalRevenue = computed(() => salesData.value.reduce((s, d) => s + d.revenue, 0))
const totalOrders  = computed(() => salesData.value.reduce((s, d) => s + d.orderCount, 0))
const avgPerDay    = computed(() => salesData.value.length ? totalRevenue.value / salesData.value.length : 0)
const maxRevenue   = computed(() => Math.max(...salesData.value.map(d => d.revenue), 1))

const bestDay = computed(() => {
  const best = [...salesData.value].sort((a, b) => b.revenue - a.revenue)[0]
  return best ? formatDate(best.date) : '—'
})

const trendWidth  = (val: number) => Math.max((val / maxRevenue.value) * 100, 2)
const formatDate  = (d: string) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' })

const loadData = async () => {
  loading.value = true
  try { salesData.value = await reportRepository.getSalesByRange(fromDate.value, toDate.value) }
  finally { loading.value = false }
}

const exportCsv = () => {
  const rows = ['Date,Revenue,Orders,Avg Order',
    ...salesData.value.map(d => `${d.date},${d.revenue},${d.orderCount},${d.avgOrderValue}`)
  ]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `sales-${fromDate.value}-${toDate.value}.csv`; a.click()
}

onMounted(loadData)
</script>

<style scoped>
.reports-page { padding:28px; display:flex; flex-direction:column; gap:24px; }
.reports-header { display:flex; align-items:flex-start; justify-content:space-between; }
.reports-title { font-size:26px; font-weight:800; letter-spacing:-.02em; }
.date-range { display:flex; align-items:center; gap:10px; }
.date-input { background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius); padding:8px 12px; color:var(--color-text); font-size:13px; font-family:var(--font); outline:none; }
.date-input:focus { border-color:var(--color-primary); }

.summary-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.summary-card { }
.s-label { font-size:13px; margin-bottom:8px; }
.s-value { font-size:28px; font-weight:800; color:var(--color-accent); }

.table-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.section-title { font-size:15px; font-weight:700; }
.export-btn { font-size:12px; }
.flex-align { display:flex; align-items:center; justify-content:center; gap:6px; }

.data-table { width:100%; border-collapse:collapse; font-size:14px; }
.data-table th { text-align:left; padding:10px 12px; font-size:12px; font-weight:600; color:var(--color-muted); border-bottom:1px solid var(--color-border); }
.table-row td { padding:12px; border-bottom:1px solid var(--color-border); }
.table-row:last-child td { border-bottom:none; }
.table-row:hover { background:var(--color-surface-2); }
.trend-bar { height:6px; background:var(--color-surface-3); border-radius:3px; overflow:hidden; width:100px; }
.trend-fill { height:100%; background:linear-gradient(to right,var(--color-primary),var(--color-accent)); border-radius:3px; transition:width .4s ease; }

.loading-state { display:flex; align-items:center; gap:12px; padding:40px; color:var(--color-muted); }
.spinner { width:20px; height:20px; border:2px solid var(--color-border); border-top-color:var(--color-primary); border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
</style>
