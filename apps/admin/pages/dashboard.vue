<template>
  <div class="p-7 flex flex-col gap-6 bg-slate-50 min-h-full">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
        <p class="text-sm text-slate-400 mt-0.5">{{ todayDate }}</p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Period Switcher -->
        <div class="flex bg-slate-100 rounded-xl p-1 gap-1">
          <button 
            class="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200"
            :class="selectedRange === 'today' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="selectedRange = 'today'">Today</button>
          <button 
            class="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200"
            :class="selectedRange === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="selectedRange = 'week'">Week</button>
          <button 
            class="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200"
            :class="selectedRange === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="selectedRange = 'month'">Month</button>
          <button 
            class="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200"
            :class="selectedRange === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="selectedRange = 'year'">Year</button>
        </div>

        <!-- Currency Switcher -->
        <div class="flex bg-slate-100 rounded-xl p-1 gap-1">
          <button
            class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200"
            :class="currencyStore.activeCurrency === 'USD'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-500 hover:text-slate-700'"
            @click="currencyStore.setCurrency('USD')"
          >$ USD</button>
          <button
            class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200"
            :class="currencyStore.activeCurrency === 'KHR'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-500 hover:text-slate-700'"
            @click="currencyStore.setCurrency('KHR')"
          >៛ Riel</button>
        </div>

        <!-- Exchange Rate -->
        <div class="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 text-sm">
          <span class="text-slate-400 font-semibold">1 USD =</span>
          <input
            v-if="editingRate"
            v-model.number="tempRate"
            type="number"
            class="w-20 border border-indigo-400 rounded-lg px-2 py-0.5 text-sm font-bold outline-none bg-white"
            @blur="saveRate"
            @keyup.enter="saveRate"
            autofocus
          />
          <span v-else class="font-bold text-slate-700 flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors" @click="startEditRate">
            {{ currencyStore.exchangeRate.toLocaleString() }} ៛
            <PencilLine :size="12" class="text-slate-400" />
          </span>
        </div>

        <!-- Refresh -->
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
          @click="dashStore.load()"
        >
          <RefreshCw :size="14" /> Refresh
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="dashStore.loading" class="flex items-center gap-3 p-10 text-slate-400">
      <div class="w-5 h-5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      Loading dashboard…
    </div>

    <template v-else-if="dashStore.stats || todayOrdersCount >= 0">

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="stat in statCards"
          :key="stat.label"
          class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
        >
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center" :class="stat.iconBg">
            <component :is="stat.icon" :size="22" :class="stat.iconColor" />
          </div>
          <div>
            <p class="text-2xl font-extrabold text-slate-800">{{ stat.value }}</p>
            <p class="text-xs text-slate-400 font-semibold mt-0.5">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

        <!-- Revenue Bar Chart -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-800">Revenue Trends</h3>
          </div>
          <div class="flex items-flex-end gap-2.5 h-40 items-end">
            <div
              v-for="(day, i) in salesTrend"
              :key="i"
              class="flex flex-col items-center gap-1.5 flex-1 h-full justify-end"
            >
              <div
                class="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-700 min-h-[4px]"
                :style="{ height: barHeight(day.revenue) + '%' }"
                :title="currencyStore.format(day.revenue)"
              />
              <span class="text-[11px] text-slate-400 font-medium">{{ shortDay(day.date) }}</span>
            </div>
          </div>
        </div>

        <!-- Top Items -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <Trophy :size="16" class="text-amber-500" /> Top Items
          </h3>
          <div class="flex flex-col gap-2 mt-1">
            <div
              v-for="(item, i) in topItemsList"
              :key="item.name"
              class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl"
            >
              <span class="text-lg font-extrabold text-slate-300 w-7 text-center">#{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ item.name }}</p>
                <p class="text-xs text-slate-400">× {{ item.quantity }}</p>
              </div>
              <span class="text-sm font-black text-indigo-600 whitespace-nowrap">{{ currencyStore.format(item.revenue) }}</span>
            </div>
            <div v-if="topItemsList.length === 0" class="flex flex-col items-center justify-center py-6 opacity-40">
              <Trophy :size="28" class="text-slate-400 mb-1" />
              <p class="text-xs text-slate-400">No orders yet today</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Product List Table -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-800">Product List</h3>
            <p class="text-xs text-slate-400 mt-0.5">All products · sorted by sales volume</p>
          </div>
          <NuxtLink to="/products" class="text-sm font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
            View all →
          </NuxtLink>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th class="text-left px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-16">#</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</th>
                <th class="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                <th class="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                <th class="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Qty Sold</th>
                <th class="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</th>
                <th class="px-6 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="allProductsForTable.length === 0">
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center gap-2 opacity-40">
                    <Trophy :size="32" class="text-slate-400" />
                    <p class="text-sm font-semibold text-slate-500">No products yet</p>
                  </div>
                </td>
              </tr>
              <tr
                v-for="(item, i) in allProductsForTable"
                :key="item.id"
                class="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
              >
                <!-- Rank -->
                <td class="px-6 py-3.5">
                  <span
                    class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black"
                    :class="i === 0 ? 'bg-yellow-500 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'"
                  >{{ i + 1 }}</span>
                </td>

                <!-- Name + image -->
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <Coffee :size="18" class="text-slate-300" />
                      </div>
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-slate-800 leading-tight truncate">{{ item.name }}</p>
                      <p v-if="item.description" class="text-xs text-slate-400 truncate max-w-[180px]">{{ item.description }}</p>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="px-4 py-3.5">
                  <span class="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">{{ item.categoryName }}</span>
                </td>

                <!-- Price -->
                <td class="px-4 py-3.5 text-right font-bold text-slate-700">{{ currencyStore.format(item.price) }}</td>

                <!-- Qty sold -->
                <td class="px-4 py-3.5 text-right font-semibold text-slate-600">{{ item.quantitySold }}</td>

                <!-- Revenue -->
                <td class="px-4 py-3.5 text-right font-black text-indigo-600">{{ currencyStore.format(item.revenue) }}</td>

                <!-- Actions -->
                <td class="px-6 py-3.5">
                  <div class="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <NuxtLink to="/products" class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                      <Eye :size="14" />
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DollarSign, ClipboardList, ReceiptText, Utensils, Trophy, RefreshCw, PencilLine, Coffee, Eye } from '@lucide/vue'
import { useDashboardStore } from '../src/presentation/viewmodels/dashboard/useDashboardViewModel'
import { useCurrencyStore } from '../src/presentation/viewmodels/settings/useCurrencyViewModel'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const orderStore = useOrderStore()
const cartStore = useCartStore()
const dashStore = useDashboardStore()
const currencyStore = useCurrencyStore()

const todayDate = ref('')
const selectedRange = ref<'today' | 'week' | 'month' | 'year'>('today')

onMounted(() => {
  dashStore.load()
  todayDate.value = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

// Rate editor
const editingRate = ref(false)
const tempRate = ref(currencyStore.exchangeRate)
const startEditRate = () => { tempRate.value = currencyStore.exchangeRate; editingRate.value = true }
const saveRate = () => { currencyStore.setExchangeRate(tempRate.value); editingRate.value = false }

const todayRevenue = computed(() => orderStore.todayRevenue || 0)
const todayOrdersCount = computed(() => orderStore.todayOrders.length)
const avgOrderValue = computed(() => todayOrdersCount.value > 0 ? todayRevenue.value / todayOrdersCount.value : 0)
const activeTables = computed(() => cartStore.items.length > 0 ? 1 : 0)

const statCards = computed(() => [
  { label: `${periodLabel.value}'s Revenue`, value: currencyStore.format(displayRevenue.value), icon: DollarSign, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { label: `Orders ${periodLabel.value}`,    value: displayOrdersCount.value,                  icon: ClipboardList, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Avg. Order Value', value: currencyStore.format(displayAvgOrderValue.value), icon: ReceiptText, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { label: 'Active Tables',   value: activeTables.value,                       icon: Utensils, iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
])

const topItemsList = computed(() => {
  const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>()
  orderStore.todayOrders.forEach(order => {
    order.items.forEach((item: any) => {
      const existing = itemMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 }
      existing.quantity += item.quantity
      existing.revenue += item.subtotal
      itemMap.set(item.name, existing)
    })
  })
  if (itemMap.size === 0 && dashStore.stats && dashStore.stats.topItems.length > 0) {
    return dashStore.stats.topItems
  }
  return Array.from(itemMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5)
})

const productStore = useProductStore()
const topProductsWithImages = computed(() =>
  topItemsList.value.map(item => {
    const product = productStore.products.find(p => p.name === item.name)
    return { ...item, imageUrl: product?.imageUrl || null }
  })
)

const allProductsForTable = computed(() => {
  const salesMap = new Map<string, { quantity: number; revenue: number }>()
  orderStore.todayOrders.forEach(order => {
    order.items.forEach((item: any) => {
      const existing = salesMap.get(item.name) || { quantity: 0, revenue: 0 }
      existing.quantity += item.quantity
      existing.revenue += item.subtotal
      salesMap.set(item.name, existing)
    })
  })
  return productStore.products
    .map(p => {
      const sales = salesMap.get(p.name) || { quantity: 0, revenue: 0 }
      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        imageUrl: p.imageUrl || null,
        price: p.price,
        categoryName: productStore.categories.find(c => c.id === p.categoryId)?.name || 'General',
        quantitySold: sales.quantity,
        revenue: sales.revenue,
      }
    })
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 10)
})

const salesTrend = computed(() => {
  if (selectedRange.value === 'today') {
    return [
      { date: '8 AM', revenue: todayRevenue.value * 0.1 },
      { date: '10 AM', revenue: todayRevenue.value * 0.2 },
      { date: '12 PM', revenue: todayRevenue.value * 0.35 },
      { date: '2 PM', revenue: todayRevenue.value * 0.15 },
      { date: '4 PM', revenue: todayRevenue.value * 0.1 },
      { date: '6 PM', revenue: todayRevenue.value * 0.1 },
    ]
  }

  if (selectedRange.value === 'month') {
    return [
      { date: 'Week 1', revenue: 4500 },
      { date: 'Week 2', revenue: 5200 },
      { date: 'Week 3', revenue: 4800 },
      { date: 'Week 4', revenue: 1500 + todayRevenue.value },
    ]
  } else if (selectedRange.value === 'year') {
    return [
      { date: 'Jan', revenue: 18000 },
      { date: 'Feb', revenue: 20000 },
      { date: 'Mar', revenue: 24000 },
      { date: 'Apr', revenue: 22000 },
      { date: 'May', revenue: 26000 },
      { date: 'Jun', revenue: 8000 + todayRevenue.value },
      { date: 'Jul', revenue: 0 },
      { date: 'Aug', revenue: 0 },
      { date: 'Sep', revenue: 0 },
      { date: 'Oct', revenue: 0 },
      { date: 'Nov', revenue: 0 },
      { date: 'Dec', revenue: 0 },
    ]
  }

  // Week view: Monday to Sunday
  const result = []
  const today = new Date()
  let dayOfWeek = today.getDay()
  if (dayOfWeek === 0) dayOfWeek = 7 // Make Sunday 7 instead of 0
  
  const monday = new Date(today)
  monday.setDate(today.getDate() - dayOfWeek + 1)
  
  const todayStr = today.toISOString().split('T')[0]

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    
    let revenue = 0
    if (dateStr === todayStr) {
      revenue = todayRevenue.value
    } else if (d < today) {
      // Create some stable mock data for past days of the week based on the day index
      const mockValues = [850, 920, 1100, 1250, 1480, 1850, 2100]
      revenue = mockValues[i] || 0
    }
    
    result.push({ date: dateStr, revenue })
  }
  return result
})

const displayRevenue = computed(() => {
  if (selectedRange.value === 'today') return todayRevenue.value
  if (selectedRange.value === 'week') return salesTrend.value.reduce((a,b) => a + b.revenue, 0)
  if (selectedRange.value === 'month') return salesTrend.value.reduce((a,b) => a + b.revenue, 0)
  if (selectedRange.value === 'year') return salesTrend.value.reduce((a,b) => a + b.revenue, 0)
  return todayRevenue.value
})

const displayOrdersCount = computed(() => {
  if (selectedRange.value === 'today') return todayOrdersCount.value
  if (selectedRange.value === 'week') return 35 + todayOrdersCount.value
  if (selectedRange.value === 'month') return 150 + todayOrdersCount.value
  if (selectedRange.value === 'year') return 1800 + todayOrdersCount.value
  return todayOrdersCount.value
})

const displayAvgOrderValue = computed(() => displayOrdersCount.value > 0 ? displayRevenue.value / displayOrdersCount.value : 0)

const periodLabel = computed(() => {
  if (selectedRange.value === 'today') return "Today"
  if (selectedRange.value === 'week') return "This Week"
  if (selectedRange.value === 'month') return "This Month"
  return "This Year"
})

const maxRevenue = computed(() => Math.max(...(salesTrend.value.map((d: any) => d.revenue)), 1))
const barHeight = (val: number) => Math.max((val / maxRevenue.value) * 100, 4)

const shortDay = (d: string) => {
  if (!d.includes('-')) return d
  const dt = new Date(d + 'T00:00:00')
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('en-US', { weekday: 'short' })
}
</script>
