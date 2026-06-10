<template>
  <div class="min-h-screen bg-slate-50 font-sans">

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div class="max-w-2xl mx-auto px-4 flex items-center gap-4 h-14">
        <NuxtLink to="/menu" class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
          <ArrowLeft :size="18" />
        </NuxtLink>
        <h1 class="text-base font-black text-slate-800">Track Order</h1>
        <button
          class="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          @click="reload"
        >
          <RefreshCw :size="13" :class="store.loading ? 'animate-spin' : ''" />
          Refresh
        </button>
      </div>
    </header>

    <div class="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

      <!-- Loading -->
      <div v-if="store.loading && !store.order" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p class="text-sm text-slate-400 font-medium">Loading your order…</p>
      </div>

      <template v-else-if="store.order">

        <!-- Status hero card -->
        <div
          class="rounded-3xl overflow-hidden shadow-card-lg"
          :class="{
            'bg-gradient-to-br from-amber-400 to-orange-400':   store.order.status === 'pending',
            'bg-gradient-to-br from-indigo-500 to-violet-600': store.order.status === 'preparing',
            'bg-gradient-to-br from-emerald-400 to-teal-500':  store.order.status === 'ready',
            'bg-gradient-to-br from-indigo-400 to-purple-500': store.order.status === 'completed',
            'bg-gradient-to-br from-slate-400 to-slate-500':   store.order.status === 'cancelled',
          }"
        >
          <div class="px-6 pt-8 pb-6 text-white text-center">
            <div class="text-5xl mb-3">{{ statusEmoji }}</div>
            <h1 class="text-2xl font-black mb-1">{{ statusTitle }}</h1>
            <p class="text-white/70 text-sm font-semibold">Order #{{ store.order.id.slice(-6).toUpperCase() }}</p>
            <p v-if="store.order.tableLabel" class="text-white/80 text-sm font-bold mt-1">
              🪑 {{ store.order.tableLabel }}
            </p>
          </div>

          <!-- Progress bar inside card -->
          <div class="bg-white/10 px-6 py-5">
            <div class="flex items-center justify-between relative">
              <!-- Track line -->
              <div class="absolute top-[14px] left-[14px] right-[14px] h-0.5 bg-white/30" />
              <div
                class="absolute top-[14px] left-[14px] h-0.5 bg-white transition-all duration-700"
                :style="`width: calc((${store.currentStep} / 3) * (100% - 28px))`"
              />

              <div
                v-for="(step, i) in steps"
                :key="step.key"
                class="flex flex-col items-center gap-1.5 relative z-10"
              >
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                  :class="store.currentStep >= i
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'bg-white/30 text-white'"
                >
                  <component
                    :is="store.currentStep > i ? CheckCircle2 : step.icon"
                    :size="13"
                  />
                </div>
                <span class="text-[9px] font-bold text-white/80 text-center max-w-[44px] leading-tight">
                  {{ step.label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ready alert -->
        <div
          v-if="store.order.status === 'ready'"
          class="bg-emerald-50 border-2 border-emerald-400 rounded-3xl px-5 py-4 flex items-center gap-3 animate-bounce-sm"
        >
          <div class="w-10 h-10 rounded-2xl bg-emerald-400 flex items-center justify-center text-2xl flex-shrink-0">🔔</div>
          <div>
            <p class="text-sm font-black text-emerald-800">Your order is ready!</p>
            <p class="text-xs text-emerald-600 font-medium">Please come to the counter to collect it.</p>
          </div>
        </div>

        <div
          v-if="store.order.status === 'completed'"
          class="bg-indigo-50 border border-indigo-200 rounded-3xl px-5 py-4 flex items-center gap-3"
        >
          <div class="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">✅</div>
          <div>
            <p class="text-sm font-black text-indigo-700">Order completed!</p>
            <p class="text-xs text-indigo-400 font-medium">We hope you enjoy your meal. See you again!</p>
          </div>
        </div>

        <!-- Order summary -->
        <div class="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <p class="text-xs font-black uppercase tracking-widest text-slate-400">Order Summary</p>
          </div>
          <div class="px-5 py-4 flex flex-col gap-3">
            <div
              v-for="item in store.order.items"
              :key="item.id"
              class="flex items-center gap-3"
            >
              <span class="min-w-[32px] h-7 px-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black flex items-center justify-center">
                ×{{ item.quantity }}
              </span>
              <span class="flex-1 text-sm font-semibold text-slate-700">{{ item.name }}</span>
              <span class="text-sm font-black text-slate-800">
                ${{ (item.subtotal ?? item.price * item.quantity).toFixed(2) }}
              </span>
            </div>
          </div>
          <div class="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-500">Total</span>
            <span class="text-xl font-black text-indigo-600">${{ store.order.grandTotal.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink
            to="/menu"
            class="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-glow"
          >
            <Plus :size="16" />
            Order More
          </NuxtLink>
          <button
            class="flex items-center justify-center gap-2 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            @click="reload"
          >
            <RefreshCw :size="16" />
            Refresh
          </button>
        </div>
      </template>

      <!-- Error -->
      <div v-else class="flex flex-col items-center justify-center py-24 gap-5">
        <div class="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-4xl">😕</div>
        <div class="text-center">
          <h2 class="text-lg font-black text-slate-800">Order not found</h2>
          <p class="text-sm text-slate-400 mt-1">We couldn't find this order.</p>
        </div>
        <NuxtLink
          to="/menu"
          class="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors"
        >
          Go to Menu
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, RefreshCw, Plus, CheckCircle2, ClipboardList, ChefHat, Bell, Coffee, Star } from '@lucide/vue'

const route = useRoute()
const store = useTrackingStore()

const steps = [
  { key: 'pending',   label: 'Received',  icon: ClipboardList },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready',     label: 'Ready!',    icon: Bell },
  { key: 'completed', label: 'Done',      icon: Star },
]

const statusEmoji = computed(() => ({
  pending:   '⏳',
  preparing: '👨‍🍳',
  ready:     '🔔',
  completed: '🌟',
  cancelled: '❌',
}[store.order?.status ?? 'pending']))

const statusTitle = computed(() => ({
  pending:   'Order Received!',
  preparing: 'Being Prepared…',
  ready:     'Ready to Collect!',
  completed: 'All Done!',
  cancelled: 'Cancelled',
}[store.order?.status ?? 'pending']))

const reload = () => store.load(route.params.id as string)

onMounted(() => {
  reload()
  const interval = setInterval(() => {
    const s = store.order?.status
    if (s === 'completed' || s === 'cancelled') { clearInterval(interval); return }
    reload()
  }, 8000)
  onUnmounted(() => clearInterval(interval))
})
</script>
