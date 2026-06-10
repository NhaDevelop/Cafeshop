import type { MenuItem, Category } from '../../types'

const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Coffee', sortOrder: 1 },
  { id: 'c2', name: 'Pastries', sortOrder: 2 },
  { id: 'c3', name: 'Cold Drinks', sortOrder: 3 },
]

const MOCK_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    categoryId: 'c1',
    name: 'Espresso',
    price: 2.75,
    isAvailable: true,
    description: 'Rich and bold espresso shot',
    imageUrl: '/img/prod_espresso_1780722921070.png',
    sizes: [
      { name: 'Single', price: 2.75 },
      { name: 'Double', price: 3.5 },
    ],
    modifiers: [
      { id: 'mod_1', name: 'Extra Shot', price: 1.0 },
      { id: 'mod_2', name: 'Decaf', price: 0.0 },
    ],
  },
  {
    id: 'm2',
    categoryId: 'c1',
    name: 'Latte',
    price: 4.5,
    isAvailable: true,
    description: 'Smooth espresso with steamed milk',
    imageUrl: '/img/prod_latte_1780722932902.png',
    sizes: [
      { name: 'Small', price: 4.5 },
      { name: 'Medium', price: 5.25 },
      { name: 'Large', price: 6 },
    ],
  },
  {
    id: 'm3',
    categoryId: 'c1',
    name: 'Cappuccino',
    price: 4.5,
    isAvailable: true,
    description: 'Equal parts espresso, steamed milk, and foam',
    imageUrl: '/img/prod_cappuccino_1780722942525.png',
    sizes: [
      { name: 'Small', price: 4.5 },
      { name: 'Medium', price: 5.25 },
      { name: 'Large', price: 6 },
    ],
  },
  { id: 'm4', categoryId: 'c2', name: 'Butter Croissant', price: 3.0, isAvailable: true, description: 'Flaky and buttery', imageUrl: '/img/prod_croissant_1780722955992.png' },
  { id: 'm5', categoryId: 'c2', name: 'Chocolate Muffin', price: 3.5, isAvailable: true, description: 'Rich chocolate chips', imageUrl: '/img/prod_muffin_1780722969435.png' },
  {
    id: 'm6',
    categoryId: 'c3',
    name: 'Iced Latte',
    price: 5.0,
    isAvailable: true,
    description: 'Cold and refreshing',
    imageUrl: '/img/prod_iced_latte_1780722981924.png',
    sizes: [
      { name: 'Small', price: 5 },
      { name: 'Medium', price: 5.75 },
      { name: 'Large', price: 6.5 },
    ],
    modifiers: [
      { id: 'mod_3', name: 'Oat Milk', price: 0.75 },
      { id: 'mod_1', name: 'Extra Shot', price: 1.0 },
      { id: 'mod_6', name: 'Less Ice', price: 0.0 },
    ],
  },
  {
    id: 'm7',
    categoryId: 'c3',
    name: 'Matcha Frappe',
    price: 6.0,
    isAvailable: true,
    description: 'Premium Japanese green tea blended',
    imageUrl: 'https://placehold.co/300x300/e2e8f0/475569?text=Matcha',
    sizes: [
      { name: 'Small', price: 6 },
      { name: 'Medium', price: 6.75 },
      { name: 'Large', price: 7.5 },
    ],
  },
]

export const menuRepository = {
  getCategories: async () => new Promise<Category[]>(res => setTimeout(() => res(MOCK_CATEGORIES), 300)),
  getItems: async () => new Promise<MenuItem[]>(res => setTimeout(() => res(MOCK_ITEMS), 300)),
  create: async (data: Partial<MenuItem>) => ({ ...data, id: 'm_new' } as MenuItem),
  update: async (id: string, data: Partial<MenuItem>) => ({ ...data, id } as MenuItem),
  delete: async (_id: string) => {},
}
