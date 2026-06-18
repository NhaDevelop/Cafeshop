import { defineStore } from 'pinia'
import type { Category, MenuItem, Table, Customer } from '../../../types'
import { menuRepository } from '../../../data/repositories/menu.repository'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as MenuItem[],
    categories: [] as Category[],
    tables: [] as Table[],
    customers: [] as Customer[]
  }),
  actions: {
    async fetchProducts() {
      try {
        const [cats, items, tbls, custs] = await Promise.all([
          menuRepository.getCategories(),
          menuRepository.getItems(),
          menuRepository.getTables(),
          menuRepository.getCustomers()
        ])
        const seedIds = new Set(items.map(item => item.id))
        const localProducts = this.products.filter(product => !seedIds.has(product.id))
        this.categories = cats
        this.products = [...items, ...localProducts]
        this.tables = tbls
        this.customers = custs
      } catch (e) {
        console.error('Failed to fetch data', e)
      }
    },
    addProduct(product: MenuItem) {
      this.products.unshift(product)
    },
    deleteProduct(productId: string) {
      this.products = this.products.filter(product => product.id !== productId)
    }
  },
  getters: {
    byCategory: (state) => (categoryId: string) => {
      if (!categoryId) return state.products
      return state.products.filter((p: any) => p.categoryId === categoryId)
    },
    searchResults: (state) => (query: string) => {
      if (!query) return state.products
      const q = query.toLowerCase()
      return state.products.filter((p: any) => p.name.toLowerCase().includes(q))
    },
    searchCustomers: (state) => (query: string) => {
      if (!query) return []
      const q = query.toLowerCase()
      return state.customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
    }
  },
  persist: true
})
