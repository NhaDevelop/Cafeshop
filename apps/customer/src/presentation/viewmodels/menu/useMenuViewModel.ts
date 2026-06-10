import { defineStore } from 'pinia'
import type { MenuItem, Category } from '../../../types'
import { menuRepository } from '../../../data/repositories/menu.repository'
export const useMenuStore = defineStore('menu', () => {
  const categories       = ref<Category[]>([])
  const items            = ref<MenuItem[]>([])
  const selectedCategory = ref<string | null>(null)
  const search           = ref('')
  const loading          = ref(true)
  const filteredItems = computed(() =>
    items.value
      .filter(i => i.isAvailable)
      .filter(i => selectedCategory.value ? i.categoryId === selectedCategory.value : true)
      .filter(i => i.name.toLowerCase().includes(search.value.toLowerCase()))
  )
  const load = async () => {
    loading.value = true
    try {
      const [cats, its] = await Promise.all([menuRepository.getCategories(), menuRepository.getItems()])
      categories.value = cats; items.value = its
    } catch { /* API not available */ }
    finally { loading.value = false }
  }
  return { categories, filteredItems, selectedCategory, search, loading, load }
})
