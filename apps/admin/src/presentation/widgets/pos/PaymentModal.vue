<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-box payment-modal">
        <div class="modal-head">
          <h3><CreditCard :size="18" class="icon-inline" /> Payment</h3>
          <button class="modal-close" @click="close"><X :size="20" /></button>
        </div>
        
        <div class="modal-body payment-body">
          <div v-if="!shopStore.isOpen" class="shop-closed-warning">
            Shop is closed. Open shop before confirming payment.
          </div>
          <div class="payment-layout">
            <!-- Left: Order Summary -->
            <div class="order-summary-pane">
              <h4>Order Summary</h4>
              <div class="receipt-info">
                <div v-if="cartStore.tableNumber" class="receipt-info-row">
                  <span class="text-muted">Table:</span> 
                  <strong>{{ cartStore.tableNumber }}</strong>
                </div>
                <div v-if="cartStore.customerPhone" class="receipt-info-row">
                  <span class="text-muted">Customer:</span> 
                  <strong>{{ cartStore.customerPhone }}</strong>
                </div>
                <div class="receipt-info-row">
                  <span class="text-muted">Time:</span> 
                  <strong>{{ new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}</strong>
                </div>
              </div>
              <div class="summary-items">
                <div v-for="item in cartStore.items" :key="item.id" class="s-item">
                  <div class="s-item-name-wrap">
                    <div class="s-item-name">
                      {{ item.quantity }}x {{ item.name }}
                      <span v-if="item.size" class="s-item-size">{{ item.size }}</span>
                    </div>
                    <div class="s-item-options" v-if="item.sugarLevel || item.iceLevel || item.modifiers?.length">
                      <span v-if="item.sugarLevel">Sugar {{item.sugarLevel}}</span>
                      <span v-if="item.iceLevel">{{item.iceLevel}}</span>
                      <span v-for="m in item.modifiers" :key="m.id">+{{m.name}}</span>
                    </div>
                    <div class="s-item-options text-danger" v-if="item.itemDiscount && item.itemDiscount > 0">
                      Discount: -${{ item.itemDiscount.toFixed(2) }}
                    </div>
                  </div>
                  <div class="s-item-price">${{ item.subtotal.toFixed(2) }}</div>
                </div>
              </div>
              <div class="summary-totals">
                <div class="s-row"><span class="text-muted">Subtotal</span><span>${{ cartStore.subtotal.toFixed(2) }}</span></div>
                <div class="s-row"><span class="text-muted">Tax (10%)</span><span>${{ cartStore.tax.toFixed(2) }}</span></div>
                <div class="s-row" v-if="cartStore.discount > 0"><span class="text-danger">Discount</span><span class="text-danger">-${{ cartStore.discount.toFixed(2) }}</span></div>
                <div class="s-row s-grand-total"><span>Total</span><span class="text-primary">${{ cartStore.total.toFixed(2) }}</span></div>
                
                <div class="s-row text-success" v-if="amountPaid > 0">
                  <span>Paid So Far</span>
                  <span>-${{ amountPaid.toFixed(2) }}</span>
                </div>
                <div class="s-row s-remaining-total" v-if="remainingBalance > 0">
                  <span>Remaining</span>
                  <span class="text-danger">${{ remainingBalance.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Payment Input -->
            <div class="payment-input-pane">
              <h4>Payment Method</h4>
              <div class="method-pills">
                <button v-for="m in methods" :key="m.id" class="method-card" :class="{ active: selectedMethod === m.id }" @click="selectedMethod = m.id">
                  <div class="method-icon-wrap" :class="selectedMethod === m.id ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-500'">
                    <component :is="m.icon" :size="24" />
                  </div>
                  <span class="method-name">{{ m.label }}</span>
                </button>
              </div>

              <div class="tendered-section" v-if="selectedMethod === 'cash'">
                <label>Amount Tendered</label>
                <div class="tendered-input-wrap">
                  <span class="currency-symbol">$</span>
                  <input ref="tenderedInput" v-model.number="amountTendered" type="number" step="0.01" class="tendered-input" />
                </div>
                
                <div class="quick-cash">
                  <button v-for="amt in quickAmounts" :key="amt" @click="amountTendered = amt" class="quick-amt-btn">${{ amt }}</button>
                  <button @click="amountTendered = cartStore.total" class="quick-amt-btn exact-btn">Exact</button>
                </div>

                <div class="change-display" :class="{ 'text-danger': currentChange < 0, 'text-success': currentChange >= 0 }">
                  <span>Change:</span>
                  <span class="change-amount">${{ currentChange >= 0 ? currentChange.toFixed(2) : '0.00' }}</span>
                </div>
                <div v-if="currentChange < 0" class="insufficient-warning">Insufficient funds</div>
              </div>

              <div class="add-payment-actions" v-if="remainingBalance > 0">
                <button class="btn btn-primary add-pay-btn" :disabled="!canAddPayment" @click="addPayment">
                  <Plus :size="16" class="icon-inline" /> Add Payment
                </button>
              </div>

              <!-- Payments List -->
              <div v-if="payments.length > 0" class="payments-list">
                <h4>Payments Received</h4>
                <div v-for="p in payments" :key="p.id" class="payment-item">
                  <div class="pi-left">
                    <span class="pi-method">{{ p.method }}</span>
                    <span v-if="p.change > 0" class="pi-change">(Change: ${{ p.change.toFixed(2) }})</span>
                  </div>
                  <div class="pi-right">
                    <strong>${{ p.amount.toFixed(2) }}</strong>
                    <button class="pi-remove" @click="removePayment(p.id)"><X :size="14" /></button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="modal-footer payment-footer">
          <button class="btn btn-ghost" @click="close">Cancel</button>
          <button class="btn btn-primary confirm-btn" :disabled="!isValid" @click="confirmPayment">
            Complete Order <span v-if="!isValid && remainingBalance > 0">(${{ remainingBalance.toFixed(2) }} left)</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { CreditCard, X, Plus, Banknote, QrCode, Star } from '@lucide/vue'
import { useAuthStore } from '../../viewmodels/auth/useAuthViewModel'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'completed'])

const cartStore = useCartStore()
const orderStore = useOrderStore()
const shopStore = useShopStore()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()
const shiftStore = useShiftStore()
const loyaltyStore = useLoyaltyStore()

const methods = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'qr', label: 'KHQR', icon: QrCode },
  { id: 'points', label: 'Points', icon: Star },
]
const selectedMethod = ref('cash')
const amountTendered = ref(0)
const tenderedInput = ref<HTMLInputElement | null>(null)

interface LocalPayment { id: string, method: string, amount: number, tendered: number, change: number }
const payments = ref<LocalPayment[]>([])

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    payments.value = []
    selectedMethod.value = 'cash'
    amountTendered.value = remainingBalance.value
    nextTick(() => {
      tenderedInput.value?.focus()
      tenderedInput.value?.select()
    })
  }
})

const amountPaid = computed(() => payments.value.reduce((sum, p) => sum + p.amount, 0))
const remainingBalance = computed(() => Math.max(0, cartStore.total - amountPaid.value))

const quickAmounts = computed(() => {
  const t = remainingBalance.value
  if (t === 0) return []
  const ceil5 = Math.ceil(t / 5) * 5
  const ceil10 = Math.ceil(t / 10) * 10
  const ceil20 = Math.ceil(t / 20) * 20
  const ceil50 = Math.ceil(t / 50) * 50
  const ceil100 = Math.ceil(t / 100) * 100
  return Array.from(new Set([ceil5, ceil10, ceil20, ceil50, ceil100])).filter(v => v >= t).slice(0, 4)
})

const currentChange = computed(() => {
  if (selectedMethod.value !== 'cash') return 0
  return Math.max(0, amountTendered.value - remainingBalance.value)
})

const canAddPayment = computed(() => {
  if (!shopStore.isOpen) return false
  if (remainingBalance.value <= 0) return false
  if (amountTendered.value <= 0) return false
  return true
})

const addPayment = () => {
  if (!canAddPayment.value) return
  
  const paymentAmount = Math.min(amountTendered.value, remainingBalance.value)
  const changeGiven = selectedMethod.value === 'cash' ? Math.max(0, amountTendered.value - remainingBalance.value) : 0

  const methodLabel = methods.find(m => m.id === selectedMethod.value)?.label || 'Unknown'

  payments.value.push({
    id: `pay_${Date.now().toString(36)}`,
    method: methodLabel,
    amount: paymentAmount,
    tendered: amountTendered.value,
    change: changeGiven
  })

  amountTendered.value = remainingBalance.value
  nextTick(() => {
    if (remainingBalance.value > 0) {
      tenderedInput.value?.focus()
      tenderedInput.value?.select()
    }
  })
}

const removePayment = (id: string) => {
  payments.value = payments.value.filter(p => p.id !== id)
  amountTendered.value = remainingBalance.value
}

const isValid = computed(() => {
  return shopStore.isOpen && cartStore.items.length > 0 && remainingBalance.value <= 0
})

const close = () => emit('update:modelValue', false)

const confirmPayment = () => {
  if (!isValid.value) return

  const totalChange = payments.value.reduce((sum, p) => sum + p.change, 0)
  
  const newOrder = {
    orderId: `ORD-${Date.now().toString().slice(-6)}`,
    items: JSON.parse(JSON.stringify(cartStore.items)),
    total: cartStore.total,
    paymentMethod: payments.value.length === 1 ? payments.value[0].method : 'Split Payment',
    payments: payments.value.map(p => ({
      id: p.id,
      amount: p.amount,
      method: p.method as any,
      timestamp: new Date().toISOString()
    })),
    cashier: authStore.user?.name || 'Admin',
    timestamp: new Date().toISOString(),
    businessDate: shopStore.currentBusinessDate,
    shiftId: shiftStore.currentShiftId ?? undefined,
    customerPhone: cartStore.customerPhone || undefined,
    change: totalChange,
    status: 'pending' as const,
    paymentStatus: 'paid' as const
  }

  // orderStore.addOrder(newOrder as any)
  // inventoryStore.consumeOrderItems(newOrder.items)
  if (cartStore.customerPhone) loyaltyStore.applyOrder(cartStore.customerPhone, newOrder.total)
  
  emit('completed', newOrder)
  close()
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.modal-box { background: white; border-radius: 16px; width: 700px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden; }
.modal-head { padding: 20px 24px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
.modal-head h3 { font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0; }
.modal-close { color: var(--color-muted); transition: color 0.2s; background: transparent; border: none; cursor: pointer; }
.modal-close:hover { color: var(--color-danger); }
.modal-body { flex: 1; overflow-y: auto; }
.payment-layout { display: flex; height: 100%; }
.shop-closed-warning { margin: 16px 24px 0; padding: 10px 12px; border-radius: 8px; background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; font-size: 13px; font-weight: 700; }
.order-summary-pane { width: 40%; background: #F8FAFC; padding: 24px; border-right: 1px solid var(--color-border); display: flex; flex-direction: column; }
.payment-input-pane { width: 60%; padding: 24px; display: flex; flex-direction: column; gap: 24px; }

h4 { font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 16px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px; }

.receipt-info { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed var(--color-border); display: flex; flex-direction: column; gap: 4px; }
.receipt-info-row { display: flex; justify-content: space-between; font-size: 13px; }
.receipt-info-row strong { color: #1E293B; }

.summary-items { flex: 1; overflow-y: auto; margin-bottom: 16px; border-bottom: 1px dashed var(--color-border); padding-bottom: 16px; }
.s-item { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px; color: #334155; align-items: flex-start; }
.s-item-name-wrap { display: flex; flex-direction: column; gap: 2px; flex: 1; padding-right: 12px; }
.s-item-name { font-weight: 600; color: #1E293B; line-height: 1.4; }
.s-item-options { font-size: 11px; color: #64748B; display: flex; flex-wrap: wrap; gap: 4px; }
.s-item-options span { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.s-item-size { display: inline-flex; margin-left: 4px; padding: 1px 6px; border-radius: 999px; background: #E0E7FF; color: #4338CA; font-size: 10px; font-weight: 800; vertical-align: middle; }
.s-item-price { font-weight: 700; white-space: nowrap; }

.summary-totals { display: flex; flex-direction: column; gap: 8px; }
.s-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: 500; }
.s-grand-total { font-size: 16px; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--color-border); }
.s-remaining-total { font-size: 18px; font-weight: 800; margin-top: 4px; padding-top: 4px; border-top: 2px dashed var(--color-border); }

.method-pills { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.method-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px 8px; border-radius: 12px; border: 2px solid var(--color-border); background: white; cursor: pointer; transition: all 0.2s; outline: none; }
.method-card:hover { border-color: #cbd5e1; background: #f8fafc; }
.method-card.active { border-color: var(--color-primary); background: #eef2ff; box-shadow: 0 4px 12px rgba(99,102,241,0.2); }
.method-icon-wrap { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.method-name { font-size: 13px; font-weight: 700; color: #475569; }
.method-card.active .method-name { color: var(--color-primary); }

.tendered-section { display: flex; flex-direction: column; gap: 12px; background: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid var(--color-border); }
.tendered-section label { font-size: 13px; font-weight: 600; color: #475569; }
.tendered-input-wrap { position: relative; display: flex; align-items: center; }
.currency-symbol { position: absolute; left: 16px; font-size: 20px; font-weight: 700; color: #64748B; }
.tendered-input { width: 100%; padding: 16px 16px 16px 36px; font-size: 24px; font-weight: 700; border: 2px solid var(--color-border); border-radius: 8px; outline: none; transition: border-color 0.2s; }
.tendered-input:focus { border-color: var(--color-primary); }
.quick-cash { display: flex; gap: 8px; }
.quick-amt-btn { flex: 1; padding: 10px; border-radius: 6px; background: white; border: 1px solid var(--color-border); font-weight: 600; cursor: pointer; transition: all 0.2s; }
.quick-amt-btn:hover { background: #F1F5F9; border-color: #CBD5E1; }
.exact-btn { background: #E0E7FF; color: #4338CA; border-color: #C7D2FE; }

.change-display { display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 700; margin-top: 12px; padding-top: 16px; border-top: 1px dashed var(--color-border); }
.change-amount { font-size: 24px; font-weight: 800; }
.insufficient-warning { color: #EF4444; font-size: 13px; font-weight: 600; text-align: right; }

.add-payment-actions { margin-top: 8px; }
.add-pay-btn { width: 100%; padding: 14px; font-size: 16px; display: flex; justify-content: center; align-items: center; gap: 8px; }

.payments-list { margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--color-border); }
.payment-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 8px; }
.pi-left { display: flex; align-items: center; gap: 8px; }
.pi-method { font-weight: 700; color: #1E293B; }
.pi-change { font-size: 12px; color: #64748B; }
.pi-right { display: flex; align-items: center; gap: 12px; }
.pi-remove { background: #FEE2E2; border: none; color: #EF4444; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.pi-remove:hover { background: #FECACA; }

.modal-footer { padding: 16px 24px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: 12px; background: white; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; }
.btn-ghost { background: transparent; color: #475569; }
.btn-ghost:hover { background: #F1F5F9; }
.btn-primary { background: var(--color-primary, #6366F1); color: white; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.text-danger { color: #EF4444; }
.text-success { color: #10B981; }
.text-muted { color: #64748B; }
.text-primary { color: var(--color-primary, #6366F1); }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
