import type { MenuItem, Category } from '../../types'

const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Coffee', sortOrder: 1 },
  { id: 'c2', name: 'Pastries', sortOrder: 2 },
  { id: 'c3', name: 'Cold Drinks', sortOrder: 3 },
]

const MOCK_ITEMS: MenuItem[] = [
  { id: 'm1', categoryId: 'c1', name: 'Espresso', price: 3.5, isAvailable: true, description: 'Rich and bold double shot', imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80' },
  { id: 'm2', categoryId: 'c1', name: 'Latte', price: 4.5, isAvailable: true, description: 'Smooth espresso with steamed milk', imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80', sizes: [{name: 'Small', price: 4.5}, {name: 'Medium', price: 5.5}, {name: 'Large', price: 6.5}] },
  { id: 'm3', categoryId: 'c1', name: 'Cappuccino', price: 4.5, isAvailable: true, description: 'Equal parts espresso, steamed milk, and foam', imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', sizes: [{name: 'Small', price: 4.5}, {name: 'Medium', price: 5.5}, {name: 'Large', price: 6.5}] },
  { id: 'm4', categoryId: 'c2', name: 'Butter Croissant', price: 3.0, isAvailable: true, description: 'Flaky and buttery', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
  { id: 'm5', categoryId: 'c2', name: 'Chocolate Muffin', price: 3.5, isAvailable: true, description: 'Rich chocolate chips', imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' },
  { id: 'm6', categoryId: 'c3', name: 'Iced Latte', price: 5.0, isAvailable: true, description: 'Cold and refreshing', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80', sizes: [{name: 'Small', price: 5.0}, {name: 'Medium', price: 6.0}, {name: 'Large', price: 7.0}] },
  { id: 'm7', categoryId: 'c3', name: 'Matcha Frappe', price: 6.0, isAvailable: true, description: 'Premium Japanese green tea blended', imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400&q=80', sizes: [{name: 'Medium', price: 6.0}, {name: 'Large', price: 7.0}] },
]

export const menuRepository = {
  getCategories: async () => {
    return new Promise<Category[]>(resolve => setTimeout(() => resolve(MOCK_CATEGORIES), 300))
  },
  getItems: async (categoryId?: string) => {
    return new Promise<MenuItem[]>(resolve => setTimeout(() => {
      resolve(categoryId ? MOCK_ITEMS.filter(i => i.categoryId === categoryId) : MOCK_ITEMS)
    }, 300))
  },
  getMenuItems: async () => MOCK_ITEMS
}
