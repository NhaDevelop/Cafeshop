<template>
  <div class="min-h-screen bg-slate-50 font-sans">

    <!-- ─── Sticky Top Nav ─────────────────────────────────────────── -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div class="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <!-- Brand -->
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-black shadow-glow">
            ☕
          </div>
          <span class="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Brew & Co.
          </span>
        </div>

        <!-- Right actions -->
        <div class="flex items-center gap-2">
          <!-- Orders badge -->
          <button
            v-if="activeOrders.length > 0"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
            :class="hasReadyOrder
              ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-400 animate-pulse-slow'
              : 'bg-slate-100 text-slate-600 border border-slate-200'"
            @click="activeTab = 'orders'"
          >
            <span v-if="hasReadyOrder" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            🔔 {{ activeOrders.length }} order{{ activeOrders.length > 1 ? 's' : '' }}
          </button>

          <!-- Cart -->
          <NuxtLink
            v-if="cart.count > 0"
            to="/cart"
            class="relative w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-glow hover:bg-indigo-700 transition-colors"
          >
            <ShoppingCart :size="17" />
            <span class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {{ cart.count }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- ─── Tab Bar ────────────────────────────────────────────────── -->
    <div class="bg-white border-b border-slate-100">
      <div class="max-w-2xl mx-auto flex">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-2 transition-all duration-200"
          :class="activeTab === tab.id
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-400 hover:text-slate-600'"
          @click="activeTab = tab.id as any"
        >
          <component :is="tab.icon" :size="16" />
          {{ tab.label }}
          <span
            v-if="tab.badge"
            class="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center"
            :class="hasReadyOrder && tab.id === 'orders' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         MENU TAB
    ═══════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'menu'" class="max-w-2xl mx-auto px-4 pb-32">

      <!-- Hero -->
      <div class="pt-6 pb-5 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black leading-tight tracking-tight text-slate-900">
            What would<br>you like? 👋
          </h1>
          <p class="text-sm text-slate-500 font-medium mt-1.5">
            {{ cart.tableId ? `🪑 Table ${cart.tableId}` : 'Pick your favourites' }}
          </p>
        </div>
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl shadow-lg animate-float select-none">
          ☕
        </div>
      </div>

      <!-- Search -->
      <div class="relative mb-4">
        <Search :size="17" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          v-model="menu.search"
          type="text"
          placeholder="Search coffee, food…"
          class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-card"
        />
      </div>

      <!-- Category Dropdown -->
      <div class="relative mb-5 z-20">
        <div
          @click="showCategoryDropdown = !showCategoryDropdown"
          class="w-full flex items-center justify-between text-sm font-bold bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-card cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div class="flex items-center gap-2 truncate text-slate-800">
            <span>{{ menu.selectedCategory === null ? '✨ All Categories' : menu.categories.find(c => c.id === menu.selectedCategory)?.name }}</span>
          </div>
          <ChevronDown :size="17" class="text-slate-400 transition-transform flex-shrink-0" :class="{'rotate-180': showCategoryDropdown}" />
        </div>

        <!-- Dropdown overlay -->
        <div v-if="showCategoryDropdown" class="fixed inset-0 z-[40]" @click="showCategoryDropdown = false"></div>
        
        <!-- Dropdown menu -->
        <Transition enter-active-class="transition-all duration-200 ease-out" leave-active-class="transition-all duration-150 ease-in" enter-from-class="opacity-0 -translate-y-2" leave-to-class="opacity-0 -translate-y-2">
          <div v-if="showCategoryDropdown" class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-[50] max-h-64 overflow-y-auto">
            <button
              class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left hover:bg-slate-50 transition-colors"
              :class="menu.selectedCategory === null ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'"
              @click="menu.selectedCategory = null; showCategoryDropdown = false"
            >
              <span>✨ All Categories</span>
              <Check v-if="menu.selectedCategory === null" :size="16" class="ml-auto flex-shrink-0" />
            </button>
            <button
              v-for="cat in menu.categories" :key="cat.id"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left hover:bg-slate-50 transition-colors"
              :class="menu.selectedCategory === cat.id ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'"
              @click="menu.selectedCategory = cat.id; showCategoryDropdown = false"
            >
              <span class="truncate">{{ cat.name }}</span>
              <Check v-if="menu.selectedCategory === cat.id" :size="16" class="ml-auto flex-shrink-0" />
            </button>
          </div>
        </Transition>
      </div>

      <!-- Loading skeleton -->
      <div v-if="menu.loading" class="grid grid-cols-2 gap-3">
        <div
          v-for="i in 6"
          :key="i"
          class="rounded-2xl overflow-hidden bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer"
          style="height: 230px"
        />
      </div>

      <!-- Items grid -->
      <div v-else class="grid grid-cols-2 gap-3">
        <div
          v-for="item in menu.filteredItems"
          :key="item.id"
          class="bg-white rounded-2xl overflow-hidden shadow-card border-2 cursor-pointer transition-all duration-200 group select-none hover:shadow-card-lg hover:-translate-y-1 active:scale-[0.97]"
          :class="isInCart(item.id) ? 'border-indigo-400' : 'border-transparent'"
          @click="handleAddItem(item)"
        >
          <!-- Image -->
          <div class="relative h-36 overflow-hidden">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-indigo-50 to-violet-100"
            >
              {{ getEmoji(item) }}
            </div>

            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            <!-- Cart qty badge -->
            <div
              v-if="getCartQty(item.id) > 0"
              class="absolute top-2 left-2 min-w-[22px] h-[22px] px-1 bg-indigo-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md"
            >
              {{ getCartQty(item.id) }}
            </div>

            <!-- Add button -->
            <button
              class="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-md"
              :class="isInCart(item.id)
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110'"
              @click.stop="handleAddItem(item)"
            >
              <Check v-if="isInCart(item.id)" :size="15" />
              <Plus v-else :size="15" />
            </button>
          </div>

          <!-- Info -->
          <div class="p-3">
            <p class="text-[13px] font-bold text-slate-800 truncate">{{ item.name }}</p>
            <p class="text-[11px] text-slate-400 mt-0.5 truncate">{{ item.description || 'Freshly prepared' }}</p>
            <p class="text-[15px] font-black text-indigo-600 mt-1.5">${{ item.price.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         ORDERS TAB
    ═══════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'orders'" class="max-w-2xl mx-auto px-4 pb-24">

      <!-- Header -->
      <div class="pt-6 pb-5">
        <h1 class="text-3xl font-black tracking-tight text-slate-900">My Orders 📋</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Live status · auto-updates</p>
      </div>

      <!-- Loading -->
      <div v-if="ordersLoading" class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p class="text-sm text-slate-400 font-medium">Fetching orders…</p>
      </div>

      <!-- Empty -->
      <div v-else-if="activeOrders.length === 0" class="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center text-4xl">
          📋
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-800">No orders yet</h3>
          <p class="text-sm text-slate-400 mt-1">Place an order and track it here</p>
        </div>
        <button
          class="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-glow"
          @click="activeTab = 'menu'"
        >
          Browse Menu
        </button>
      </div>

      <!-- Order cards -->
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="order in activeOrders"
          :key="order.id"
          class="bg-white rounded-3xl overflow-hidden shadow-card border transition-all duration-300"
          :class="{
            'border-emerald-300 ring-2 ring-emerald-100': order.status === 'ready',
            'border-slate-100': order.status !== 'ready',
            'opacity-70': order.status === 'completed' || order.status === 'cancelled',
          }"
        >
          <!-- Card header with colored band -->
          <div
            class="px-4 py-3 flex items-center justify-between"
            :class="{
              'bg-amber-50': order.status === 'pending',
              'bg-indigo-50': order.status === 'preparing',
              'bg-emerald-50': order.status === 'ready',
              'bg-slate-50': order.status === 'completed' || order.status === 'cancelled',
            }"
          >
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Order</p>
              <p class="text-base font-black text-slate-800">#{{ order.id.slice(-6).toUpperCase() }}</p>
              <p class="text-xs text-slate-500 font-semibold mt-0.5">{{ order.tableLabel || 'Takeaway' }}</p>
            </div>
            <span
              class="px-3 py-1.5 rounded-full text-xs font-black"
              :class="{
                'bg-amber-100 text-amber-700': order.status === 'pending',
                'bg-indigo-100 text-indigo-700': order.status === 'preparing',
                'bg-emerald-100 text-emerald-700': order.status === 'ready',
                'bg-slate-200 text-slate-500': order.status === 'completed' || order.status === 'cancelled',
                'bg-red-100 text-red-600': order.status === 'cancelled',
              }"
            >
              {{ statusEmoji(order.status) }} {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
            </span>
          </div>

          <!-- Progress tracker -->
          <div class="px-4 py-4">
            <div class="flex items-center justify-between relative">
              <!-- Connecting line -->
              <div class="absolute top-[14px] left-[14px] right-[14px] h-0.5 bg-slate-100" />
              <div
                class="absolute top-[14px] left-[14px] h-0.5 bg-indigo-500 transition-all duration-700"
                :style="`width: calc((${stepIndex(order.status)} / 3) * (100% - 28px))`"
              />

              <div
                v-for="(step, i) in orderSteps"
                :key="step.key"
                class="flex flex-col items-center gap-1.5 relative z-10"
              >
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 text-[12px]"
                  :class="{
                    'bg-indigo-600 text-white shadow-glow': stepIndex(order.status) >= i,
                    'bg-white border-2 border-slate-200 text-slate-400': stepIndex(order.status) < i,
                  }"
                >
                  <component
                    :is="stepIndex(order.status) > i ? CheckCircle2 : step.icon"
                    :size="13"
                  />
                </div>
                <span
                  class="text-[9px] font-bold text-center leading-tight max-w-[44px]"
                  :class="stepIndex(order.status) >= i ? 'text-indigo-600' : 'text-slate-400'"
                >
                  {{ step.label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="px-4 pb-3 flex flex-wrap gap-1.5">
            <span
              v-for="item in order.items"
              :key="item.id"
              class="px-2.5 py-1 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-600"
            >
              {{ item.quantity }}× {{ item.name }}
            </span>
          </div>

          <!-- Footer -->
          <div class="px-4 pb-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span class="text-xs text-slate-400 font-medium">{{ formatTime(order.createdAt) }}</span>
            <span class="text-lg font-black text-indigo-600">${{ order.grandTotal.toFixed(2) }}</span>
          </div>

          <!-- Ready banner -->
          <div
            v-if="order.status === 'ready'"
            class="mx-4 mb-4 px-4 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl text-white text-center text-sm font-black animate-bounce-sm shadow-md"
          >
            🎉 Your order is ready! Please collect it now.
          </div>

          <!-- Completed banner -->
          <div
            v-if="order.status === 'completed'"
            class="mx-4 mb-4 px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl text-center text-sm font-bold text-indigo-600"
          >
            ✅ Completed — Enjoy your meal!
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Cart FAB ─────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-6 scale-90"
      leave-to-class="opacity-0 translate-y-6 scale-90"
    >
      <NuxtLink
        v-if="cart.count > 0 && activeTab === 'menu'"
        to="/cart"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl shadow-[0_8px_32px_rgba(99,102,241,0.45)] font-bold text-sm whitespace-nowrap z-50 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)] transition-all active:scale-95"
      >
        <ShoppingCart :size="17" />
        <span>View Cart · {{ cart.count }} item{{ cart.count > 1 ? 's' : '' }}</span>
        <span class="px-3 py-1 bg-white/20 rounded-xl font-black text-[13px]">
          ${{ cart.totals.grandTotal.toFixed(2) }}
        </span>
      </NuxtLink>
    </Transition>

    <!-- ─── Ready Toast ────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-400 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0 -translate-y-4 scale-95"
      leave-to-class="opacity-0 -translate-y-4 scale-95"
    >
      <div
        v-if="readyToast"
        class="fixed top-16 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl shadow-card-lg border-2 border-emerald-400 cursor-pointer min-w-[260px] max-w-[320px]"
        @click="activeTab = 'orders'; readyToast = false"
      >
        <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl flex-shrink-0">
          🔔
        </div>
        <div class="flex-1">
          <p class="text-sm font-black text-slate-800">Order Ready!</p>
          <p class="text-xs text-slate-400">Tap to see details</p>
        </div>
        <button
          class="text-slate-300 hover:text-slate-500 text-lg font-bold ml-1"
          @click.stop="readyToast = false"
        >
          ×
        </button>
      </div>
    </Transition>

    <!-- ─── Product Options Modal ────────────────────────── -->
    <Transition enter-active-class="transition-all duration-200" leave-active-class="transition-all duration-150" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="selectedProductForOptions" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" @click.self="selectedProductForOptions = null">
        <div class="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div class="relative h-44 bg-slate-100 flex-shrink-0">
            <img v-if="selectedProductForOptions.imageUrl" :src="selectedProductForOptions.imageUrl" :alt="selectedProductForOptions.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-6xl">{{ getEmoji(selectedProductForOptions) }}</div>
            <button class="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm transition-colors" @click="selectedProductForOptions = null">
              <X :size="18" />
            </button>
          </div>
          <div class="p-5 flex-1 overflow-y-auto">
            <h3 class="text-xl font-black text-slate-800">{{ selectedProductForOptions.name }}</h3>
            <p v-if="selectedProductForOptions.description" class="text-sm text-slate-400 mt-1">{{ selectedProductForOptions.description }}</p>
            
            <!-- Sugar Level (if available) -->
            <div v-if="selectedProductForOptions.sugarLevels?.length" class="mt-5">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Sugar Level</p>
              <div class="grid grid-cols-5 gap-2">
                <button v-for="sl in selectedProductForOptions.sugarLevels" :key="sl"
                  class="py-2.5 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                  :class="selectedOptions.sugarLevel === sl ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 bg-white text-slate-500 hover:border-amber-200'"
                  @click="selectedOptions.sugarLevel = sl">
                  <Database :size="14" />
                  <span class="text-[10px] font-bold">{{ sl }}</span>
                </button>
              </div>
            </div>

            <!-- Ice Level (if available) -->
            <div v-if="selectedProductForOptions.iceLevels?.length" class="mt-5">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ice Level</p>
              <div class="grid grid-cols-4 gap-2">
                <button v-for="il in selectedProductForOptions.iceLevels" :key="il"
                  class="py-2.5 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                  :class="selectedOptions.iceLevel === il ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-100 bg-white text-slate-500 hover:border-cyan-200'"
                  @click="selectedOptions.iceLevel = il">
                  <Snowflake :size="14" />
                  <span class="text-[10px] font-bold leading-tight text-center px-1">{{ il }}</span>
                </button>
              </div>
            </div>
            
            <!-- Sizes -->
            <div v-if="productSizes(selectedProductForOptions).length > 0" class="mt-5">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Choose Size <span class="text-red-500">*</span></p>
              <div class="space-y-2">
                <button v-for="sz in productSizes(selectedProductForOptions)" :key="sz.name"
                  class="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all active:scale-[0.98]"
                  :class="selectedOptions.size === sz.name ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-300'"
                  @click="selectedOptions.size = sz.name">
                  <span class="text-sm font-bold" :class="selectedOptions.size === sz.name ? 'text-indigo-700' : 'text-slate-700'">{{ sz.name }}</span>
                  <span class="text-sm font-black" :class="selectedOptions.size === sz.name ? 'text-indigo-700' : 'text-slate-700'">${{ sz.price.toFixed(2) }}</span>
                </button>
              </div>
            </div>

            <!-- Modifiers -->
            <div v-if="productModifiers(selectedProductForOptions).length > 0" class="mt-6">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Modifiers (Optional)</p>
              <div class="space-y-2">
                <button v-for="mod in productModifiers(selectedProductForOptions)" :key="mod.id"
                  class="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all active:scale-[0.98]"
                  :class="selectedOptions.modifiers.includes(mod.id) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-emerald-300'"
                  @click="toggleModifier(mod.id)">
                  <div class="flex items-center gap-3">
                    <div class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
                         :class="selectedOptions.modifiers.includes(mod.id) ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent'">
                      <Check :size="12" stroke-width="4" />
                    </div>
                    <span class="text-sm font-bold" :class="selectedOptions.modifiers.includes(mod.id) ? 'text-emerald-700' : 'text-slate-700'">{{ mod.name }}</span>
                  </div>
                  <span class="text-sm font-black" :class="selectedOptions.modifiers.includes(mod.id) ? 'text-emerald-700' : 'text-slate-500'">+${{ mod.price.toFixed(2) }}</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Footer -->
          <div class="p-5 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <button class="w-full flex items-center justify-between py-3.5 px-5 rounded-2xl bg-indigo-600 text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!canAddWithOptions" @click="confirmAddOptions">
              <span class="font-bold">Add to Order</span>
              <span class="font-black text-lg">${{ optionsTotalPrice.toFixed(2) }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@cafe-nux/types'
import {
  Search, ShoppingCart, Plus, Check, X, ChevronDown, Snowflake, Database,
  UtensilsCrossed, ClipboardList, ChefHat, Bell, Coffee, CheckCircle2, Star
} from '@lucide/vue'
import { orderRepository } from '../src/data/repositories/order.repository'

definePageMeta({ layout: false })

const menu  = useMenuStore()
const cart  = useCartStore()
const route = useRoute()

const activeTab = ref<'menu' | 'orders'>('menu')
const activeOrders = ref<any[]>([])
const ordersLoading = ref(false)
const readyToast = ref(false)

const selectedProductForOptions = ref<MenuItem | null>(null)
const selectedOptions = ref<{ size: string, sugarLevel: string, iceLevel: string, modifiers: string[] }>({ size: '', sugarLevel: '', iceLevel: '', modifiers: [] })
const showCategoryDropdown = ref(false)

const productSizes = (item: MenuItem | null) => item?.sizes || []
const productModifiers = (item: MenuItem | null) => item?.modifiers || []

const toggleModifier = (id: string) => {
  const idx = selectedOptions.value.modifiers.indexOf(id)
  if (idx > -1) selectedOptions.value.modifiers.splice(idx, 1)
  else selectedOptions.value.modifiers.push(id)
}

const canAddWithOptions = computed(() => {
  if (!selectedProductForOptions.value) return false
  if (productSizes(selectedProductForOptions.value).length > 0 && !selectedOptions.value.size) return false
  return true
})

const optionsTotalPrice = computed(() => {
  if (!selectedProductForOptions.value) return 0
  const item = selectedProductForOptions.value
  let basePrice = item.price
  if (selectedOptions.value.size) {
    const sz = productSizes(item).find(s => s.name === selectedOptions.value.size)
    if (sz) basePrice = sz.price
  }
  let total = basePrice
  
  if (selectedOptions.value.modifiers.length > 0) {
    const mods = productModifiers(item).filter(m => selectedOptions.value.modifiers.includes(m.id))
    total += mods.reduce((sum, m) => sum + m.price, 0)
  }
  return total
})

let prevReadySet = new Set<string>()
let pollInterval: ReturnType<typeof setInterval>

// ── Tabs ─────────────────────────────────────────────────
const tabs = computed(() => [
  { id: 'menu',   label: 'Menu',      icon: UtensilsCrossed, badge: null },
  {
    id: 'orders', label: 'My Orders', icon: ClipboardList,
    badge: activeOrders.value.length > 0 ? activeOrders.value.length : null
  },
])

// ── Order steps ──────────────────────────────────────────
const orderSteps = [
  { key: 'pending',   label: 'Received', icon: ClipboardList },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready',     label: 'Ready!',    icon: Bell },
  { key: 'completed', label: 'Done',      icon: Star },
]
const stepIndex = (status: string) =>
  Math.max(0, ['pending','preparing','ready','completed'].indexOf(status))

const statusEmoji = (status: string) => ({
  pending:   '⏳', preparing: '👨‍🍳', ready: '🔔', completed: '✅', cancelled: '❌',
}[status] ?? '')

// ── Load orders ──────────────────────────────────────────
const tableId = route.query.table as string | undefined

const loadOrders = async () => {
  ordersLoading.value = true
  try {
    const all = await orderRepository.getAll() as any[]
    activeOrders.value = all
    const nowReady = new Set(all.filter(o => o.status === 'ready').map(o => o.id))
    for (const id of nowReady) {
      if (!prevReadySet.has(id)) {
        readyToast.value = true
        setTimeout(() => { readyToast.value = false }, 6000)
        break
      }
    }
    prevReadySet = nowReady
  } catch { /* silent */ }
  finally { ordersLoading.value = false }
}

const hasReadyOrder = computed(() => activeOrders.value.some(o => o.status === 'ready'))

// ── Cart helpers ─────────────────────────────────────────
const isInCart  = (id: string) => cart.items.some(i => i.menuItemId === id)
const getCartQty = (id: string) => cart.items.filter(i => i.menuItemId === id).reduce((sum, item) => sum + item.quantity, 0)
const handleAddItem = (item: MenuItem) => {
  if ((item.sizes && item.sizes.length > 0) || (item.sugarLevels && item.sugarLevels.length > 0) || (item.iceLevels && item.iceLevels.length > 0) || (item.modifiers && item.modifiers.length > 0)) {
    selectedProductForOptions.value = item
    selectedOptions.value = {
      size: item.sizes && item.sizes.length > 0 ? item.sizes[0].name : '',
      sugarLevel: item.sugarLevels && item.sugarLevels.length > 0 ? item.sugarLevels[2] || item.sugarLevels[0] : '', // Default to Normal (usually middle)
      iceLevel: item.iceLevels && item.iceLevels.length > 0 ? item.iceLevels[2] || item.iceLevels[0] : '',
      modifiers: []
    }
  } else {
    cart.add(item)
  }
}
const confirmAddOptions = () => {
  if (!selectedProductForOptions.value) return
  
  const item = selectedProductForOptions.value
  const selectedMods = productModifiers(item).filter(m => selectedOptions.value.modifiers.includes(m.id))
  
  cart.add(item, {
    size: selectedOptions.value.size || undefined,
    sugarLevel: selectedOptions.value.sugarLevel || undefined,
    iceLevel: selectedOptions.value.iceLevel || undefined,
    modifiers: selectedMods,
  })
  
  selectedProductForOptions.value = null
}

// ── Emoji fallback ───────────────────────────────────────
const emojiMap: Record<string, string> = {
  espresso: '☕', coffee: '☕', latte: '🥛', cappuccino: '☕',
  croissant: '🥐', muffin: '🧁', pastry: '🥐',
  iced: '🧊', matcha: '🍵', cold: '🧃', juice: '🧃',
  sandwich: '🥪', cake: '🎂', tea: '🍵',
}
const getEmoji = (item: MenuItem) => {
  const key = Object.keys(emojiMap).find(k => item.name.toLowerCase().includes(k))
  return key ? emojiMap[key] : '🍽️'
}

const formatTime = (ts: string) =>
  new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

// ── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  menu.load()
  if (tableId) cart.tableId = tableId
  loadOrders()
  pollInterval = setInterval(loadOrders, 8000)
})

onUnmounted(() => clearInterval(pollInterval))
</script>
