<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-box">
        <div class="modal-head">
          <h3><Pause :size="18" class="icon-inline" /> Held Orders</h3>
          <button class="modal-close" @click="close"><X :size="20" /></button>
        </div>
        <div class="modal-body">
          <div v-if="holdStore.holds.length === 0" class="empty-modal-state">
            No held orders right now.
          </div>
          <div v-else class="held-list">
            <div v-for="(hold, index) in holdStore.holds" :key="hold.id" class="order-row">
              <div class="order-row-info">
                <span class="order-num">Hold #{{ holdStore.holds.length - index }}</span>
                <span class="text-muted">
                  {{ hold.savedAt }} · {{ hold.items.length }} items · ${{ hold.total.toFixed(2) }}
                  <span v-if="hold.tableNumber"> · Table {{ hold.tableNumber }}</span>
                  <span v-if="hold.customerPhone"> · {{ hold.customerPhone }}</span>
                </span>
              </div>
              <div class="order-row-actions">
                <button class="btn btn-primary btn-sm" :disabled="!shopStore.isOpen" @click="resume(hold.id)">Resume</button>
                <button class="btn btn-ghost btn-sm" @click="remove(hold.id)"><Trash2 :size="14" class="text-danger"/></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Pause, X, Trash2 } from '@lucide/vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'resumed'])

const holdStore = useHoldStore()
const cartStore = useCartStore()
const shopStore = useShopStore()

const close = () => emit('update:modelValue', false)

const resume = (id: string) => {
  if (!shopStore.isOpen) {
    alert('Open shop before resuming held orders.')
    return
  }
  if (cartStore.items.length > 0) {
    if (!confirm('This will replace current cart items. Continue?')) return
  }
  const hold = holdStore.resumeHold(id)
  if (hold) {
    cartStore.clearCart()
    cartStore.replaceItems(hold.items)
    cartStore.tableNumber = hold.tableNumber
    cartStore.customerPhone = hold.customerPhone ?? ''
    emit('resumed')
    close()
  }
}

const remove = (id: string) => {
  if (confirm('Are you sure you want to delete this held order?')) {
    holdStore.deleteHold(id)
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.modal-box { background: white; border-radius: 16px; width: 480px; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-head { padding: 20px 24px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
.modal-head h3 { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0; }
.modal-close { color: var(--color-muted); transition: color 0.2s; background: transparent; border: none; cursor: pointer; }
.modal-close:hover { color: var(--color-danger); }
.modal-body { padding: 20px 24px; overflow-y: auto; }
.empty-modal-state { text-align: center; padding: 40px; color: var(--color-muted); font-size: 14px; }
.order-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F8FAFC; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--color-border); }
.order-row-info { display: flex; flex-direction: column; gap: 4px; }
.order-num { font-weight: 700; font-size: 14px; color: #1E293B; }
.text-muted { color: #64748B; font-size: 12px; }
.order-row-actions { display: flex; gap: 8px; }
.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 6px; cursor: pointer; border: none; font-weight: 600; }
.btn-sm:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary { background: var(--color-primary, #6366F1); color: white; }
.btn-ghost { background: transparent; }
.btn-ghost:hover { background: #F1F5F9; }
.text-danger { color: #EF4444; }
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
