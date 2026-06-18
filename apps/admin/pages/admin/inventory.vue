<template>
  <div class="ops-page">
    <header class="ops-header">
      <div>
        <h1 class="ops-title">Inventory</h1>
        <p class="text-muted">Ingredient stock, recipe usage, and low-stock alerts</p>
      </div>
      <div class="value-card">
        <span class="label">Stock Value</span>
        <strong>{{ currencyStore.format(inventoryStore.stockValue) }}</strong>
      </div>
    </header>

    <div class="summary-row">
      <div class="summary-card card">
        <span class="label">Ingredients</span>
        <strong>{{ inventoryStore.ingredients.length }}</strong>
      </div>
      <div class="summary-card card warning">
        <span class="label">Low Stock</span>
        <strong>{{ inventoryStore.lowStock.length }}</strong>
      </div>
      <div class="summary-card card">
        <span class="label">Recipes</span>
        <strong>{{ Object.keys(inventoryStore.recipes).length }}</strong>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-nav">
      <button class="tab-btn" :class="{ active: activeTab === 'ingredients' }" @click="activeTab = 'ingredients'">
        Ingredient Stock
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'recipes' }" @click="activeTab = 'recipes'">
        Recipe Cost
      </button>
    </div>

    <div class="tab-content">
      <!-- Ingredient Stock Tab -->
      <div v-show="activeTab === 'ingredients'" class="card table-card">
        <div class="table-header">
          <h2>Ingredient Stock</h2>
        </div>
        <table class="ops-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Stock</th>
              <th>Low At</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Restock</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ingredient in inventoryStore.ingredients" :key="ingredient.id">
              <td>
                <div class="item-cell">
                  <img v-if="ingredient.imageUrl" :src="ingredient.imageUrl" :alt="ingredient.name" class="item-img" />
                  <div class="item-fallback" v-else>{{ ingredient.name.charAt(0) }}</div>
                  <div>
                    <strong>{{ ingredient.name }}</strong>
                    <span class="subtle">{{ ingredient.unit }}</span>
                  </div>
                </div>
              </td>
              <td>{{ ingredient.stock.toLocaleString() }} {{ ingredient.unit }}</td>
              <td>{{ ingredient.lowStockAt }} {{ ingredient.unit }}</td>
              <td>{{ currencyStore.format(ingredient.costPerUnit) }} / {{ ingredient.unit }}</td>
              <td>
                <span class="status" :class="ingredient.stock <= ingredient.lowStockAt ? 'low' : 'ok'">
                  {{ ingredient.stock <= ingredient.lowStockAt ? 'Low' : 'OK' }}
                </span>
              </td>
              <td>
                <div class="restock-control">
                  <div class="input-with-unit">
                    <input v-model.number="restockAmounts[ingredient.id]" type="number" min="0" step="0.01" />
                    <span class="unit-label">{{ ingredient.unit }}</span>
                  </div>
                  <button class="btn btn-primary btn-sm" @click="restock(ingredient.id)">Add</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Recipe Cost Tab -->
      <div v-show="activeTab === 'recipes'" class="card table-card">
        <div class="table-header">
          <h2>Recipe Cost</h2>
        </div>
        <table class="ops-table">
          <thead>
            <tr>
              <th>Menu Item ID</th>
              <th>Ingredient Lines</th>
              <th>Estimated Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(recipe, menuItemId) in inventoryStore.recipes" :key="menuItemId">
              <td>
                <div class="item-cell">
                  <img v-if="getProductImage(String(menuItemId))" :src="getProductImage(String(menuItemId))" alt="product" class="item-img" />
                  <div class="item-fallback" v-else>{{ getProductName(String(menuItemId)).charAt(0) }}</div>
                  <div>
                    <strong>{{ getProductName(String(menuItemId)) }}</strong>
                    <span class="subtle">{{ menuItemId }}</span>
                  </div>
                </div>
              </td>
              <td>{{ recipe.length }} ingredients</td>
              <td>{{ currencyStore.format(inventoryStore.recipeCost(menuItemId)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const inventoryStore = useInventoryStore()
const currencyStore = useCurrencyStore()
const productStore = useProductStore()
const restockAmounts = ref<Record<string, number>>({})
const activeTab = ref<'ingredients' | 'recipes'>('ingredients')

onMounted(() => {
  productStore.fetchProducts()
})

const getProductName = (id: string) => {
  const product = productStore.products.find(p => p.id === id)
  return product ? product.name : id
}

const getProductImage = (id: string) => {
  const product = productStore.products.find(p => p.id === id)
  return product?.imageUrl
}

const restock = (ingredientId: string) => {
  inventoryStore.restock(ingredientId, Number(restockAmounts.value[ingredientId] || 0))
  restockAmounts.value[ingredientId] = 0
}
</script>

<style scoped>
.ops-page { padding:28px; display:flex; flex-direction:column; gap:20px; flex:1; overflow-y:auto; }
.ops-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
.ops-title { font-size:26px; font-weight:800; }
.value-card { min-width:180px; padding:14px 16px; border:1px solid var(--color-border); border-radius:8px; background:var(--color-surface); display:flex; flex-direction:column; gap:4px; }
.value-card strong { font-size:22px; color:var(--color-primary); }
.summary-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.summary-card { display:flex; flex-direction:column; gap:6px; }
.summary-card strong { font-size:28px; }
.summary-card.warning strong { color:var(--color-warning); }
.label { font-size:12px; font-weight:800; color:var(--color-muted); text-transform:uppercase; }
.table-card { padding:0; overflow:hidden; border-radius:8px; }
.table-header { padding:16px 20px; border-bottom:1px solid var(--color-border); }
.table-header h2 { font-size:16px; margin:0; }
.ops-table { width:100%; border-collapse:collapse; font-size:13px; }
.ops-table th { text-align:left; padding:10px 16px; color:var(--color-muted); background:var(--color-surface-2); font-size:11px; text-transform:uppercase; }
.ops-table td { padding:12px 16px; border-top:1px solid var(--color-border); vertical-align:middle; }
.subtle { display:block; font-size:11px; color:var(--color-muted); margin-top:2px; }
.status { display:inline-flex; padding:3px 8px; border-radius:99px; font-size:11px; font-weight:800; }
.status.ok { background:#dcfce7; color:#15803d; }
.status.low { background:#fef3c7; color:#b45309; }
.restock-control { display:flex; gap:8px; align-items:center; }
.input-with-unit { display:flex; align-items:center; border:1px solid var(--color-border); border-radius:6px; background:var(--color-surface); padding-right:8px; overflow:hidden; }
.input-with-unit input { width:60px; border:none; padding:6px 8px; font-family:var(--font); outline:none; background:transparent; }
.unit-label { font-size:11px; font-weight:700; color:var(--color-muted); white-space:nowrap; }
.btn-sm { padding:6px 10px; font-size:12px; }

/* Items cell with images */
.item-cell { display: flex; align-items: center; gap: 12px; }
.item-img { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; background: #f1f5f9; border: 1px solid var(--color-border); }
.item-fallback { width: 36px; height: 36px; border-radius: 8px; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }

/* Tabs */
.tabs-nav { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--color-border); }
.tab-btn { padding: 10px 16px; font-size: 14px; font-weight: 700; color: var(--color-muted); background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover { color: var(--color-text); }
.tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.tab-content { display: flex; flex-direction: column; gap: 20px; }
</style>
