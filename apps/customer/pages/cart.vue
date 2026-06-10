<template>
  <div class="min-h-screen bg-slate-50 font-sans">

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div class="max-w-2xl mx-auto px-4 flex items-center gap-4 h-14">
        <NuxtLink to="/menu" class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
          <ArrowLeft :size="18" />
        </NuxtLink>
        <h1 class="text-base font-black text-slate-800">Your Cart</h1>
        <span v-if="cart.count > 0" class="ml-auto px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black">
          {{ cart.count }} items
        </span>
      </div>
    </header>

    <div class="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-4">

      <!-- Empty cart -->
      <div v-if="cart.items.length === 0" class="flex flex-col items-center justify-center py-24 gap-5">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center text-4xl">
          🛒
        </div>
        <div class="text-center">
          <h2 class="text-xl font-black text-slate-800">Cart is empty</h2>
          <p class="text-sm text-slate-400 mt-1">Add something delicious from our menu</p>
        </div>
        <NuxtLink
          to="/menu"
          class="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-glow"
        >
          Browse Menu
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Table badge -->
        <div v-if="cart.tableId" class="flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
          <div class="flex items-center gap-2 text-indigo-700 text-sm font-bold">
            <MapPin :size="16" />
            <span>Table {{ cart.tableId }}</span>
          </div>
          <button class="text-xs text-indigo-500 font-bold underline" @click="cart.tableId = null">Change</button>
        </div>

        <!-- Cart items -->
        <div class="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-100 divide-y divide-slate-50">
          <div
            v-for="item in cart.items"
            :key="item.id"
            class="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group"
          >
            <!-- Emoji icon -->
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center text-xl flex-shrink-0">
              {{ getEmoji(item.name) }}
            </div>

            <!-- Name + price -->
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-bold text-slate-800 truncate">{{ item.name }}</p>
              <p class="text-xs text-slate-400 font-medium">${{ item.price.toFixed(2) }} each</p>
            </div>

            <!-- Qty controls -->
            <div class="flex items-center gap-2">
              <button
                class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                @click="cart.updateQty(item.id, item.quantity - 1)"
              >
                <Minus :size="12" />
              </button>
              <span class="text-sm font-black text-slate-800 w-4 text-center">{{ item.quantity }}</span>
              <button
                class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
                @click="cart.updateQty(item.id, item.quantity + 1)"
              >
                <Plus :size="12" />
              </button>
            </div>

            <!-- Subtotal -->
            <p class="text-sm font-black text-indigo-600 min-w-[48px] text-right">${{ item.subtotal.toFixed(2) }}</p>

            <!-- Remove -->
            <button
              class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all ml-1"
              @click="cart.remove(item.id)"
            >
              <X :size="15" />
            </button>
          </div>
        </div>

        <!-- Table selection (if no table set) -->
        <div v-if="!cart.tableId" class="bg-white rounded-3xl p-4 shadow-card border border-slate-100">
          <label class="flex items-center gap-2 text-sm font-bold text-slate-600 mb-3">
            <MapPin :size="15" class="text-indigo-500" />
            Select your table
          </label>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="n in 10"
              :key="n"
              class="py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border"
              :class="selectedTable === n.toString()
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-glow'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'"
              @click="selectedTable = n.toString()"
            >
              {{ n }}
            </button>
            <button
              class="col-span-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border"
              :class="selectedTable === 'Takeaway'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'"
              @click="selectedTable = 'Takeaway'"
            >
              🥡 Takeaway
            </button>
          </div>
        </div>

        <!-- Note -->
        <div class="bg-white rounded-3xl p-4 shadow-card border border-slate-100">
          <label class="flex items-center gap-2 text-sm font-bold text-slate-600 mb-3">
            <Pencil :size="15" class="text-indigo-500" />
            Special note (optional)
          </label>
          <textarea
            v-model="note"
            rows="2"
            placeholder="Allergies, special requests…"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
          />
        </div>

        <!-- Totals -->
        <div class="bg-white rounded-3xl p-4 shadow-card border border-slate-100 flex flex-col gap-2">
          <div class="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span class="font-semibold text-slate-700">${{ cart.totals.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm text-slate-500">
            <span>Tax (10%)</span>
            <span class="font-semibold text-slate-700">${{ cart.totals.tax.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between pt-3 border-t border-slate-100 text-base font-black text-slate-800">
            <span>Total</span>
            <span class="text-indigo-600 text-lg">${{ cart.totals.grandTotal.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Error -->
        <p v-if="errorMsg" class="flex items-center gap-2 text-sm text-red-500 font-semibold px-1">
          <AlertTriangle :size="15" />
          {{ errorMsg }}
        </p>

        <!-- Place Order button -->
        <button
          id="place-order-btn"
          class="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white text-base font-black tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="canOrder
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-[0_8px_32px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)] hover:-translate-y-0.5'
            : 'bg-slate-300'"
          :disabled="placing || !canOrder"
          @click="placeOrder"
        >
          <span v-if="placing" class="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          <ShoppingBag v-else :size="20" />
          <span v-if="placing">Placing Order…</span>
          <span v-else>Place Order — ${{ cart.totals.grandTotal.toFixed(2) }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft, MapPin, Minus, Plus, X, Pencil, AlertTriangle, ShoppingBag
} from '@lucide/vue'

const cart    = useCartStore()
const router  = useRouter()
const note    = ref('')
const placing = ref(false)
const errorMsg = ref('')
const selectedTable = ref('')

const canOrder = computed(() =>
  cart.items.length > 0 && (!!cart.tableId || !!selectedTable.value)
)

const emojiMap: Record<string, string> = {
  espresso: '☕', coffee: '☕', latte: '🥛', cappuccino: '☕',
  croissant: '🥐', muffin: '🧁', iced: '🧊', matcha: '🍵',
}
const getEmoji = (name: string) => {
  const key = Object.keys(emojiMap).find(k => name.toLowerCase().includes(k))
  return key ? emojiMap[key] : '🍽️'
}

const placeOrder = async () => {
  if (!cart.tableId && !selectedTable.value) {
    errorMsg.value = 'Please select a table or choose Takeaway'
    return
  }
  placing.value  = true
  errorMsg.value = ''
  try {
    const isTakeaway = selectedTable.value === 'Takeaway'
    const tableId = cart.tableId || selectedTable.value
    const order = await orderRepository.create({
      tableId:    isTakeaway ? undefined : tableId,
      tableLabel: isTakeaway ? 'Takeaway' : `Table ${tableId}`,
      source:     'online',
      items:      cart.items.map(i => ({ menuItemId: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity, note: note.value || undefined, size: i.size })),
    })
    cart.clear()
    router.push(`/order/${order.id}`)
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Failed to place order'
  } finally {
    placing.value = false
  }
}
</script>
