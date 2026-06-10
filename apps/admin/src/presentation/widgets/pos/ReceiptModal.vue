<template>
  <Transition name="modal">
    <div v-if="modelValue && order" class="modal-overlay" @click.self="close">
      <div class="modal-box receipt-modal">
        <div class="receipt-print-area" ref="printArea">
          <div class="receipt-header">
            <h2>CafeNUX</h2>
            <p>123 Coffee Street</p>
            <p>Tel: +1 234 567 890</p>
            <div class="divider"></div>
          </div>
          
          <div class="receipt-meta">
            <div><span>Order #</span> <strong>{{ order.orderId }}</strong></div>
            <div><span>Date</span> <span>{{ new Date(order.timestamp).toLocaleString() }}</span></div>
            <div><span>Cashier</span> <span>{{ order.cashier }}</span></div>
          </div>
          
          <div class="divider dashed"></div>
          
          <div class="receipt-items">
            <div class="r-item-head">
              <span class="qty">Qty</span>
              <span class="desc">Item</span>
              <span class="amt">Amt</span>
            </div>
            <div v-for="item in order.items" :key="item.id" class="r-item">
              <span class="qty">{{ item.quantity }}</span>
              <span class="desc">
                {{ item.name }}
                <small v-if="item.size">{{ item.size }}</small>
              </span>
              <span class="amt">${{ item.subtotal.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="divider dashed"></div>
          
          <div class="receipt-totals">
            <!-- Simplified total calculation for receipt view based on cart properties -->
            <div class="r-total-row"><span>Subtotal</span> <span>${{ order.total.toFixed(2) }}</span></div>
            <div class="r-total-row grand"><span>Total</span> <span>${{ order.total.toFixed(2) }}</span></div>
          </div>
          
          <div class="receipt-payment">
            <div class="r-pay-row"><span>Payment Method</span> <span>{{ order.paymentMethod }}</span></div>
            <div class="r-pay-row" v-if="order.customerPhone"><span>Loyalty Phone</span> <span>{{ order.customerPhone }}</span></div>
            <div class="r-pay-row" v-if="order.paymentMethod === 'Cash'"><span>Change</span> <span>${{ order.change.toFixed(2) }}</span></div>
          </div>
          
          <div class="receipt-footer">
            <p>Thank you for your visit!</p>
            <p>Please come again</p>
          </div>
        </div>

        <div class="modal-footer no-print">
          <button class="btn btn-ghost" @click="close">Close</button>
          <button class="btn btn-primary" @click="printReceipt">Print Receipt</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ modelValue: boolean; order: Order | null }>()
const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

const printReceipt = () => {
  window.print()
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.modal-box { background: #f0f0f0; border-radius: 12px; width: 400px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }

.receipt-print-area { background: white; margin: 20px; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); font-family: 'Courier New', Courier, monospace; color: #000; overflow-y: auto; }

.receipt-header { text-align: center; margin-bottom: 16px; }
.receipt-header h2 { font-size: 24px; font-weight: 800; margin: 0 0 8px; font-family: sans-serif; letter-spacing: 2px; }
.receipt-header p { margin: 2px 0; font-size: 12px; }

.divider { height: 2px; background: #000; margin: 16px 0; }
.divider.dashed { background: transparent; border-top: 1px dashed #000; }

.receipt-meta { font-size: 12px; margin-bottom: 16px; }
.receipt-meta div { display: flex; justify-content: space-between; margin-bottom: 4px; }

.receipt-items { font-size: 13px; }
.r-item-head { display: flex; font-weight: 700; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 8px; }
.r-item { display: flex; margin-bottom: 6px; }
.qty { width: 15%; }
.desc { width: 60%; }
.amt { width: 25%; text-align: right; }

.receipt-totals { margin: 16px 0; font-size: 14px; }
.r-total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
.r-total-row.grand { font-size: 18px; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 2px solid #000; }

.receipt-payment { font-size: 13px; margin: 16px 0; }
.r-pay-row { display: flex; justify-content: space-between; margin-bottom: 4px; }

.receipt-footer { text-align: center; font-size: 12px; margin-top: 24px; font-weight: 600; }

.modal-footer { padding: 16px 20px; background: white; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #e2e8f0; }
.btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
.btn-ghost { background: #f1f5f9; color: #475569; }
.btn-primary { background: #0f172a; color: white; }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

@media print {
  body * { visibility: hidden; }
  .receipt-print-area, .receipt-print-area * { visibility: visible; }
  .receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; border-radius: 0; }
  .no-print { display: none !important; }
}
</style>
