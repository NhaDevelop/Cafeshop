<template>
  <div class="shell has-sidebar">

    <!-- Left Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon"><Coffee :size="28" /></span>
          <span class="logo-text">Cafe NUX</span>
        </div>
      </div>

      <nav class="side-nav">
        <div class="nav-label">Menu</div>
        <NuxtLink v-if="auth.user?.role === 'admin'" to="/dashboard" class="nav-item" :class="{ active: route.path === '/dashboard' }">
          <LayoutDashboard :size="20" class="nav-icon" /> <span class="nav-text">Dashboard</span>
        </NuxtLink>
        <NuxtLink v-if="auth.user?.role === 'admin' || auth.user?.role === 'cashier'" to="/pos" class="nav-item" :class="{ active: route.path.startsWith('/pos') }">
          <Monitor :size="20" class="nav-icon" /> <span class="nav-text">POS Terminal</span>
        </NuxtLink>
        <NuxtLink v-if="auth.user?.role === 'admin' || auth.user?.role === 'kitchen'" to="/kitchen" class="nav-item" :class="{ active: route.path.startsWith('/kitchen') }">
          <ChefHat :size="20" class="nav-icon" /> <span class="nav-text">Kitchen</span>
        </NuxtLink>
        <NuxtLink v-if="auth.user?.role === 'admin'" to="/daily-sales" class="nav-item" :class="{ active: route.path === '/daily-sales' }">
          <CalendarDays :size="20" class="nav-icon" /> <span class="nav-text">Daily Sales</span>
        </NuxtLink>
        <NuxtLink v-if="auth.user?.role === 'admin'" to="/reports" class="nav-item" :class="{ active: route.path.startsWith('/reports') }">
          <LineChart :size="20" class="nav-icon" /> <span class="nav-text">Reports</span>
        </NuxtLink>

        <template v-if="auth.user?.role === 'admin'">
          <div class="nav-label mt-4">Management</div>
          <NuxtLink to="/products" class="nav-item" :class="{ active: route.path.startsWith('/products') }">
            <Package :size="20" class="nav-icon" /> <span class="nav-text">Products</span>
          </NuxtLink>
          <NuxtLink to="/inventory" class="nav-item" :class="{ active: route.path.startsWith('/inventory') }">
            <Package :size="20" class="nav-icon" /> <span class="nav-text">Inventory</span>
          </NuxtLink>
          <NuxtLink to="/shifts" class="nav-item" :class="{ active: route.path.startsWith('/shifts') }">
            <Clock :size="20" class="nav-icon" /> <span class="nav-text">Shifts</span>
          </NuxtLink>
          <NuxtLink to="/loyalty" class="nav-item" :class="{ active: route.path.startsWith('/loyalty') }">
            <User :size="20" class="nav-icon" /> <span class="nav-text">Loyalty</span>
          </NuxtLink>
          <NuxtLink to="/expenses" class="nav-item" :class="{ active: route.path.startsWith('/expenses') }">
            <Wallet :size="20" class="nav-icon" /> <span class="nav-text">Expenses</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="sidebar-bottom">
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="20" class="nav-icon" /> <span class="nav-text">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="content-wrapper">
      <header class="topbar">
  <div class="topbar-left">
    <h2 class="page-title">{{ pageTitle }}</h2>
  </div>
  <div class="topbar-right">
    <div class="time-badge">
      <Clock :size="14" class="icon-inline" /> {{ time }}
    </div>
    <div class="user-profile">
      <div class="avatar"><User :size="16"/></div>
      <span class="user-name">{{ auth.user?.name || 'Admin' }} ({{ auth.user?.role || 'admin' }})</span>
    </div>
  </div>
</header>
      <main class="main">
        <slot />
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Monitor, ChefHat, LayoutDashboard, LineChart, Package, LogOut, Coffee, Clock, User, CalendarDays, Wallet } from '@lucide/vue'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const time = ref('')

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

const pageTitle = computed(() => {
  if (route.path.startsWith('/dashboard')) return 'Dashboard overview'
  if (route.path.startsWith('/daily-sales')) return 'Daily sales details'
  if (route.path.startsWith('/kitchen')) return 'Kitchen display'
  if (route.path.startsWith('/reports')) return 'Sales reports'
  if (route.path.startsWith('/products')) return 'Product management'
  if (route.path.startsWith('/inventory')) return 'Inventory management'
  if (route.path.startsWith('/shifts')) return 'Shift management'
  if (route.path.startsWith('/loyalty')) return 'Customer loyalty'
  if (route.path.startsWith('/expenses')) return 'Expense tracking'
  return 'Cafe Admin'
})
</script>

<style scoped>
.shell.has-sidebar { display: flex; height: 100vh; overflow: hidden; background: var(--color-bg); }

/* Sidebar */
.admin-sidebar {
  width: 260px; flex-shrink: 0; background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex; flex-direction: column;
}
.sidebar-header {
  height: 70px; display: flex; align-items: center; padding: 0 24px;
  border-bottom: 1px solid var(--color-border);
}
.logo { display: flex; align-items: center; gap: 10px; }
.logo-icon { color: var(--color-primary); display: flex; align-items: center; }
.logo-text { font-size: 20px; font-weight: 800; color: var(--color-text); letter-spacing: -.02em; }

.side-nav { flex: 1; padding: 24px 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.nav-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-muted); padding: 0 12px; margin-bottom: 8px; letter-spacing: 0.5px; }
.mt-4 { margin-top: 16px; }

.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  border-radius: var(--radius); color: var(--color-muted);
  transition: all var(--transition);
}
.nav-icon { opacity: 0.8; transition: all var(--transition); }
.nav-text { font-size: 14px; font-weight: 600; }
.nav-item:hover { color: var(--color-text); background: var(--color-surface-2); }
.nav-item:hover .nav-icon { color: var(--color-primary); opacity: 1; }
.nav-item.active { background: rgba(99,102,241,0.08); color: var(--color-primary); }
.nav-item.active .nav-icon { color: var(--color-primary); opacity: 1; }

.sidebar-bottom { padding: 16px; border-top: 1px solid var(--color-border); }
.logout-btn {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px;
  border-radius: var(--radius); color: var(--color-muted); background: transparent;
  transition: all var(--transition);
}
.logout-btn:hover { color: var(--color-danger); background: rgba(239,68,68,0.08); }

/* Content Area */
.content-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.topbar {
  display: flex; align-items: center; justify-content: space-between;
  height: 70px; padding: 0 32px; background: var(--color-surface);
  border-bottom: 1px solid var(--color-border); flex-shrink: 0;
}
.page-title { font-size: 18px; font-weight: 700; color: var(--color-text); text-transform: capitalize; }

.topbar-right { display: flex; align-items: center; gap: 20px; }
.time-badge { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--color-muted); }
.icon-inline { margin-bottom: -1px; }

.user-profile { display: flex; align-items: center; gap: 10px; padding-left: 20px; border-left: 1px solid var(--color-border); }
.avatar { width: 32px; height: 32px; background: var(--color-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.user-name { font-size: 14px; font-weight: 700; color: var(--color-text); }

.main { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; }
</style>
