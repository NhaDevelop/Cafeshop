import type { MenuItem, Category, Table, Customer } from '../../types'
import { MOCK_CATEGORIES, MOCK_ITEMS, MOCK_TABLES, MOCK_CUSTOMERS } from '@cafe-nux/utils'

export const menuRepository = {
  getCategories: async () => new Promise<Category[]>(res => setTimeout(() => res(MOCK_CATEGORIES as unknown as Category[]), 200)),
  getItems: async () => new Promise<MenuItem[]>(res => setTimeout(() => {
    const itemsWithImages = MOCK_ITEMS.map(item => ({
      ...item,
      imageUrl: item.imageUrl || `https://placehold.co/300x300/f1f5f9/64748b?text=${encodeURIComponent(item.name.replace(' ', '+'))}`
    }))
    // We cast to MenuItem array to satisfy TS
    res(itemsWithImages as unknown as MenuItem[])
  }, 200)),
  getTables: async () => new Promise<Table[]>(res => setTimeout(() => res(MOCK_TABLES as unknown as Table[]), 100)),
  getCustomers: async () => new Promise<Customer[]>(res => setTimeout(() => res(MOCK_CUSTOMERS as unknown as Customer[]), 100)),
  searchCustomers: async (query: string) => {
    const q = query.toLowerCase()
    return (MOCK_CUSTOMERS as unknown as Customer[]).filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  },
  create: async (data: Partial<MenuItem>) => ({ ...data, id: `m_${Date.now()}` } as MenuItem),
  update: async (id: string, data: Partial<MenuItem>) => ({ ...data, id } as MenuItem),
  delete: async (_id: string) => {},
}
