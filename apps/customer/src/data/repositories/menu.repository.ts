import type { MenuItem, Category } from '../../types'
import { MOCK_CATEGORIES, MOCK_ITEMS } from '@cafe-nux/utils'

export const menuRepository = {
  getCategories: async () => {
    return new Promise<Category[]>(resolve => setTimeout(() => resolve(MOCK_CATEGORIES as unknown as Category[]), 300))
  },
  getItems: async (categoryId?: string) => {
    return new Promise<MenuItem[]>(resolve => setTimeout(() => {
      resolve(categoryId ? (MOCK_ITEMS.filter(i => i.categoryId === categoryId) as unknown as MenuItem[]) : (MOCK_ITEMS as unknown as MenuItem[]))
    }, 300))
  },
  getMenuItems: async () => MOCK_ITEMS as unknown as MenuItem[]
}
