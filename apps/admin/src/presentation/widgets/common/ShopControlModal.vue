<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal-box card fade-in">

        <!-- OPEN SHOP view -->
        <template v-if="mode === 'open'">
          <div class="modal-head open">
            <div class="status-icon open-icon"><Store :size="32" /></div>
            <h2>Open Shop</h2>
            <p class="text-muted">Start a new session for today</p>
          </div>
          <div class="modal-body">
            <div class="info-row">
              <Clock :size="16" class="text-muted" />
              <span>Opening time: <strong>{{ nowStr }}</strong></span>
            </div>
            <div class="info-row">
              <User :size="16" class="text-muted" />
              <span>Cashier: <strong>{{ cashierName }}</strong></span>
            </div>
            <div class="info-row">
              <CalendarDays :size="16" class="text-muted" />
              <span>Business day: <strong>{{ businessDateLabel }}</strong></span>
            </div>
            <div class="form-group">
              <label>Opening Note (optional)</label>
              <textarea v-model="openingNote" rows="2" placeholder="e.g. Stocked up, ready for service…" />
            </div>
          </div>
          <div class="modal-foot">
            <button class="btn btn-ghost" @click="$emit('update:modelValue', false)">Cancel</button>
            <button class="btn open-btn" @click="confirmOpen">
              <Store :size="16" /> Open Shop Now
            </button>
          </div>
        </template>

        <!-- CLOSE SHOP view -->
        <template v-else>
          <div class="modal-head close">
            <div class="status-icon close-icon"><BadgeX :size="32" /></div>
            <h2>Close Shop</h2>
            <p class="text-muted">End of day summary</p>
          </div>
          <div class="modal-body">

            <!-- Session summary stats -->
            <div class="info-row">
              <CalendarDays :size="16" class="text-muted" />
              <span>Closing day: <strong>{{ businessDateLabel }}</strong></span>
            </div>
            <div class="summary-grid">
              <div class="sum-card">
                <span class="sum-label">Orders Today</span>
                <span class="sum-val">{{ summary.orderCount }}</span>
              </div>
              <div class="sum-card">
                <span class="sum-label">Revenue</span>
                <span class="sum-val accent">{{ currencyStore.format(summary.revenue) }}</span>
              </div>
              <div class="sum-card">
                <span class="sum-label">Items Sold</span>
                <span class="sum-val">{{ summary.itemCount }}</span>
              </div>
              <div class="sum-card">
                <span class="sum-label">Session Time</span>
                <span class="sum-val">{{ shopStore.openDuration }}</span>
              </div>
            </div>

            <!-- Top products -->
            <div class="top-section">
              <h4 class="section-title">Top Products Today</h4>
              <div v-for="(p, i) in summary.topProducts" :key="p.name" class="product-row">
                <span class="rank">#{{ i + 1 }}</span>
                <span class="p-name">{{ p.name }}</span>
                <span class="p-qty text-muted">×{{ p.quantity }}</span>
                <span class="p-rev accent">{{ currencyStore.format(p.revenue) }}</span>
              </div>
              <p v-if="summary.topProducts.length === 0" class="text-muted empty-msg">No sales recorded today.</p>
            </div>

            <div class="form-group">
              <label>Closing Note (optional)</label>
              <textarea v-model="closingNote" rows="2" placeholder="e.g. Busy Saturday, ran out of croissants…" />
            </div>
            <p v-if="cartStore.items.length > 0" class="cart-warning">
              Current unpaid cart will be cleared when the shop closes.
            </p>
          </div>
          <div class="modal-foot">
            <button class="btn btn-ghost" @click="$emit('update:modelValue', false)">Cancel</button>
            <button class="btn close-btn" @click="confirmClose">
              <BadgeX :size="16" /> Close Shop
            </button>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Store, BadgeX, Clock, User, CalendarDays } from '@lucide/vue'
import { useShopStore } from '../../viewmodels/settings/useShopViewModel'
import { useOrderStore } from '../../viewmodels/pos/useOrderViewModel'
import { useCurrencyStore } from '../../viewmodels/settings/useCurrencyViewModel'

defineProps<{ modelValue: boolean; mode: 'open' | 'close' }>()
const emit = defineEmits(['update:modelValue', 'opened', 'closed'])

const shopStore = useShopStore()
const orderStore = useOrderStore()
const currencyStore = useCurrencyStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const openingNote = ref('')
const closingNote = ref('')

const nowStr = computed(() =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
)
const cashierName = computed(() => authStore.user?.name ?? 'Admin')
const businessDate = computed(() => shopStore.currentBusinessDate)
const businessDateLabel = computed(() =>
  new Date(`${businessDate.value}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
)

const summary = computed(() => {
  const orders = orderStore.ordersByDate(businessDate.value)
  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>()
  let itemCount = 0
  orders.forEach(order => {
    order.items.forEach((item: any) => {
      itemCount += item.quantity
      const existing = productMap.get(item.name) ?? { name: item.name, quantity: 0, revenue: 0 }
      existing.quantity += item.quantity
      existing.revenue += item.subtotal
      productMap.set(item.name, existing)
    })
  })
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
  return {
    orderCount: orders.length,
    revenue: orderStore.revenueByDate(businessDate.value),
    itemCount,
    topProducts
  }
})

const confirmOpen = () => {
  shopStore.openShop(cashierName.value, openingNote.value || undefined)
  openingNote.value = ''
  emit('opened')
  emit('update:modelValue', false)
}

const confirmClose = () => {
  shopStore.closeShop(summary.value.orderCount, summary.value.revenue, closingNote.value || undefined)
  cartStore.clearCart()
  closingNote.value = ''
  emit('closed')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:2000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
.modal-box { width:100%; max-width:480px; max-height:90vh; overflow-y:auto; border-radius:16px; padding:0; }

.modal-head { display:flex; flex-direction:column; align-items:center; gap:8px; padding:28px 28px 20px; text-align:center; border-bottom:1px solid var(--color-border); }
.modal-head h2 { font-size:22px; font-weight:800; margin:0; }
.modal-head p { margin:0; font-size:13px; }
.modal-head.open { background:linear-gradient(135deg, #f0fdf4, #dcfce7); }
.modal-head.close { background:linear-gradient(135deg, #fff7ed, #fed7aa); }

.status-icon { width:64px; height:64px; border-radius:16px; display:flex; align-items:center; justify-content:center; }
.open-icon { background:#16a34a; color:white; }
.close-icon { background:#ea580c; color:white; }

.modal-body { padding:20px 28px; display:flex; flex-direction:column; gap:16px; }
.info-row { display:flex; align-items:center; gap:8px; font-size:14px; background:var(--color-surface-2); padding:10px 14px; border-radius:8px; }

.summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.sum-card { background:var(--color-surface-2); border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:4px; }
.sum-label { font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-muted); }
.sum-val { font-size:22px; font-weight:800; color:var(--color-text); }
.sum-val.accent { color:var(--color-primary); }

.section-title { font-size:13px; font-weight:700; color:var(--color-muted); text-transform:uppercase; letter-spacing:.5px; margin:0 0 8px; }
.product-row { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; background:var(--color-surface-2); font-size:13px; }
.rank { font-size:12px; font-weight:800; color:var(--color-dim); width:22px; }
.p-name { flex:1; font-weight:600; }
.p-qty { font-size:12px; }
.p-rev { font-weight:700; font-size:13px; }
.accent { color:var(--color-primary); }
.empty-msg { text-align:center; padding:16px 0; font-size:13px; }
.cart-warning { margin:0; padding:10px 12px; border-radius:8px; background:#fff1f2; color:#be123c; border:1px solid #fecdd3; font-size:12px; font-weight:700; }

.form-group { display:flex; flex-direction:column; gap:6px; }
.form-group label { font-size:12px; font-weight:700; color:var(--color-muted); }
.form-group textarea { padding:10px 12px; border:1px solid var(--color-border); border-radius:8px; font-family:var(--font); font-size:13px; resize:none; outline:none; background:var(--color-surface); color:var(--color-text); }
.form-group textarea:focus { border-color:var(--color-primary); }

.modal-foot { padding:16px 28px 24px; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid var(--color-border); }
.open-btn { background:#16a34a; color:white; padding:12px 20px; border-radius:8px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; }
.close-btn { background:#ea580c; color:white; padding:12px 20px; border-radius:8px; font-weight:700; font-size:14px; display:flex; align-items:center; gap:8px; }
.open-btn:hover { background:#15803d; }
.close-btn:hover { background:#c2410c; }

.modal-enter-active, .modal-leave-active { transition:all .25s ease; }
.modal-enter-from, .modal-leave-to { opacity:0; transform:scale(0.96); }
</style>
