import { defineStore } from 'pinia'
import type { CartItem } from '../pos/useCartViewModel'

export interface Ingredient {
  id: string
  name: string
  unit: string
  stock: number
  lowStockAt: number
  costPerUnit: number
  imageUrl?: string
}

export interface RecipeLine {
  ingredientId: string
  quantity: number
}

const defaultIngredients: Ingredient[] = [
  { id: 'coffee_beans', name: 'Coffee Beans', unit: 'kg', stock: 4.5, lowStockAt: 1, costPerUnit: 12, imageUrl: 'https://placehold.co/100x100/3e2723/d7ccc8?text=Beans' },
  { id: 'milk', name: 'Milk', unit: 'L', stock: 18, lowStockAt: 5, costPerUnit: 1.4, imageUrl: 'https://placehold.co/100x100/ffffff/9ca3af?text=Milk' },
  { id: 'sugar', name: 'Sugar', unit: 'kg', stock: 5, lowStockAt: 1.5, costPerUnit: 1.2, imageUrl: 'https://placehold.co/100x100/f8fafc/94a3b8?text=Sugar' },
  { id: 'matcha', name: 'Matcha Powder', unit: 'kg', stock: 1.2, lowStockAt: 0.4, costPerUnit: 28, imageUrl: 'https://placehold.co/100x100/166534/dcfce7?text=Matcha' },
  { id: 'croissant', name: 'Croissant Dough', unit: 'pcs', stock: 48, lowStockAt: 12, costPerUnit: 0.9, imageUrl: 'https://placehold.co/100x100/fef08a/854d0e?text=Dough' },
  { id: 'muffin', name: 'Muffin Mix', unit: 'pcs', stock: 36, lowStockAt: 10, costPerUnit: 0.75, imageUrl: 'https://placehold.co/100x100/eab308/713f12?text=Mix' },
]

const defaultRecipes: Record<string, RecipeLine[]> = {
  m1: [{ ingredientId: 'coffee_beans', quantity: 0.018 }],
  m2: [{ ingredientId: 'coffee_beans', quantity: 0.018 }, { ingredientId: 'milk', quantity: 0.2 }],
  m3: [{ ingredientId: 'coffee_beans', quantity: 0.018 }, { ingredientId: 'milk', quantity: 0.16 }],
  m4: [{ ingredientId: 'croissant', quantity: 1 }],
  m5: [{ ingredientId: 'muffin', quantity: 1 }],
  m6: [{ ingredientId: 'coffee_beans', quantity: 0.018 }, { ingredientId: 'milk', quantity: 0.24 }],
  m7: [{ ingredientId: 'matcha', quantity: 0.018 }, { ingredientId: 'milk', quantity: 0.22 }, { ingredientId: 'sugar', quantity: 0.02 }],
}

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    ingredients: defaultIngredients as Ingredient[],
    recipes: defaultRecipes as Record<string, RecipeLine[]>,
  }),
  actions: {
    restock(ingredientId: string, amount: number) {
      if (amount <= 0) return
      const ingredient = this.ingredients.find(item => item.id === ingredientId)
      if (ingredient) ingredient.stock = Number((ingredient.stock + amount).toFixed(3))
    },
    setStock(ingredientId: string, amount: number) {
      const ingredient = this.ingredients.find(item => item.id === ingredientId)
      if (ingredient && amount >= 0) ingredient.stock = Number(amount.toFixed(3))
    },
    consumeOrderItems(items: Pick<CartItem, 'menuItemId' | 'quantity'>[]) {
      items.forEach(item => {
        const recipe = this.recipes[item.menuItemId] ?? []
        recipe.forEach(line => {
          const ingredient = this.ingredients.find(stock => stock.id === line.ingredientId)
          if (!ingredient) return
          ingredient.stock = Math.max(0, Number((ingredient.stock - line.quantity * item.quantity).toFixed(3)))
        })
      })
    },
  },
  getters: {
    lowStock: (state) => state.ingredients.filter(item => item.stock <= item.lowStockAt),
    stockValue: (state) => state.ingredients.reduce((sum, item) => sum + item.stock * item.costPerUnit, 0),
    recipeCost: (state) => (menuItemId: string) => {
      return (state.recipes[menuItemId] ?? []).reduce((sum, line) => {
        const ingredient = state.ingredients.find(item => item.id === line.ingredientId)
        return sum + (ingredient ? ingredient.costPerUnit * line.quantity : 0)
      }, 0)
    },
  },
  persist: true,
})
