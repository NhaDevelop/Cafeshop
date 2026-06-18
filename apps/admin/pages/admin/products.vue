<template>
  <div class="p-7 flex flex-col gap-6 flex-1 overflow-y-auto bg-slate-50">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Product Management</h1>
        <p class="text-sm text-slate-400 mt-1">{{ productStore.products.length }} items across {{ productStore.categories.length }} categories</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm"
          @click="showCategoryModal = true"
        >
          <Tags :size="16" /> Manage Categories
        </button>
        <button
          class="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 active:scale-95"
          @click="showModal = true"
        >
          <Plus :size="16" /> Add Product
        </button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 flex-wrap">
      <div class="relative flex-1 min-w-[220px]">
        <Search :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input v-model="search" type="text" placeholder="Search products…"
          class="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors placeholder:text-slate-400 font-medium" />
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="cat in categoryTabs"
          :key="cat.id"
          class="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
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
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div v-for="i in 8" :key="i" class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
        <div class="h-48 bg-slate-200"></div>
        <div class="p-4 space-y-2">
          <div class="h-3 bg-slate-200 rounded-full w-1/3"></div>
          <div class="h-5 bg-slate-200 rounded-full w-2/3"></div>
          <div class="h-3 bg-slate-200 rounded-full w-full mt-3"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!filteredItems.length" class="flex flex-col items-center justify-center py-24 gap-4 text-center opacity-40">
      <UtensilsCrossed :size="56" class="text-slate-400" />
      <p class="font-bold text-lg text-slate-500">No products found</p>
      <p class="text-sm text-slate-400">Try a different search or category</p>
    </div>

    <!-- Products Grid (card view with images) -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg hover:border-indigo-200 transition-all duration-200 flex flex-col"
      >
        <!-- Product Image -->
        <div class="relative w-full h-44 bg-slate-100 overflow-hidden flex-shrink-0">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <component :is="getIcon(item.name)" :size="40" class="text-slate-300" />
          </div>
          <!-- Badges -->
          <span v-if="item.discount" class="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-lg shadow">
            -{{ item.discount }}%
          </span>
          <span
            class="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-lg"
            :class="item.isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'"
          >
            {{ item.isAvailable ? 'ACTIVE' : 'OFF' }}
          </span>
          <!-- Type badge -->
          <span class="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/30 text-white backdrop-blur-sm">
            {{ item.productType === 'beverage' ? '☕ Beverage' : '🍽️ Food' }}
          </span>
        </div>

        <!-- Card Body -->
        <div class="p-4 flex flex-col flex-1 gap-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-extrabold text-slate-800 text-base leading-tight truncate">{{ item.name }}</p>
              <span class="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                {{ getCategoryName(item.categoryId) }}
              </span>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="font-black text-slate-700 text-base">{{ currencyStore.format(selectedSize(item).price) }}</p>
              <p v-if="hasSizes(item)" class="text-[10px] text-slate-400 font-semibold">{{ productSizes(item).length }} sizes</p>
            </div>
          </div>
          <p v-if="item.description" class="text-xs text-slate-400 leading-relaxed line-clamp-2">{{ item.description }}</p>

          <!-- Action Buttons -->
          <div class="flex gap-2 mt-auto pt-2 border-t border-slate-50">
            <button
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
              @click="openEditModal(item)"
            >
              <Edit2 :size="13" /> Edit
            </button>
            <button
              class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0"
              @click="deleteProduct(item.id)"
            >
              <Trash2 :size="13" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Product Modal (Add/Edit) ─────────────────────── -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" @click.self="closeModal">
      <div class="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h3 class="text-xl font-extrabold text-slate-800">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
            <p class="text-sm text-slate-400 mt-0.5">Fill in the product details below</p>
          </div>
          <button class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors" @click="closeModal">
            <X :size="18" />
          </button>
        </div>
        <form class="p-7 flex flex-col gap-5" @submit.prevent="handleSaveProduct">
          <!-- Image URL -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-slate-600">Product Image URL</label>
            <input v-model="newProduct.imageUrl" type="url" placeholder="https://example.com/image.jpg"
              class="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" />
            <div v-if="newProduct.imageUrl" class="mt-2 rounded-xl overflow-hidden h-32 bg-slate-100">
              <img :src="newProduct.imageUrl" class="w-full h-full object-cover" @error="newProduct.imageUrl = ''" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-slate-600">Product Name *</label>
              <input v-model="newProduct.name" type="text" required placeholder="Matcha Latte"
                class="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-slate-600">Category *</label>
              <select v-model="newProduct.categoryId" required
                class="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors">
                <option value="" disabled>Select category</option>
                <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-slate-600">Base Price *</label>
              <input v-model.number="newProduct.price" type="number" step="0.01" min="0" required placeholder="0.00"
                class="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-slate-600">Discount (%)</label>
              <input v-model.number="newProduct.discount" type="number" min="0" max="100" placeholder="0"
                class="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-slate-600">Type *</label>
              <select v-model="newProduct.productType"
                class="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors">
                <option value="beverage">☕ Beverage</option>
                <option value="food">🍽️ Food</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-slate-600">Description</label>
            <textarea v-model="newProduct.description" rows="2" placeholder="Optional description"
              class="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors resize-none"></textarea>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-600">Size Prices</label>
              <button type="button" class="text-xs text-indigo-600 font-bold hover:underline" @click="addSize">+ Add Size</button>
            </div>
            <div class="space-y-2">
              <div v-for="(size, i) in newProduct.sizes" :key="i" class="flex gap-2 items-center">
                <input v-model="size.name" placeholder="Small" class="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 bg-slate-50" />
                <input v-model.number="size.price" type="number" step="0.01" min="0" placeholder="Price" class="w-28 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 bg-slate-50" />
                <button type="button" class="w-9 h-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 flex-shrink-0" @click="removeSize(i)">
                  <Trash2 :size="14" />
                </button>
              </div>
              <button v-if="newProduct.sizes.length === 0" type="button"
                class="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-indigo-500 font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                @click="applyDrinkSizes">
                ☕ Use Small / Medium / Large
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" class="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" @click="closeModal">Cancel</button>
            <button type="submit" class="px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md shadow-indigo-200" :disabled="saving">
              {{ saving ? 'Saving…' : (editingProduct ? 'Update Product' : 'Add Product') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ─── Category Modal ──────────────────────────────────── -->
    <div v-if="showCategoryModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" @click.self="showCategoryModal = false">
      <div class="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div class="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h3 class="text-xl font-extrabold text-slate-800">Manage Categories</h3>
            <p class="text-sm text-slate-400 mt-0.5">{{ productStore.categories.length }} categories total</p>
          </div>
          <button class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors" @click="showCategoryModal = false">
            <X :size="18" />
          </button>
        </div>
        <div class="p-7 flex flex-col gap-5">
          <!-- Existing Categories List -->
          <div class="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            <div
              v-for="cat in productStore.categories"
              :key="cat.id"
              class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:border-indigo-200 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Tags :size="16" class="text-indigo-500" />
                </div>
                <div>
                  <p class="font-bold text-slate-700 text-sm">{{ cat.name }}</p>
                  <p class="text-xs text-slate-400">{{ productStore.products.filter(p => p.categoryId === cat.id).length }} products</p>
                </div>
              </div>
              <button
                class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                @click="deleteCategory(cat.id)"
              >
                <Trash2 :size="13" />
              </button>
            </div>
          </div>

          <!-- Add New Category -->
          <div class="border-t border-slate-100 pt-5">
            <p class="text-sm font-bold text-slate-600 mb-3">Add New Category</p>
            <form class="flex gap-3" @submit.prevent="handleAddCategory">
              <input
                v-model="newCategory.name"
                type="text"
                required
                placeholder="e.g. Fresh Juices"
                class="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors font-medium"
              />
              <button
                type="submit"
                class="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex-shrink-0"
                :disabled="savingCategory"
              >
                <Plus :size="15" />
                {{ savingCategory ? 'Adding…' : 'Add' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Plus, Search, Trash2, X, Coffee, Croissant, Sandwich, CakeSlice, CupSoda, UtensilsCrossed, Edit2, Tags } from '@lucide/vue'
import type { MenuItem, ProductSize } from '@cafe-nux/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const productStore = useProductStore()
const currencyStore = useCurrencyStore()
const loading = ref(true)
const search = ref('')
const selectedCategory = ref('all')
const selectedSizeByProduct = ref<Record<string, ProductSize>>({})

// ── Product modal ─────────────────────────────────────────
const showModal = ref(false)
const saving = ref(false)
const editingProduct = ref<MenuItem | null>(null)
const newProduct = ref({
  name: '', categoryId: '', price: 0, description: '', discount: 0,
  sizes: [] as ProductSize[], productType: 'beverage' as 'beverage' | 'food',
  imageUrl: ''
})

// ── Category modal ────────────────────────────────────────
const showCategoryModal = ref(false)
const savingCategory = ref(false)
const newCategory = ref({ name: '' })

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
  newProduct.value = { name: '', categoryId: '', price: 0, description: '', discount: 0, sizes: [], productType: 'beverage', imageUrl: '' }
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
    sizes: item.sizes ? [...item.sizes] : [],
    productType: item.productType || 'beverage',
    imageUrl: item.imageUrl || ''
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
      productType: newProduct.value.productType,
      imageUrl: newProduct.value.imageUrl || undefined,
      isAvailable: true
    }

    if (editingProduct.value) {
      const index = productStore.products.findIndex(p => p.id === editingProduct.value!.id)
      if (index !== -1) {
        productStore.products[index] = { ...productStore.products[index], ...productData }
      }
    } else {
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

const handleAddCategory = async () => {
  if (!newCategory.value.name.trim()) return
  savingCategory.value = true
  try {
    const cat = {
      id: `cat_${Date.now()}`,
      name: newCategory.value.name.trim(),
      sortOrder: productStore.categories.length + 1
    }
    productStore.categories.push(cat)
    newCategory.value = { name: '' }
  } finally {
    savingCategory.value = false
  }
}

const deleteCategory = (catId: string) => {
  const count = productStore.products.filter(p => p.categoryId === catId).length
  if (count > 0 && !confirm(`This category has ${count} product(s). Delete anyway?`)) return
  productStore.categories = productStore.categories.filter(c => c.id !== catId)
}
</script>
