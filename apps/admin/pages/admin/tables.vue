<template>
  <div class="p-7 flex flex-col gap-6 bg-slate-50 min-h-full">
    
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Table Tracking</h1>
        <p class="text-sm text-slate-400 mt-0.5">Manage and monitor table availability</p>
      </div>
      
      <!-- Stats -->
      <div class="flex gap-4">
        <div class="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span class="text-sm font-bold text-slate-700">{{ tables.filter(t => t.status === 'available').length }} Available</span>
        </div>
        <div class="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
          <span class="text-sm font-bold text-slate-700">{{ tables.filter(t => t.status === 'occupied').length }} Occupied</span>
        </div>
        <div class="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
          <span class="text-sm font-bold text-slate-700">{{ tables.filter(t => t.status === 'reserved').length }} Reserved</span>
        </div>
      </div>
    </div>

    <!-- Tables Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div 
        v-for="table in tables" 
        :key="table.id"
        class="bg-white rounded-3xl p-6 shadow-sm border-2 transition-all relative overflow-hidden flex flex-col"
        :class="{
          'border-emerald-100': table.status === 'available',
          'border-amber-100': table.status === 'occupied',
          'border-indigo-100': table.status === 'reserved'
        }"
      >
        <!-- Top accent line -->
        <div class="absolute top-0 left-0 w-full h-1.5"
             :class="{
               'bg-emerald-400': table.status === 'available',
               'bg-amber-400': table.status === 'occupied',
               'bg-indigo-400': table.status === 'reserved'
             }"></div>

        <!-- Content -->
        <div class="flex items-start justify-between mb-6">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl"
               :class="{
                 'bg-emerald-50 text-emerald-600': table.status === 'available',
                 'bg-amber-50 text-amber-600': table.status === 'occupied',
                 'bg-indigo-50 text-indigo-600': table.status === 'reserved'
               }">
            {{ table.number }}
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  :class="{
                    'bg-emerald-100 text-emerald-700': table.status === 'available',
                    'bg-amber-100 text-amber-700': table.status === 'occupied',
                    'bg-indigo-100 text-indigo-700': table.status === 'reserved'
                  }">
              {{ table.status }}
            </span>
            <span class="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Users :size="12" /> {{ table.capacity }} Seats
            </span>
          </div>
        </div>

        <!-- Action Dropdown for Status -->
        <div class="mt-auto pt-4 border-t border-slate-100">
          <label class="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">Update Status</label>
          <div class="relative">
            <select 
              v-model="table.status"
              class="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-indigo-400 focus:bg-white cursor-pointer transition-colors"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
            </select>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown :size="16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Users, ChevronDown } from '@lucide/vue'
import { useProductStore } from '../../src/presentation/viewmodels/pos/useProductViewModel'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const productStore = useProductStore()

// We can just rely on the store's table array. Changing v-model="table.status" 
// directly modifies the reactive store object, so changes will sync automatically to the POS.
const tables = computed(() => productStore.tables)
</script>
