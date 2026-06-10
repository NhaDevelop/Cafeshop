<template>
  <div class="daily-sales-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">Daily Sales Report</h2>
        <p class="panel-date text-muted">{{ todayLabel }}</p>
      </div>
      <div class="session-badge" :class="shopStore.isOpen ? 'open' : 'closed'">
        <span class="badge-dot" />
        {{ shopStore.isOpen ? 'Shop Open' : 'Shop Closed' }}
      </div>
    </div>

    <!-- Summary Stats Row -->
    <div class="stats-row">
      <div class="stat-mini card">
        <ShoppingBag :size="20" class="text-primary" />
        <div>
          <div class="stat-val">{{ todayOrders.length }}</div>
          <div class="stat-lbl text-muted">Orders</div>
        </div>
      </div>
      <div class="stat-mini card">
        <DollarSign :size="20" class="text-primary" />
        <div>
          <div class="stat-val">{{ currencyStore.format(totalRevenue) }}</div>
          <div class="stat-lbl text-muted">Revenue</div>
        </div>
      </div>
      <div class="stat-mini card">
        <Package :size="20" class="text-primary" />
        <div>
          <div class="stat-val">{{ totalItemsSold }}</div>
          <div class="stat-lbl text-muted">Items Sold</div>
        </div>
      </div>
      <div class="stat-mini card">
        <TrendingUp :size="20" class="text-primary" />
        <div>
          <div class="stat-val">{{ currencyStore.format(avgOrderValue) }}</div>
          <div class="stat-lbl text-muted">Avg Order</div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-nav">
      <button class="tab-btn" :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
        Order History (Receipts)
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">
        Products Sold
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="tab-content">
      <!-- Products Tab -->
      <div v-show="activeTab === 'products'" class="card sales-table-card">
        <div class="table-head">
          <h3 class="table-title">Product Sales Detail</h3>
          <span class="text-muted" style="font-size:12px">{{ productSales.length }} products sold</span>
        </div>
        <div v-if="productSales.length === 0" class="empty-state">
          <ShoppingBag :size="40" class="text-muted" style="opacity:0.3" />
          <p class="text-muted">No sales recorded yet today.</p>
        </div>
        <table v-else class="sales-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in productSales" :key="p.name" class="sales-row">
              <td><span class="rank-badge">{{ i + 1 }}</span></td>
              <td>
                <div class="prod-cell">
                  <div class="prod-dot" :style="{ background: rankColor(i) }" />
                  <span class="prod-name">{{ p.name }}</span>
                  <span v-if="p.size" class="size-tag">{{ p.size }}</span>
                </div>
              </td>
              <td><span class="qty-badge">×{{ p.quantity }}</span></td>
              <td class="text-muted">{{ currencyStore.format(p.unitPrice) }}</td>
              <td class="rev-cell">{{ currencyStore.format(p.revenue) }}</td>
              <td>
                <div class="share-bar-wrap">
                  <div class="share-bar" :style="{ width: sharePercent(p.revenue) + '%' }" />
                  <span class="share-pct">{{ sharePercent(p.revenue).toFixed(0) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2"><strong>TOTAL</strong></td>
              <td><strong>{{ totalItemsSold }}</strong></td>
              <td>–</td>
              <td><strong class="text-primary">{{ currencyStore.format(totalRevenue) }}</strong></td>
              <td><strong>100%</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Orders Tab (Grid) -->
      <div v-show="activeTab === 'orders'" class="orders-tab">
        <div v-if="groupedOrders.length === 0" class="empty-state card">
          <p class="text-muted" style="padding:16px 0">No orders recorded.</p>
        </div>
        <div v-else class="timeline-group" v-for="group in groupedOrders" :key="group.date">
          <div class="group-date-header">
            <span>{{ group.date === orderDateKey(new Date()) ? 'Today' : group.date }}</span>
            <span class="text-muted text-xs" style="margin-left: 8px;">{{ group.orders.length }} orders</span>
          </div>
          
          <div class="orders-grid">
            <div v-for="order in group.orders" :key="order.orderId" class="receipt-card">
              <div class="receipt-head">
                <div class="text-center font-bold">Cafe NUX</div>
                <div class="text-center text-xs text-muted">Receipt #{{ order.orderId.slice(-8) }}</div>
                <div class="text-center text-xs text-muted">{{ new Date(order.timestamp).toLocaleString() }}</div>
              </div>
              <div class="receipt-items">
                <div v-for="item in order.items" :key="item.menuItemId" class="receipt-row">
                  <div class="receipt-item-name">
                    {{ item.quantity }}x {{ item.name }} <span v-if="item.size">({{ item.size }})</span>
                  </div>
                  <div>{{ currencyStore.format(item.subtotal) }}</div>
                </div>
              </div>
              <div class="receipt-foot">
                <div class="receipt-row font-bold">
                  <span>Total</span>
                  <span class="text-primary">{{ currencyStore.format(order.total) }}</span>
                </div>
                <div class="receipt-row text-xs text-muted mt-2" style="align-items: center">
                  <span class="tl-method" :class="order.paymentMethod">{{ order.paymentMethod.toUpperCase() }}</span>
                  <span>Cashier: {{ order.cashier }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ShoppingBag, DollarSign, Package, TrendingUp, ChevronDown, ChevronUp } from '@lucide/vue'
import { useOrderStore } from '../../viewmodels/pos/useOrderViewModel'
import { useShopStore } from '../../viewmodels/settings/useShopViewModel'
import { useCurrencyStore } from '../../viewmodels/settings/useCurrencyViewModel'

const orderStore = useOrderStore()
const shopStore = useShopStore()
const currencyStore = useCurrencyStore()

const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const todayOrders = computed(() => orderStore.todayOrders)
const totalRevenue = computed(() => orderStore.todayRevenue)
const totalItemsSold = computed(() => todayOrders.value.reduce((s, o) => s + o.items.reduce((ss: number, i: any) => ss + i.quantity, 0), 0))
const avgOrderValue = computed(() => todayOrders.value.length > 0 ? totalRevenue.value / todayOrders.value.length : 0)

const productSales = computed(() => {
  const map = new Map<string, { name: string; size?: string; quantity: number; revenue: number; unitPrice: number }>()
  todayOrders.value.forEach(order => {
    order.items.forEach((item: any) => {
      const key = item.name + (item.size ?? '')
      const ex = map.get(key) ?? { name: item.name, size: item.size, quantity: 0, revenue: 0, unitPrice: item.price }
      ex.quantity += item.quantity
      ex.revenue += item.subtotal
      map.set(key, ex)
    })
  })
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
})

const sharePercent = (rev: number) => totalRevenue.value > 0 ? (rev / totalRevenue.value) * 100 : 0
const rankColor = (i: number) => ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'][i] ?? '#94A3B8'
const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

const orderDateKey = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const activeTab = ref<'orders' | 'products'>('orders')

const groupedOrders = computed(() => {
  const groups: Record<string, typeof orderStore.completedOrders> = {}
  orderStore.completedOrders.forEach(order => {
    const d = order.businessDate ?? new Date(order.timestamp).toISOString().split('T')[0]
    if (!groups[d]) groups[d] = []
    groups[d].push(order)
  })
  return Object.keys(groups).sort((a,b) => b.localeCompare(a)).map(date => ({
    date,
    orders: groups[date]
  }))
})
</script>

<style scoped>
.daily-sales-panel { display:flex; flex-direction:column; gap:20px; }

.panel-header { display:flex; align-items:flex-start; justify-content:space-between; }
.panel-title { font-size:24px; font-weight:800; margin:0 0 4px; }
.panel-date { font-size:13px; margin:0; }

.session-badge { display:flex; align-items:center; gap:7px; padding:8px 14px; border-radius:20px; font-size:13px; font-weight:700; }
.session-badge.open { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
.session-badge.closed { background:#fff1f2; color:#e11d48; border:1px solid #fecdd3; }
.badge-dot { width:8px; height:8px; border-radius:50%; background:currentColor; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

.stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.stat-mini { display:flex; align-items:center; gap:12px; padding:16px; }
.stat-val { font-size:20px; font-weight:800; color:var(--color-text); }
.stat-lbl { font-size:11px; margin-top:2px; }

.sales-table-card { overflow:hidden; }
.table-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--color-border); }
.table-title { font-size:15px; font-weight:700; margin:0; }

.empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:40px; }

.sales-table { width:100%; border-collapse:collapse; font-size:13px; }
.sales-table th { text-align:left; padding:10px 16px; font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-muted); background:var(--color-surface-2); border-bottom:1px solid var(--color-border); }
.sales-row td { padding:12px 16px; border-bottom:1px solid var(--color-border); vertical-align:middle; }
.sales-row:last-child td { border-bottom:none; }
.sales-row:hover { background:var(--color-surface-2); }

.rank-badge { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:6px; background:var(--color-surface-2); font-size:11px; font-weight:800; color:var(--color-muted); }
.prod-cell { display:flex; align-items:center; gap:8px; }
.prod-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
.prod-name { font-weight:600; color:var(--color-text); }
.size-tag { font-size:10px; padding:2px 6px; background:var(--color-surface-2); border-radius:4px; color:var(--color-muted); font-weight:600; }
.qty-badge { font-weight:700; color:var(--color-text); }
.rev-cell { font-weight:700; color:var(--color-primary); }

.share-bar-wrap { display:flex; align-items:center; gap:8px; min-width:100px; }
.share-bar { height:6px; background:var(--color-primary); border-radius:3px; transition:width .4s ease; opacity:.7; }
.share-pct { font-size:11px; font-weight:700; color:var(--color-muted); min-width:28px; }

.total-row td { padding:12px 16px; border-top:2px solid var(--color-border); background:var(--color-surface-2); font-size:13px; }

/* Tabs */
.tabs-nav { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--color-border); }
.tab-btn { padding: 10px 16px; font-size: 14px; font-weight: 700; color: var(--color-muted); background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover { color: var(--color-text); }
.tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.tab-content { display: flex; flex-direction: column; gap: 20px; }

/* Grid Orders */
.orders-tab { display: flex; flex-direction: column; gap: 24px; }
.timeline-group { display: flex; flex-direction: column; gap: 16px; }
.group-date-header { font-size: 16px; font-weight: 800; color: var(--color-text); padding-bottom: 8px; border-bottom: 2px solid var(--color-border); display: flex; align-items: baseline; }
.orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

.receipt-card { background: #fff; border: 1px solid var(--color-border); border-radius: 12px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); font-family: monospace; color: #334155; display: flex; flex-direction: column; gap: 12px; transition: transform 0.2s; }
.receipt-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); border-color: #cbd5e1; }
.receipt-head { border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px; }
.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.text-xs { font-size: 10px; }
.receipt-items { display: flex; flex-direction: column; gap: 6px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px; flex: 1; }
.receipt-row { display: flex; justify-content: space-between; font-size: 12px; }
.receipt-item-name { flex: 1; padding-right: 12px; line-height: 1.4; }
.mt-2 { margin-top: 8px; }

.tl-method { font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; }
.tl-method.cash { background: #fef9c3; color: #a16207; }
.tl-method.card { background: #ede9fe; color: #6d28d9; }
.tl-method.qr { background: #dcfce7; color: #15803d; }
</style>
