<template>
  <div class="p-7 flex flex-col gap-6 flex-1 overflow-y-auto bg-slate-50">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Product Management</h1>
        <p class="text-sm text-slate-400 mt-0.5">{{ productStore.products.length }} items across {{ productStore.categories.length }} categories</p>
      </div>
      <button
        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 active:scale-95"
        @click="showModal = true"
      >
        <Plus :size="16" /> Add Product
      </button>
    </div>

    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 flex-wrap">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input v-model="search" type="text" placeholder="Search products…"
          class="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors placeholder:text-slate-400" />
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="cat in categoryTabs"
          :key="cat.id"
          class="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          :class="selectedCategory === cat.id
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
          @click="selectedCategory = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Loading Skeletons -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div v-for="i in 10" :key="i" class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
        <div class="h-44 bg-slate-200"></div>
        <div class="p-4 space-y-2">
          <div class="h-3 bg-slate-200 rounded-full w-1/3"></div>
          <div class="h-4 bg-slate-200 rounded-full w-2/3"></div>
          <div class="h-3 bg-slate-200 rounded-full w-full mt-3"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!filteredItems.length" class="flex flex-col items-center justify-center py-24 gap-3 text-center opacity-40">
      <UtensilsCrossed :size="48" class="text-slate-400" />
      <p class="font-bold text-slate-500">No products found</p>
      <p class="text-sm text-slate-400">Try a different search or category</p>
    </div>

    <!-- Products Table -->
    <div v-else class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50">
              <th class="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16">#</th>
              <th class="text-left px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</th>
              <th class="text-left px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
              <th class="text-right px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
              <th class="text-center px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in filteredItems"
              :key="item.id"
              class="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
            >
              <td class="px-6 py-3.5 text-slate-400 font-bold">{{ i + 1 }}</td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                    <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <component :is="getIcon(item.name)" :size="18" class="text-slate-300" />
                    </div>
                    <span v-if="item.discount" class="absolute bottom-0 right-0 bg-red-500 text-white text-[8px] font-black px-1 py-0.5 rounded-tl-lg">
                      -{{ item.discount }}%
                    </span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-800 leading-tight truncate">{{ item.name }}</p>
                    <p v-if="item.description" class="text-xs text-slate-400 truncate max-w-[200px]">{{ item.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <span class="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">{{ getCategoryName(item.categoryId) }}</span>
              </td>
              <td class="px-4 py-3.5 text-right">
                <div class="flex flex-col items-end">
                  <span class="font-bold text-slate-700">{{ currencyStore.format(selectedSize(item).price) }}</span>
                  <span v-if="hasSizes(item)" class="text-[10px] text-slate-400 font-semibold">{{ productSizes(item).length }} sizes</span>
                </div>
              </td>
              <td class="px-4 py-3.5 text-center">
                <span
                  class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-black"
                  :class="item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'"
                >
                  {{ item.isAvailable ? 'ACTIVE' : 'INACTIVE' }}
                </span>
              </td>
              <td class="px-6 py-3.5">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                    title="Edit product"
                    @click="openEditModal(item)"
                  >
                    <Edit2 :size="14" />
                  </button>
                  <button
                    class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete product"
                    @click="deleteProduct(item.id)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal (Add/Edit) -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" @click.self="closeModal">
      <div class="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 class="text-lg font-extrabold text-slate-800">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
          <button class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors" @click="closeModal">
            <X :size="18" />
          </button>
        </div>
        <form class="p-6 flex flex-col gap-4" @submit.prevent="handleSaveProduct">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-600">Product Name</label>
              <input v-model="newProduct.name" type="text" required placeholder="Matcha Latte" class="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-600">Category</label>
              <select v-model="newProduct.categoryId" required class="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors">
                <option value="" disabled>Select category</option>
                <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-600">Base Price ($)</label>
              <input v-model.number="newProduct.price" type="number" step="0.01" min="0" required placeholder="0.00" class="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-600">Discount (%)</label>
              <input v-model.number="newProduct.discount" type="number" min="0" max="100" placeholder="0" class="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-slate-600">Description</label>
            <textarea v-model="newProduct.description" rows="3" placeholder="Optional description" class="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors resize-none"></textarea>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-600">Size Prices</label>
              <button type="button" class="text-xs text-indigo-600 font-bold hover:underline" @click="addSize">+ Add Size</button>
            </div>
            <div class="space-y-2">
              <div v-for="(size, i) in newProduct.sizes" :key="i" class="flex gap-2 items-center">
                <input v-model="size.name" placeholder="Small" class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-slate-50" />
                <input v-model.number="size.price" type="number" step="0.01" min="0" placeholder="Price" class="w-28 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-slate-50" />
                <button type="button" class="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 flex-shrink-0" @click="removeSize(i)">
                  <Trash2 :size="14" />
                </button>
              </div>
              <button v-if="newProduct.sizes.length === 0" type="button" class="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-indigo-500 font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-colors" @click="applyDrinkSizes">
                Use Small / Medium / Large
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" @click="closeModal">Cancel</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md shadow-indigo-200" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Search, Trash2, X, Coffee, Croissant, Sandwich, CakeSlice, CupSoda, UtensilsCrossed, Edit2 } from '@lucide/vue'
import type { MenuItem, ProductSize } from '@cafe-nux/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const productStore = useProductStore()
const currencyStore = useCurrencyStore()
const loading = ref(true)
const search = ref('')
const selectedCategory = ref('all')
const selectedSizeByProduct = ref<Record<string, ProductSize>>({})

const showModal = ref(false)
const saving = ref(false)
const editingProduct = ref<MenuItem | null>(null)
const newProduct = ref({
  name: '', categoryId: '', price: 0, description: '', discount: 0, sizes: [] as ProductSize[],
})

onMounted(async () => {
  loading.value = true
  await productStore.fetchProducts()
  loading.value = false
})

const categoryTabs = computed(() => [
  { id: 'all', name: 'All' },
  ...productStore.categories.map(cat => ({ id: cat.id, name: cat.name })),
])

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  return productStore.products.filter(item => {
    const matchesCategory = selectedCategory.value === 'all' || item.categoryId === selectedCategory.value
    const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })
})

const getCategoryName = (id: string) => productStore.categories.find(cat => cat.id === id)?.name || 'General'
const hasSizes = (item: MenuItem) => !!item.sizes?.length
const productSizes = (item: MenuItem): ProductSize[] => hasSizes(item) ? item.sizes! : [{ name: 'Regular', price: item.price }]
const selectedSize = (item: MenuItem): ProductSize => selectedSizeByProduct.value[item.id] ?? productSizes(item)[0]
const selectSize = (item: MenuItem, size: ProductSize) => { selectedSizeByProduct.value[item.id] = size }

const priceRange = (item: MenuItem) => {
  const prices = productSizes(item).map(s => s.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? currencyStore.format(min) : `${currencyStore.format(min)} – ${currencyStore.format(max)}`
}

const iconMap: Record<string, any> = {
  coffee: Coffee, espresso: Coffee, latte: Coffee, cappuccino: Coffee,
  croissant: Croissant, sandwich: Sandwich,
  muffin: CakeSlice, cake: CakeSlice,
  juice: CupSoda, matcha: CupSoda, frappe: CupSoda,
}
const getIcon = (name: string) => {
  const key = Object.keys(iconMap).find(k => name.toLowerCase().includes(k))
  return key ? iconMap[key] : UtensilsCrossed
}

const addSize = () => newProduct.value.sizes.push({ name: '', price: newProduct.value.price || 0 })
const removeSize = (index: number) => newProduct.value.sizes.splice(index, 1)
const applyDrinkSizes = () => {
  const base = newProduct.value.price || 0
  newProduct.value.sizes = [
    { name: 'Small', price: base },
    { name: 'Medium', price: Number((base + 0.75).toFixed(2)) },
    { name: 'Large', price: Number((base + 1.5).toFixed(2)) },
  ]
}

const resetNewProduct = () => {
  editingProduct.value = null
  newProduct.value = { name: '', categoryId: '', price: 0, description: '', discount: 0, sizes: [] }
}
const closeModal = () => { showModal.value = false; resetNewProduct() }

const openEditModal = (item: MenuItem) => {
  editingProduct.value = item
  newProduct.value = {
    name: item.name,
    categoryId: item.categoryId,
    price: item.price,
    description: item.description || '',
    discount: item.discount || 0,
    sizes: item.sizes ? [...item.sizes] : []
  }
  showModal.value = true
}

const handleSaveProduct = async () => {
  saving.value = true
  try {
    const productData = {
      name: newProduct.value.name,
      categoryId: newProduct.value.categoryId,
      price: newProduct.value.price,
      description: newProduct.value.description,
      discount: newProduct.value.discount > 0 ? newProduct.value.discount : undefined,
      sizes: newProduct.value.sizes.length > 0 ? [...newProduct.value.sizes] : undefined,
      isAvailable: true
    }

    if (editingProduct.value) {
      // Logic for editing a product
      // We would ideally call something like: await menuRepository.update(editingProduct.value.id, productData)
      // Since menuRepository update is mock or might not be perfectly defined, let's update local store
      const index = productStore.products.findIndex(p => p.id === editingProduct.value!.id)
      if (index !== -1) {
        productStore.products[index] = { ...productStore.products[index], ...productData }
      }
    } else {
      // Logic for adding new product
      const created = await menuRepository.create(productData)
      productStore.products.push(created)
    }
    closeModal()
  } finally {
    saving.value = false
  }
}

const deleteProduct = (productId: string) => {
  if (!confirm('Delete this product?')) return
  productStore.deleteProduct(productId)
}
</script>
