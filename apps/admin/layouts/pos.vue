<template>
  <div class="shell">
    <header class="topbar">
      <div class="topbar-left">
        <div class="logo">
          <span class="logo-icon">
            <span style="font-size: 24px; font-weight: 900; letter-spacing: -1px; color: #1E293B;">Cafe</span>
            <span style="font-size: 24px; font-weight: 900; letter-spacing: -1px; color: #6366F1;">NUX</span>
          </span>
        </div>
        <div class="time-badge">
          <Clock :size="14" class="icon-inline" /> {{ time }}
        </div>
      </div>
      
      <div class="topbar-right">
        <NuxtLink to="/admin/dashboard" class="btn btn-primary top-dashboard-btn">
          <LayoutDashboard :size="16" /> Dashboard
        </NuxtLink>
        <button class="shop-status-btn" :class="shopStore.isOpen ? 'open' : 'closed'" @click="openShopControl">
          <Store v-if="shopStore.isOpen" :size="16" />
          <BadgeX v-else :size="16" />
          {{ shopStore.isOpen ? 'Close Shop' : 'Open Shop' }}
        </button>
        <div class="top-icons">
          <button class="top-icon-btn" title="Calculator" @click="showCalculator = true"><Calculator :size="16" /></button>
          <button class="top-icon-btn" title="Toggle Fullscreen" @click="toggleFullscreen"><Maximize :size="16" /></button>
          <button class="top-icon-btn" title="Print Receipt" @click="printReceipt"><Printer :size="16" /></button>
          <button class="top-icon-btn" title="Refresh Product Data" @click="refreshData"><RefreshCw :size="16" /></button>
          <NuxtLink to="/admin/reports" class="top-icon-btn flex items-center justify-center" title="Reports"><BarChart2 :size="16" /></NuxtLink>
          <NuxtLink to="/admin/products" class="top-icon-btn flex items-center justify-center" title="Settings"><Settings :size="16" /></NuxtLink>
        </div>
        <button class="btn btn-ghost logout-btn" @click="handleLogout" title="Logout">
          <User :size="16" />
        </button>
      </div>
    </header>
    <main class="main">
      <slot />
    </main>
    <ShopControlModal v-model="showShopControl" :mode="shopStore.isOpen ? 'close' : 'open'" />
    <CalculatorModal v-model="showCalculator" />
  </div>
</template>

<script setup lang="ts">
import { LayoutDashboard, Clock, Store, BadgeX, Calculator, Maximize, Printer, RefreshCw, BarChart2, Settings, User } from '@lucide/vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../src/presentation/viewmodels/auth/useAuthViewModel'
import { useShopStore } from '../src/presentation/viewmodels/settings/useShopViewModel'
import { useProductStore } from '../src/presentation/viewmodels/pos/useProductViewModel'
import ShopControlModal from '../src/presentation/widgets/common/ShopControlModal.vue'
import CalculatorModal from '../src/presentation/widgets/common/CalculatorModal.vue'

const router = useRouter()
const auth   = useAuthStore()
const shopStore = useShopStore()
const productStore = useProductStore()

const time = ref('')
const showShopControl = ref(false)
const showCalculator = ref(false)
const openShopControl = () => showShopControl.value = true
let clockTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  const updateTime = () => { time.value = new Date().toLocaleTimeString('en-US', { hour12: false }) }
  updateTime()
  clockTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

const refreshData = async () => {
  await productStore.fetchProducts()
  alert('Product data refreshed!')
}

const printReceipt = () => {
  window.print()
}
</script>

<style scoped>
.shell { display:flex; flex-direction:column; height:100vh; overflow:hidden; background:var(--color-bg); }

.topbar {
  display: flex; align-items: center; justify-content: space-between;
  height: 60px; padding: 0 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.topbar-left { display: flex; align-items: center; gap: 24px; }
.logo { display: flex; align-items: center; gap: 8px; }

.time-badge { display: flex; align-items: center; gap: 6px; background: #10B981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 700; }

.topbar-right { display: flex; align-items: center; gap: 16px; }

.top-dashboard-btn { background: #8B5CF6; color: white; border-color: #8B5CF6; border-radius: 4px; font-weight: 700; padding: 8px 16px; }
.top-dashboard-btn:hover { background: #7C3AED; }

.shop-status-btn { display: flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 4px; font-size: 13px; font-weight: 800; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
.shop-status-btn.open { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
.shop-status-btn.open:hover { background: #dcfce7; }
.shop-status-btn.closed { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
.shop-status-btn.closed:hover { background: #ffe4e6; }

.top-icons { display: flex; align-items: center; gap: 4px; }
.top-icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid var(--color-border); background: var(--color-surface-2); color: var(--color-muted); transition: all 0.2s; }
.top-icon-btn:hover { background: white; border-color: var(--color-primary); color: var(--color-primary); }

.logout-btn { padding: 8px; color: var(--color-text); border: 1px solid var(--color-border); border-radius: 4px; background: var(--color-surface-2); }
.logout-btn:hover { color: var(--color-danger); border-color: var(--color-danger); }

.main { flex:1; overflow-y:auto; }
</style>
