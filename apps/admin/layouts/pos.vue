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
        <NuxtLink to="/dashboard" class="btn btn-primary top-dashboard-btn">
          <LayoutDashboard :size="16" /> Dashboard
        </NuxtLink>
        <button class="shop-status-btn" :class="shopStore.isOpen ? 'open' : 'closed'" @click="openShopControl">
          <Store v-if="shopStore.isOpen" :size="16" />
          <BadgeX v-else :size="16" />
          {{ shopStore.isOpen ? 'Close Shop' : 'Open Shop' }}
        </button>
        <div class="top-icons">
          <button class="top-icon-btn"><Calculator :size="16" /></button>
          <button class="top-icon-btn"><Maximize :size="16" /></button>
          <button class="top-icon-btn"><Printer :size="16" /></button>
          <button class="top-icon-btn"><RefreshCw :size="16" /></button>
          <button class="top-icon-btn"><BarChart2 :size="16" /></button>
          <button class="top-icon-btn"><Settings :size="16" /></button>
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
  </div>
</template>

<script setup lang="ts">
import { LayoutDashboard, Clock, Store, BadgeX, Calculator, Maximize, Printer, RefreshCw, BarChart2, Settings, User } from '@lucide/vue'

const router = useRouter()
const auth   = useAuthStore()
const shopStore = useShopStore()
const time = ref('')
const showShopControl = ref(false)
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
