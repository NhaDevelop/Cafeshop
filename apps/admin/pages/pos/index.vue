<template>
  <div class="flex flex-col h-full overflow-hidden bg-slate-100 font-[Outfit,sans-serif]">

    <!-- ─── Tab Bar ──────────────────────────────────────── -->
    <div class="flex-shrink-0 bg-white border-b border-slate-100 px-6 flex items-center gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center gap-2.5 px-7 py-5 text-base font-bold border-b-2 transition-all duration-200"
        :class="activeTab === tab.id
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-400 hover:text-slate-600'"
        @click="activeTab = tab.id as 'pos' | 'orders'"
      >
        <component :is="tab.icon" :size="20" />
        {{ tab.label }}
        <span
          v-if="tab.badge !== undefined && tab.badge > 0"
          class="min-w-[22px] h-5 px-1.5 rounded-full text-xs font-black flex items-center justify-center"
          :class="tab.id === 'orders' ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-100 text-indigo-600'"
        >{{ tab.badge }}</span>
      </button>
    </div>

    <!-- ─── POS TAB ──────────────────────────────────────── -->
    <div v-show="activeTab === 'pos'" class="flex flex-1 overflow-hidden min-h-0">

      <!-- Category Sidebar -->
      <aside class="w-20 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col items-center py-4 gap-1 overflow-y-auto">
        <button
          v-for="(cat, i) in allCategories"
          :key="i"
          class="flex flex-col items-center gap-1.5 w-14 py-3 rounded-2xl transition-all duration-200 text-center"
          :class="selectedCategory === cat.id
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'"
          @click="selectedCategory = cat.id"
        >
          <component :is="cat.icon" :size="22" />
          <span class="text-[10px] font-semibold leading-tight px-1">{{ cat.name }}</span>
        </button>
      </aside>

      <!-- Products Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Header -->
        <div class="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div class="flex-1">
            <h1 class="text-lg font-bold text-slate-800 leading-none">Welcome back, {{ auth.user?.name || 'Admin' }} 👋</h1>
            <p class="text-xs text-slate-400 mt-0.5">{{ currentDate }}</p>
          </div>
          <div class="relative w-64">
            <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Search products…"
              class="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 outline-none focus:border-indigo-400 focus:bg-white transition-colors placeholder:text-slate-400"
            />
          </div>
        </div>

        <!-- Closed Banner -->
        <div v-if="!shopStore.isOpen" class="mx-5 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex-shrink-0">
          <BadgeX :size="16" class="flex-shrink-0" />
          Shop is closed — open the shop from the top bar before taking orders.
        </div>

        <!-- Products Grid -->
        <div class="flex-1 overflow-y-auto p-5">
          <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            <div
              v-for="item in filteredSearchItems"
              :key="item.id"
              class="bg-white rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer group select-none"
              :class="[
                !shopStore.isOpen ? 'opacity-50 pointer-events-none' : 'hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]',
                getCartQty(item.id) > 0 ? 'border-indigo-500 shadow-md shadow-indigo-100' : 'border-transparent shadow-sm hover:border-slate-200'
              ]"
              @click="handleProductClick(item)"
            >
              <div class="relative h-44 bg-slate-100 overflow-hidden">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <component :is="getItemIcon(item)" :size="44" class="text-slate-300" />
                </div>
                <div v-if="getCartQty(item.id) > 0" class="absolute top-2.5 right-2.5 min-w-[26px] h-[26px] px-1.5 bg-indigo-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg">
                  {{ getCartQty(item.id) }}
                </div>
                <div v-if="productHasOptions(item)" class="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Options
                </div>
              </div>
              <div class="p-3.5">
                <p class="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-1">{{ getCategoryName(item.categoryId) }}</p>
                <p class="text-base font-bold text-slate-800 truncate">{{ item.name }}</p>
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-lg font-black text-slate-900">{{ productPriceLabel(item) }}</span>
                  <div v-if="getCartQty(item.id) > 0 && !productHasOptions(item)" class="flex items-center gap-1.5" @click.stop>
                    <button class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors" @click.stop="decrementFromGrid(item.id)">
                      <Minus :size="12" stroke-width="3" />
                    </button>
                    <span class="text-sm font-black text-slate-800 w-4 text-center">{{ getCartQty(item.id) }}</span>
                    <button class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors" @click.stop="handleProductClick(item)">
                      <Plus :size="12" stroke-width="3" />
                    </button>
                  </div>
                  <button v-else class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                    :class="getCartQty(item.id) > 0 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white hover:shadow-md hover:shadow-indigo-200'"
                    @click.stop="handleProductClick(item)">
                    <Plus :size="15" stroke-width="2.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Panel -->
      <aside class="w-[360px] flex-shrink-0 bg-white border-l border-slate-100 flex flex-col">
        <div class="px-5 pt-5 pb-4 border-b border-slate-100 space-y-3">
          <button class="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl px-3.5 py-2.5 text-left border border-transparent hover:border-slate-200" @click="showTableModal = true" :disabled="!shopStore.isOpen">
            <div class="flex items-center gap-3">
              <MapPin :size="14" class="text-indigo-500 flex-shrink-0" />
              <span class="text-sm font-semibold" :class="cartStore.tableNumber ? 'text-slate-800' : 'text-slate-400'">
                {{ cartStore.tableNumber ? `Table ${cartStore.tableNumber}` : 'Select Table' }}
              </span>
            </div>
            <ChevronRight :size="14" class="text-slate-400" />
          </button>
          
          <button class="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl px-3.5 py-2.5 text-left border border-transparent hover:border-slate-200" @click="showCustomerModal = true" :disabled="!shopStore.isOpen">
            <div class="flex items-center gap-3">
              <UserRound :size="14" class="text-emerald-500 flex-shrink-0" />
              <div class="flex flex-col">
                <span class="text-sm font-semibold" :class="cartStore.customerName ? 'text-slate-800' : 'text-slate-400'">
                  {{ cartStore.customerName || 'Walk-in Customer' }}
                </span>
                <span v-if="cartStore.customerPhone" class="text-[10px] font-bold text-slate-400">{{ cartStore.customerPhone }}</span>
              </div>
            </div>
            <ChevronRight :size="14" class="text-slate-400" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-center py-10 opacity-40">
            <ShoppingCart :size="40" class="text-slate-400 mb-3" />
            <p class="text-sm font-semibold text-slate-500">Cart is empty</p>
            <p class="text-xs text-slate-400 mt-1">Add products from the grid</p>
          </div>
          <div v-for="item in cartStore.items" :key="item.id" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group/item">
            <div class="flex-1 min-w-0">
              <p class="text-base font-bold text-slate-800 truncate">{{ item.name }}<span v-if="item.size" class="text-sm font-normal text-slate-500"> ({{ item.size }})</span></p>
              
              <div class="flex flex-wrap gap-1 mt-1">
                <span v-if="item.sugarLevel" class="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5"><Database :size="8"/> Sugar {{ item.sugarLevel }}</span>
                <span v-if="item.iceLevel" class="text-[9px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5"><Snowflake :size="8"/> {{ item.iceLevel }}</span>
                <span v-for="m in item.modifiers" :key="m.id" class="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-semibold">{{ m.name }}</span>
              </div>
              
              <div class="flex items-center justify-between mt-1.5">
                <p class="text-xs text-slate-400">{{ currencyStore.format(item.price) }} base</p>
                <!-- Per-item Discount -->
                <button class="text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors" 
                  :class="item.itemDiscount && item.itemDiscount > 0 ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'"
                  @click="promptItemDiscount(item)">
                  <Percent :size="10" class="inline" /> {{ item.itemDiscount && item.itemDiscount > 0 ? `-${currencyStore.format(item.itemDiscount)}` : 'Disc' }}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-1.5 bg-white rounded-xl px-1 py-1 shadow-sm">
              <button class="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors" :disabled="!shopStore.isOpen" @click.stop="updateCartQty(item.id, item.quantity - 1)">
                <Minus :size="10" stroke-width="3" />
              </button>
              <span class="text-xs font-black text-slate-800 w-5 text-center">{{ item.quantity }}</span>
              <button class="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors" :disabled="!shopStore.isOpen" @click.stop="updateCartQty(item.id, item.quantity + 1)">
                <Plus :size="10" stroke-width="3" />
              </button>
            </div>
            <p class="text-sm font-black text-slate-800 min-w-[52px] text-right">{{ currencyStore.format(item.subtotal) }}</p>
            <button class="opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-red-500 transition-all" @click="cartStore.removeItem(item.id)">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>

        <div class="border-t border-slate-100 px-5 pt-4 pb-5 space-y-4">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between text-slate-500"><span>Subtotal</span><span class="font-semibold text-slate-700">{{ currencyStore.format(cartStore.subtotal) }}</span></div>
            <div class="flex justify-between text-slate-500"><span>Tax (10%)</span><span class="font-semibold text-slate-700">{{ currencyStore.format(cartStore.tax) }}</span></div>
            <div class="flex justify-between text-slate-500">
              <span class="flex items-center gap-1 cursor-pointer hover:text-indigo-600 group" @click="startDiscountEdit">
                Discount <Edit2 :size="10" class="opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              <span v-if="!editDiscount" class="font-semibold text-red-500">-{{ currencyStore.format(cartStore.discount) }}</span>
              <input v-else type="number" v-model.number="tempDiscount" :disabled="!shopStore.isOpen" class="w-20 text-right border border-indigo-400 rounded-lg px-2 py-0.5 text-sm outline-none" @blur="applyDiscount" @keyup.enter="applyDiscount" autofocus />
            </div>
            <div class="flex justify-between pt-3 border-t border-dashed border-slate-200 font-black text-base">
              <span class="text-slate-800">Total</span>
              <span class="text-indigo-600">{{ currencyStore.format(cartStore.total) }}</span>
            </div>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <button class="flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
              :class="!shopStore.isOpen ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'"
              :disabled="!shopStore.isOpen" @click="handleHold">
              <Pause :size="18" /> Hold
            </button>
            <button class="flex flex-col items-center gap-1 py-3 rounded-2xl bg-red-50 text-red-500 text-xs font-bold transition-all hover:bg-red-100 hover:scale-105 active:scale-95" @click="handleVoid">
              <XCircle :size="18" /> Void
            </button>
            <button class="flex flex-col items-center gap-1 py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-xs font-bold transition-all hover:bg-emerald-100 hover:scale-105 active:scale-95" @click="showViewOrders = true">
              <ListOrdered :size="18" /> Orders
            </button>
            <button class="flex flex-col items-center gap-1 py-3 rounded-2xl bg-slate-100 text-slate-500 text-xs font-bold transition-all hover:bg-slate-200 hover:scale-105 active:scale-95" @click="handleReset">
              <RefreshCw :size="18" /> Reset
            </button>
          </div>
          <button class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all active:scale-95" @click="showTransactions = true">
            <ArrowRightLeft :size="16" /> Transaction History
          </button>
          <button
            class="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-base font-black tracking-wide transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            :class="shopStore.isOpen && cartStore.items.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200' : 'bg-slate-300'"
            :disabled="!shopStore.isOpen || cartStore.items.length === 0"
            @click="openPayment"
          >
            <CreditCard :size="20" /> Pay {{ currencyStore.format(cartStore.total) }}
          </button>
        </div>
      </aside>
    </div>

    <!-- ─── ORDERS TAB ───────────────────────────────────── -->
    <div v-show="activeTab === 'orders'" class="flex-1 overflow-hidden flex flex-col min-h-0">
      <!-- Orders Header -->
      <div class="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <div class="flex-1">
          <h2 class="text-lg font-bold text-slate-800">Incoming Orders</h2>
          <p class="text-xs text-slate-400 mt-0.5">Live queue — {{ pendingOrdersCount }} pending · {{ preparingOrdersCount }} preparing</p>
        </div>
        <button class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors" @click="refreshOrders">
          <RefreshCw :size="15" :class="{ 'animate-spin': ordersLoading }" /> Refresh
        </button>
      </div>

      <!-- Status filter -->
      <div class="bg-white border-b border-slate-100 px-6 py-4 flex gap-3 flex-shrink-0">
        <button
          v-for="f in orderFilters"
          :key="f.value"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
          :class="orderStatusFilter === f.value
            ? `${f.activeBg} ${f.activeText}`
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
          @click="orderStatusFilter = f.value"
        >
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="f.dot"></span>
          {{ f.label }}
          <span class="text-xs font-black bg-white/60 px-1.5 py-0.5 rounded-lg min-w-[20px] text-center">{{ getOrderCount(f.value) }}</span>
        </button>
      </div>

      <!-- Orders Grid -->
      <div class="flex-1 overflow-y-auto p-5">
        <div v-if="ordersLoading" class="flex items-center justify-center h-40">
          <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center h-40 text-center opacity-40">
          <ClipboardList :size="40" class="text-slate-400 mb-3" />
          <p class="text-sm font-semibold text-slate-500">No orders</p>
          <p class="text-xs text-slate-400">Orders will appear here as they come in</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md"
          >
            <!-- Card Header -->
            <div class="px-4 py-3.5 flex items-center justify-between border-b border-slate-100"
              :class="{
                'bg-amber-50': order.status === 'pending',
                'bg-indigo-50': order.status === 'preparing',
                'bg-emerald-50': order.status === 'ready',
                'bg-slate-50': order.status === 'completed' || order.status === 'cancelled',
              }">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ order.source === 'online' ? '🌐 Online' : '🏪 Walk-in' }}</p>
                <p class="text-base font-black text-slate-800 mt-0.5">{{ order.tableLabel || 'Takeaway' }}</p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-black capitalize"
                :class="{
                  'bg-red-100 text-red-700': order.paymentStatus === 'unpaid',
                  'bg-amber-100 text-amber-700': order.paymentStatus === 'paid' && order.status === 'pending',
                  'bg-indigo-100 text-indigo-700': order.status === 'preparing',
                  'bg-emerald-100 text-emerald-700': order.status === 'ready',
                  'bg-slate-200 text-slate-500': order.status === 'completed' || order.status === 'cancelled',
                }">
                {{ order.paymentStatus === 'unpaid' ? 'Unpaid' : order.status }}
              </span>
            </div>

            <!-- Items -->
            <div class="px-4 py-3 flex-1 space-y-1.5">
              <div v-for="item in order.items" :key="item.id" class="flex items-start justify-between gap-2">
                <div class="flex-1">
                  <span class="text-sm font-semibold text-slate-800">{{ item.name }}</span>
                  <span v-if="item.note" class="block text-xs text-slate-400 italic">{{ item.note }}</span>
                </div>
                <span class="text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">× {{ item.quantity }}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-4 pb-4 pt-2 border-t border-slate-100 space-y-2.5">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-400">{{ formatOrderTime(order.createdAt) }}</span>
                <span class="text-sm font-black text-slate-800">{{ currencyStore.format(order.grandTotal) }}</span>
              </div>

              <!-- Action buttons -->
              <div class="flex gap-2">
                <button
                  v-if="order.paymentStatus === 'unpaid' && order.status !== 'completed' && order.status !== 'cancelled'"
                  class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors active:scale-95"
                  @click="checkoutIncomingOrder(order)"
                >
                  <CreditCard :size="14" /> Pay
                </button>
                <button
                  v-if="order.status === 'pending'"
                  class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors active:scale-95"
                  :disabled="updatingOrderId === order.id"
                  @click="updateOrderStatus(order.id, 'preparing')"
                >
                  <ChefHat :size="14" />
                  {{ updatingOrderId === order.id ? 'Updating…' : 'Start Preparing' }}
                </button>
                <button
                  v-if="order.status === 'preparing'"
                  class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors active:scale-95"
                  :disabled="updatingOrderId === order.id"
                  @click="updateOrderStatus(order.id, 'ready')"
                >
                  <Bell :size="14" />
                  {{ updatingOrderId === order.id ? 'Updating…' : 'Mark Ready' }}
                </button>
                <button
                  v-if="order.status === 'ready' && order.paymentStatus === 'paid'"
                  class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors active:scale-95"
                  :disabled="updatingOrderId === order.id"
                  @click="completeIncomingOrder(order)"
                >
                  <CheckCircle :size="14" /> Complete
                </button>
                <button
                  v-if="order.status !== 'completed' && order.status !== 'cancelled'"
                  class="w-9 h-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0"
                  :disabled="updatingOrderId === order.id"
                  @click="updateOrderStatus(order.id, 'cancelled')"
                >
                  <X :size="15" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Toast ─────────────────────────────────────────── -->
    <Transition enter-active-class="transition-all duration-300" leave-active-class="transition-all duration-200" enter-from-class="opacity-0 translate-y-2 scale-95" leave-to-class="opacity-0 translate-y-2 scale-95">
      <div v-if="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl text-white" :class="toast.type === 'success' ? 'bg-slate-900' : 'bg-red-500'">
        <CheckCircle v-if="toast.type === 'success'" :size="17" />
        <XCircle v-else :size="17" />
        {{ toast.message }}
      </div>
    </Transition>

    <!-- ─── Product Options Modal ────────────────────────── -->
    <Transition enter-active-class="transition-all duration-200" leave-active-class="transition-all duration-150" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="selectedProductForOptions" class="fixed inset-0 z-[1100] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm" @click.self="selectedProductForOptions = null">
        <div class="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div class="relative h-44 bg-slate-100 flex-shrink-0">
            <img v-if="selectedProductForOptions.imageUrl" :src="selectedProductForOptions.imageUrl" :alt="selectedProductForOptions.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center"><component :is="getItemIcon(selectedProductForOptions)" :size="56" class="text-slate-300" /></div>
            <button class="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 shadow-sm transition-colors" @click="selectedProductForOptions = null">
              <X :size="18" />
            </button>
          </div>
          <div class="p-5 flex-1 overflow-y-auto">
            <p class="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-0.5">{{ getCategoryName(selectedProductForOptions.categoryId) }}</p>
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
                  <span class="text-sm font-black" :class="selectedOptions.size === sz.name ? 'text-indigo-700' : 'text-slate-700'">{{ currencyStore.format(getDiscountedPriceVal(sz.price, selectedProductForOptions.discount)) }}</span>
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
                  <span class="text-sm font-black" :class="selectedOptions.modifiers.includes(mod.id) ? 'text-emerald-700' : 'text-slate-500'">+{{ currencyStore.format(mod.price) }}</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Footer -->
          <div class="p-5 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <button class="w-full flex items-center justify-between py-3.5 px-5 rounded-2xl bg-indigo-600 text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!canAddWithOptions" @click="confirmAddOptions">
              <span class="font-bold">Add to Order</span>
              <span class="font-black text-lg">{{ currencyStore.format(optionsTotalPrice) }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <HoldOrdersModal v-model="showHoldOrders" />
    <PaymentModal v-model="showPayment" @completed="onPaymentCompleted" />
    <ReceiptModal v-model="showReceipt" :order="lastCompletedOrder" />
    <ViewOrdersDrawer v-model="showViewOrders" />
    <TransactionHistoryModal v-model="showTransactions" />

    <!-- ─── Table Selection Modal ────────────────────────── -->
    <Transition enter-active-class="transition-all duration-200" leave-active-class="transition-all duration-150" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="showTableModal" class="fixed inset-0 z-[2000] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm" @click.self="showTableModal = false">
        <div class="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] bg-slate-50">
          <div class="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
            <div>
              <h3 class="text-xl font-black text-slate-800">Select Table</h3>
              <p class="text-sm text-slate-400 mt-0.5">Click a table to assign to current order</p>
            </div>
            <button class="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-red-500 transition-colors" @click="showTableModal = false">
              <X :size="20" />
            </button>
          </div>
          <div class="p-6 flex-1 overflow-y-auto">
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div v-for="table in productStore.tables" :key="table.id" 
                class="relative rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-1"
                :class="{
                  'border-emerald-500 bg-emerald-50 shadow-emerald-100 shadow-lg': cartStore.tableId === table.id,
                  'border-slate-200 bg-white hover:border-indigo-300': cartStore.tableId !== table.id && table.status === 'available',
                  'border-amber-200 bg-amber-50 opacity-60 cursor-not-allowed': table.status === 'occupied',
                  'border-indigo-200 bg-indigo-50 opacity-60 cursor-not-allowed': table.status === 'reserved'
                }"
                @click="table.status === 'available' || cartStore.tableId === table.id ? selectTable(table) : null">
                
                <div class="absolute top-2 right-2 flex items-center gap-1">
                  <UserRound :size="10" class="text-slate-400" />
                  <span class="text-[10px] font-bold text-slate-400">{{ table.capacity }}</span>
                </div>
                
                <MapPin :size="24" :class="cartStore.tableId === table.id ? 'text-emerald-500' : (table.status === 'available' ? 'text-slate-300' : 'text-slate-400')" />
                <span class="text-2xl font-black text-slate-700">{{ table.number }}</span>
                <span class="text-[10px] font-bold uppercase tracking-widest"
                  :class="{
                    'text-emerald-600': table.status === 'available' && cartStore.tableId !== table.id,
                    'text-emerald-700': cartStore.tableId === table.id,
                    'text-amber-600': table.status === 'occupied',
                    'text-indigo-600': table.status === 'reserved'
                  }">
                  {{ cartStore.tableId === table.id ? 'Selected' : table.status }}
                </span>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
            <button class="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors" @click="clearTable">Clear Table</button>
            <button class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors" @click="showTableModal = false">Done</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ─── Customer Selection Modal ─────────────────────── -->
    <Transition enter-active-class="transition-all duration-200" leave-active-class="transition-all duration-150" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="showCustomerModal" class="fixed inset-0 z-[2000] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm" @click.self="showCustomerModal = false">
        <div class="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 class="text-xl font-black text-slate-800">Select Customer</h3>
            <button class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-red-500 transition-colors" @click="showCustomerModal = false">
              <X :size="18" />
            </button>
          </div>
          <div class="p-5 border-b border-slate-100 bg-slate-50">
            <div class="relative">
              <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input v-model="customerSearch" type="text" placeholder="Search by name or phone..." class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 text-sm font-semibold" autofocus />
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-3">
            <button class="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border-2"
              :class="!cartStore.customerPhone ? 'border-emerald-500 bg-emerald-50' : 'border-transparent'"
              @click="clearCustomer">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <UserRound :size="18" />
                </div>
                <div class="text-left">
                  <p class="text-sm font-bold text-slate-700">Walk-in Customer</p>
                  <p class="text-[10px] font-semibold text-slate-400">No loyalty tracking</p>
                </div>
              </div>
              <CheckCircle v-if="!cartStore.customerPhone" :size="20" class="text-emerald-500" />
            </button>
            
            <div class="my-2 h-px bg-slate-100 mx-4"></div>

            <button v-for="cust in filteredCustomers" :key="cust.id" 
              class="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border-2"
              :class="cartStore.customerPhone === cust.phone ? 'border-indigo-500 bg-indigo-50' : 'border-transparent'"
              @click="selectCustomer(cust)">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                  :class="cartStore.customerPhone === cust.phone ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'">
                  {{ cust.name.charAt(0) }}
                </div>
                <div class="text-left">
                  <p class="text-sm font-bold text-slate-800">{{ cust.name }}</p>
                  <p class="text-[11px] font-semibold text-slate-500">{{ cust.phone }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-black text-amber-500">{{ cust.points }} pts</p>
                <p class="text-[10px] font-semibold text-slate-400">{{ cust.totalOrders }} orders</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  ShoppingBag, ClipboardList,
  LayoutGrid, Search, ShoppingCart, CreditCard, Coffee, UtensilsCrossed, CakeSlice, CupSoda,
  Plus, Minus, Trash2, CheckCircle, Pause, XCircle, ListOrdered, RefreshCw, ArrowRightLeft,
  Edit2, Headphones, Monitor, Watch, Shirt, Laptop, MapPin, X, BadgeX, UserRound,
  ChefHat, Bell, Clock, Check, ChevronRight, Snowflake, Database, Percent
} from '@lucide/vue'
import type { Category, MenuItem, ProductSize, ProductModifier, SugarLevel, IceLevel, Table, Customer } from '../../src/types'
import { useCurrencyStore } from '../../src/presentation/viewmodels/settings/useCurrencyViewModel'
import { orderRepository } from '../../src/data/repositories/order.repository'

definePageMeta({ layout: 'pos', middleware: 'auth' })

// ── Stores ──────────────────────────────────────────────
const auth = useAuthStore()
const shopStore = useShopStore()
const productStore = useProductStore()
const cartStore = useCartStore()
const holdStore = useHoldStore()
const orderStore = useOrderStore()
const currencyStore = useCurrencyStore()
const shiftStore = useShiftStore()

// ── Tab state ────────────────────────────────────────────
const activeTab = ref<'pos' | 'orders'>('pos')

const pendingOrdersCount = computed(() => liveOrders.value.filter(o => o.status === 'pending').length)
const preparingOrdersCount = computed(() => liveOrders.value.filter(o => o.status === 'preparing').length)

const tabs = computed(() => [
  { id: 'pos', label: 'POS Terminal', icon: ShoppingBag, badge: cartStore.items.length || undefined },
  { id: 'orders', label: 'Order Queue', icon: ClipboardList, badge: pendingOrdersCount.value + preparingOrdersCount.value },
])

// ── POS state ────────────────────────────────────────────
const search = ref('')
const selectedCategory = ref<string | null>(null)
const currentDate = ref('')

const iconMap: Record<string, any> = {
  coffee: Coffee, espresso: Coffee, latte: Coffee, cappuccino: Coffee,
  pastries: CakeSlice, croissant: CakeSlice, muffin: CakeSlice,
  drinks: CupSoda, iced: CupSoda, cold: CupSoda,
  headset: Headphones, mobiles: Headphones, shoes: Shirt,
  watches: Watch, computer: Monitor, laptops: Laptop, appliance: Monitor
}
const getIcon = (cat: Category) => iconMap[Object.keys(iconMap).find(k => cat.name.toLowerCase().includes(k)) || ''] || UtensilsCrossed
const getItemIcon = (item: MenuItem) => iconMap[Object.keys(iconMap).find(k => item.name.toLowerCase().includes(k)) || ''] || UtensilsCrossed

const allCategories = computed(() => [
  { id: null, name: 'All', icon: LayoutGrid },
  ...productStore.categories.map(c => ({ ...c, icon: getIcon(c) }))
])

onMounted(() => {
  currentDate.value = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  productStore.fetchProducts()
  refreshOrders()
})

const filteredSearchItems = computed(() => {
  if (search.value) return productStore.searchResults(search.value)
  return productStore.byCategory(selectedCategory.value || '')
})

const getCategoryName = (id: string) => productStore.categories.find(c => c.id === id)?.name || 'General'
const getCartQty = (id: string) => cartStore.items.filter((c: any) => c.menuItemId === id).reduce((s: number, c: any) => s + c.quantity, 0)
const getCartQtyForSize = (id: string, size: string) =>
  cartStore.items.filter(item => item.menuItemId === id && item.size === size).reduce((sum, item) => sum + item.quantity, 0)
const productSizes = (item: MenuItem): ProductSize[] => item.sizes?.length ? item.sizes : []
const productModifiers = (item: MenuItem): ProductModifier[] => item.modifiers?.length ? item.modifiers : []
const productHasOptions = (item: MenuItem) => productSizes(item).length > 0 || productModifiers(item).length > 0

const ensureShopOpen = (message = 'Open shop before taking orders') => {
  if (shopStore.isOpen) return true
  showToast(message, 'error')
  return false
}

const decrementFromGrid = (id: string) => {
  if (!ensureShopOpen()) return
  const cartItem = cartStore.items.find(i => i.menuItemId === id)
  if (cartItem) cartStore.updateQty(cartItem.id, cartItem.quantity - 1)
}

const updateCartQty = (cartItemId: string, qty: number) => {
  if (!ensureShopOpen()) return
  cartStore.updateQty(cartItemId, qty)
}

const getDiscountedPriceVal = (price: number, discountPercent?: number) => {
  if (!discountPercent) return price
  return price * (1 - discountPercent / 100)
}

const productPriceLabel = (item: MenuItem) => {
  const sizes = productSizes(item)
  if (!sizes.length) return currencyStore.format(getDiscountedPriceVal(item.price, item.discount))
  const prices = sizes.map(s => getDiscountedPriceVal(s.price, item.discount))
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? currencyStore.format(min) : `From ${currencyStore.format(min)}`
}

const selectedProductForOptions = ref<MenuItem | null>(null)
const selectedOptions = ref<{ size: string | null, modifiers: string[], sugarLevel: SugarLevel | null, iceLevel: IceLevel | null }>({ size: null, modifiers: [], sugarLevel: null, iceLevel: null })

const handleProductClick = (item: MenuItem) => {
  if (!ensureShopOpen()) return
  if (productHasOptions(item) || item.sugarLevels?.length || item.iceLevels?.length) {
    selectedProductForOptions.value = item
    // Default size selection if any
    const sizes = productSizes(item)
    selectedOptions.value = { 
      size: sizes.length ? sizes[0].name : null, 
      modifiers: [],
      sugarLevel: item.sugarLevels?.length ? '50%' : null,
      iceLevel: item.iceLevels?.length ? 'Normal Ice' : null
    }
  } else {
    cartStore.addItem({ id: item.id, name: item.name, price: getDiscountedPriceVal(item.price, item.discount) })
    showToast(`${item.name} added`)
  }
}

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
  let total = getDiscountedPriceVal(basePrice, item.discount)
  
  if (selectedOptions.value.modifiers.length > 0) {
    const mods = productModifiers(item).filter(m => selectedOptions.value.modifiers.includes(m.id))
    total += mods.reduce((sum, m) => sum + m.price, 0)
  }
  return total
})

const confirmAddOptions = () => {
  if (!ensureShopOpen()) return
  if (!selectedProductForOptions.value) return
  
  const item = selectedProductForOptions.value
  let basePrice = item.price
  if (selectedOptions.value.size) {
    const sz = productSizes(item).find(s => s.name === selectedOptions.value.size)
    if (sz) basePrice = sz.price
  }
  
  const selectedMods = productModifiers(item).filter(m => selectedOptions.value.modifiers.includes(m.id))
  
  cartStore.addItem({ 
    id: item.id, 
    name: item.name, 
    price: getDiscountedPriceVal(basePrice, item.discount), 
    size: selectedOptions.value.size || undefined,
    sugarLevel: selectedOptions.value.sugarLevel || undefined,
    iceLevel: selectedOptions.value.iceLevel || undefined,
    modifiers: selectedMods
  })
  
  selectedProductForOptions.value = null
  showToast(`${item.name} added`)
}

// ── Item Discount ─────────────────────────────────────────
const promptItemDiscount = (item: any) => {
  if (!ensureShopOpen()) return
  const current = item.itemDiscount || 0
  const input = prompt(`Enter discount amount for ${item.name} ($):\nCurrent: $${current}`, current.toString())
  if (input === null) return
  const val = parseFloat(input)
  if (!isNaN(val) && val >= 0) {
    cartStore.updateItemDiscount(item.id, val)
    showToast('Item discount updated')
  } else {
    showToast('Invalid discount amount', 'error')
  }
}

// ── Table & Customer Modals ───────────────────────────────
const showTableModal = ref(false)
const showCustomerModal = ref(false)
const customerSearch = ref('')

const filteredCustomers = computed(() => {
  if (!customerSearch.value) return productStore.customers
  return productStore.searchCustomers(customerSearch.value)
})

const selectTable = (table: Table) => {
  cartStore.setTable(table.id, table.number.toString())
  showTableModal.value = false
}

const clearTable = () => {
  cartStore.setTable('', '')
  showTableModal.value = false
}

const selectCustomer = (customer: Customer) => {
  cartStore.setCustomer(customer.phone, customer.name)
  showCustomerModal.value = false
}

const clearCustomer = () => {
  cartStore.setCustomer('', '')
  showCustomerModal.value = false
}

// ── Orders tab state ─────────────────────────────────────
const liveOrders = ref<any[]>([])
const ordersLoading = ref(false)
const orderStatusFilter = ref<string>('all')
const updatingOrderId = ref<string | null>(null)
let ordersInterval: ReturnType<typeof setInterval> | undefined

const orderFilters = [
  { value: 'unpaid', label: 'Pending Payment', dot: 'bg-red-500', activeBg: 'bg-red-100', activeText: 'text-red-700' },
  { value: 'in_progress', label: 'Paid / In Progress', dot: 'bg-indigo-500', activeBg: 'bg-indigo-100', activeText: 'text-indigo-700' },
  { value: 'ready', label: 'Ready', dot: 'bg-emerald-500', activeBg: 'bg-emerald-100', activeText: 'text-emerald-700' },
  { value: 'completed', label: 'Completed', dot: 'bg-slate-300', activeBg: 'bg-slate-100', activeText: 'text-slate-600' },
  { value: 'all', label: 'All Orders', dot: 'bg-slate-400', activeBg: 'bg-slate-800', activeText: 'text-white' },
]

const filteredOrders = computed(() => {
  if (orderStatusFilter.value === 'all') return liveOrders.value
  if (orderStatusFilter.value === 'unpaid') return liveOrders.value.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'completed' && o.status !== 'cancelled')
  if (orderStatusFilter.value === 'in_progress') return liveOrders.value.filter(o => o.paymentStatus === 'paid' && (o.status === 'pending' || o.status === 'preparing'))
  if (orderStatusFilter.value === 'ready') return liveOrders.value.filter(o => o.status === 'ready')
  if (orderStatusFilter.value === 'completed') return liveOrders.value.filter(o => o.status === 'completed' || o.status === 'cancelled')
  return liveOrders.value
})

const getOrderCount = (status: string) => {
  if (status === 'all') return liveOrders.value.length
  if (status === 'unpaid') return liveOrders.value.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'completed' && o.status !== 'cancelled').length
  if (status === 'in_progress') return liveOrders.value.filter(o => o.paymentStatus === 'paid' && (o.status === 'pending' || o.status === 'preparing')).length
  if (status === 'ready') return liveOrders.value.filter(o => o.status === 'ready').length
  if (status === 'completed') return liveOrders.value.filter(o => o.status === 'completed' || o.status === 'cancelled').length
  return 0
}

const refreshOrders = async () => {
  ordersLoading.value = true
  try {
    liveOrders.value = await orderRepository.getAll()
  } finally {
    ordersLoading.value = false
  }
}

const updateOrderStatus = async (orderId: string, status: string) => {
  updatingOrderId.value = orderId
  try {
    await orderRepository.updateStatus(orderId, status as any)
    const idx = liveOrders.value.findIndex(o => o.id === orderId)
    if (idx !== -1) liveOrders.value[idx].status = status
    showToast(`Order ${status}`)
  } catch {
    showToast('Failed to update order', 'error')
  } finally {
    updatingOrderId.value = null
  }
}

const formatOrderTime = (ts: string) => {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  // Poll every 5 seconds so customer orders appear almost instantly
  ordersInterval = setInterval(async () => {
    const prevIds = new Set(liveOrders.value.map((o: any) => o.id))
    await refreshOrders()
    const newOrders = liveOrders.value.filter((o: any) => !prevIds.has(o.id) && o.status === 'pending')
    if (newOrders.length > 0) {
      showToast(`🔔 ${newOrders.length} new order${newOrders.length > 1 ? 's' : ''} arrived!`, 'success')
      // Switch to orders tab automatically
      if (activeTab.value !== 'orders') activeTab.value = 'orders'
    }
  }, 5000)
})

onUnmounted(() => {
  if (ordersInterval) clearInterval(ordersInterval)
})

// ── Toast ─────────────────────────────────────────────────
const toast = ref({ show: false, type: 'success', message: '' })
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 2500)
}

// ── Cart Actions ──────────────────────────────────────────
const editDiscount = ref(false)
const tempDiscount = ref(0)
const startDiscountEdit = () => {
  if (!ensureShopOpen('Open shop before editing discounts')) return
  editDiscount.value = true
}
const applyDiscount = () => {
  if (!shopStore.isOpen) { editDiscount.value = false; return }
  cartStore.applyDiscount(tempDiscount.value)
  editDiscount.value = false
}

const showHoldOrders = ref(false)
const handleHold = () => {
  if (!ensureShopOpen('Open shop before holding orders')) return
  if (cartStore.items.length === 0) { showHoldOrders.value = true; return }
  holdStore.holdCart({ 
    items: cartStore.items, 
    tableNumber: cartStore.tableNumber, 
    customerPhone: cartStore.customerPhone || undefined, 
    total: cartStore.total 
  })
  cartStore.clearCart()
  showToast('Order held')
}

const handleVoid = () => {
  if (cartStore.items.length === 0) { showToast('Cart is empty', 'error'); return }
  if (confirm('Void this order? This cannot be undone.')) {
    orderStore.voidOrder({
      orderId: `VOID-${Date.now().toString().slice(-6)}`,
      items: JSON.parse(JSON.stringify(cartStore.items)),
      total: cartStore.total, paymentMethod: '',
      cashier: auth.user?.name || 'Admin',
      timestamp: new Date().toISOString(),
      businessDate: shopStore.currentBusinessDate,
      customerPhone: cartStore.customerPhone || undefined,
      change: 0, status: 'voided'
    })
    cartStore.clearCart()
    showToast('Order voided')
  }
}

const showPayment = ref(false)
const showReceipt = ref(false)
const lastCompletedOrder = ref<Order | null>(null)

const openPayment = () => {
  if (!ensureShopOpen('Open shop before accepting payment')) return
  if (cartStore.items.length === 0) { showToast('Cart is empty', 'error'); return }
  showPayment.value = true
}

const payingIncomingOrderId = ref<string | null>(null)

const checkoutIncomingOrder = (order: any) => {
  if (cartStore.items.length > 0) {
    if (!confirm('Clear current cart to checkout this order?')) return
  }
  cartStore.clearCart()
  cartStore.tableNumber = order.tableId || order.tableLabel || ''
  
  order.items.forEach((i: any) => {
    // Attempt to map back to product list for accurate pricing if missing
    const prod = productStore.products.find(p => p.id === i.menuItemId)
    cartStore.addItem({ 
      id: i.menuItemId, 
      name: i.name || prod?.name || 'Item', 
      price: i.price || prod?.price || 0 
    })
    // We update quantity separately to avoid duplicate id summing issues
    const cartItem = cartStore.items.find(ci => ci.menuItemId === i.menuItemId)
    if (cartItem) cartStore.updateQty(cartItem.id, i.quantity)
  })
  
  payingIncomingOrderId.value = order.id
  showPayment.value = true
}

const completeIncomingOrder = async (order: any) => {
  await updateOrderStatus(order.id, 'completed')
  orderStore.addOrder({
    orderId: order.id,
    items: order.items.map((i: any) => ({ ...i, price: i.price || 0, subtotal: i.subtotal || 0, quantity: i.quantity || 1 })),
    total: order.grandTotal,
    paymentMethod: order.paymentStatus === 'paid' ? 'Online' : 'Unpaid',
    cashier: auth.user?.name || 'Admin',
    timestamp: new Date().toISOString(),
    businessDate: shopStore.currentBusinessDate,
    shiftId: shiftStore.currentShiftId ?? undefined,
    customerPhone: undefined,
    change: 0,
    status: 'completed'
  })
}

const onPaymentCompleted = async (order: any) => {
  if (!shopStore.isOpen) return
  lastCompletedOrder.value = order
  showReceipt.value = true

  if (payingIncomingOrderId.value) {
    try {
      await orderRepository.updatePaymentStatus(payingIncomingOrderId.value, 'paid')
    } catch (e) {
      console.error(e)
    } finally {
      payingIncomingOrderId.value = null
      refreshOrders()
      showToast('Payment applied to order')
      cartStore.clearCart()
    }
  } else {
    // Scenario 1: New POS order. Customer pays, and it goes to the Queue.
    try {
      const newOrderPayload = {
        tableId: cartStore.tableId || undefined,
        tableLabel: cartStore.tableNumber ? `Table ${cartStore.tableNumber}` : undefined,
        source: 'pos' as const,
        items: cartStore.items.map(i => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          sugarLevel: i.sugarLevel,
          iceLevel: i.iceLevel,
          modifiers: i.modifiers,
          itemDiscount: i.itemDiscount
        }))
      }
      const createdOrder = await orderRepository.create(newOrderPayload)
      await orderRepository.updatePaymentStatus(createdOrder.id, 'paid')
      refreshOrders()
      showToast('Order Paid and Sent to Kitchen')
      cartStore.clearCart()
    } catch (e) {
      console.error('Failed to create order in queue', e)
    }
  }
}

watch(() => shopStore.isOpen, (isOpen) => {
  if (isOpen) return
  selectedProductForOptions.value = null
  showPayment.value = false
  editDiscount.value = false
})

const showViewOrders = ref(false)
const showTransactions = ref(false)

const handleReset = () => {
  const isDefault = cartStore.items.length === 0 && !cartStore.tableNumber && !cartStore.customerPhone && !cartStore.coupon && cartStore.discount === 0 && cartStore.paymentMethod === 'cash'
  if (isDefault) { showToast('Already reset'); return }
  if (confirm('Reset all fields?')) { cartStore.clearCart(); showToast('POS reset') }
}
</script>
