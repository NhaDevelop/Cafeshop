import type { MenuItem, Category, Table, Customer, SugarLevel, IceLevel } from '../../types'

// ── Categories ───────────────────────────────────────────
const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Hot Coffee',   sortOrder: 1, icon: 'coffee' },
  { id: 'c2', name: 'Cold Coffee',  sortOrder: 2, icon: 'cup-soda' },
  { id: 'c3', name: 'Tea',          sortOrder: 3, icon: 'leaf' },
  { id: 'c4', name: 'Bakery',       sortOrder: 4, icon: 'croissant' },
  { id: 'c5', name: 'Snacks',       sortOrder: 5, icon: 'sandwich' },
  { id: 'c6', name: 'Desserts',     sortOrder: 6, icon: 'cake' },
  { id: 'c7', name: 'Smoothies',    sortOrder: 7, icon: 'glass-water' },
  { id: 'c8', name: 'Specials',     sortOrder: 8, icon: 'star' },
]

// ── Shared modifier presets ──────────────────────────────
const COFFEE_MODIFIERS = [
  { id: 'mod_shot',     name: 'Extra Shot',    price: 1.00 },
  { id: 'mod_decaf',    name: 'Decaf',         price: 0.00 },
  { id: 'mod_oat',      name: 'Oat Milk',      price: 0.75 },
  { id: 'mod_almond',   name: 'Almond Milk',   price: 0.75 },
  { id: 'mod_soy',      name: 'Soy Milk',      price: 0.50 },
  { id: 'mod_caramel',  name: 'Caramel Syrup', price: 0.50 },
  { id: 'mod_vanilla',  name: 'Vanilla Syrup', price: 0.50 },
  { id: 'mod_hazelnut', name: 'Hazelnut Syrup', price: 0.50 },
  { id: 'mod_whip',     name: 'Whipped Cream', price: 0.50 },
]

const SUGAR_LEVELS: SugarLevel[] = ['0%', '25%', '50%', '75%', '100%']
const ICE_LEVELS: IceLevel[] = ['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice']

// ── Products ─────────────────────────────────────────────
const MOCK_ITEMS: MenuItem[] = [
  // ─── Hot Coffee (c1) ───────────────────────────────────
  {
    id: 'm1', categoryId: 'c1', name: 'Espresso', price: 2.75,
    isAvailable: true, description: 'Rich and bold espresso shot',
    imageUrl: '/img/prod_espresso_1780722921070.png',
    productType: 'beverage',
    sizes: [{ name: 'Single', price: 2.75 }, { name: 'Double', price: 3.50 }],
    sugarLevels: SUGAR_LEVELS,
    modifiers: [COFFEE_MODIFIERS[0], COFFEE_MODIFIERS[1]],
  },
  {
    id: 'm2', categoryId: 'c1', name: 'Latte', price: 4.50,
    isAvailable: true, description: 'Smooth espresso with steamed milk',
    imageUrl: '/img/prod_latte_1780722932902.png',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 4.50 }, { name: 'M', price: 5.25 }, { name: 'L', price: 6.00 }],
    sugarLevels: SUGAR_LEVELS,
    modifiers: [COFFEE_MODIFIERS[0], COFFEE_MODIFIERS[2], COFFEE_MODIFIERS[3], COFFEE_MODIFIERS[5], COFFEE_MODIFIERS[6]],
  },
  {
    id: 'm3', categoryId: 'c1', name: 'Cappuccino', price: 4.50,
    isAvailable: true, description: 'Equal parts espresso, steamed milk, and foam',
    imageUrl: '/img/prod_cappuccino_1780722942525.png',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 4.50 }, { name: 'M', price: 5.25 }, { name: 'L', price: 6.00 }],
    sugarLevels: SUGAR_LEVELS,
    modifiers: [COFFEE_MODIFIERS[0], COFFEE_MODIFIERS[2], COFFEE_MODIFIERS[3], COFFEE_MODIFIERS[8]],
  },
  {
    id: 'm8', categoryId: 'c1', name: 'Americano', price: 3.50,
    isAvailable: true, description: 'Espresso diluted with hot water',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 3.50 }, { name: 'M', price: 4.00 }, { name: 'L', price: 4.50 }],
    sugarLevels: SUGAR_LEVELS,
    modifiers: [COFFEE_MODIFIERS[0], COFFEE_MODIFIERS[1]],
  },
  {
    id: 'm9', categoryId: 'c1', name: 'Mocha', price: 5.00,
    isAvailable: true, description: 'Chocolate espresso with steamed milk',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 5.00 }, { name: 'M', price: 5.75 }, { name: 'L', price: 6.50 }],
    sugarLevels: SUGAR_LEVELS,
    modifiers: [COFFEE_MODIFIERS[0], COFFEE_MODIFIERS[2], COFFEE_MODIFIERS[8]],
  },
  {
    id: 'm10', categoryId: 'c1', name: 'Flat White', price: 4.75,
    isAvailable: true, description: 'Double shot with velvety micro-foam milk',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 4.75 }, { name: 'M', price: 5.50 }],
    sugarLevels: SUGAR_LEVELS,
    modifiers: [COFFEE_MODIFIERS[0], COFFEE_MODIFIERS[2], COFFEE_MODIFIERS[3]],
  },

  // ─── Cold Coffee (c2) ──────────────────────────────────
  {
    id: 'm6', categoryId: 'c2', name: 'Iced Latte', price: 5.00,
    isAvailable: true, description: 'Cold and refreshing espresso with milk',
    imageUrl: '/img/prod_iced_latte_1780722981924.png',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 5.00 }, { name: 'M', price: 5.75 }, { name: 'L', price: 6.50 }],
    sugarLevels: SUGAR_LEVELS,
    iceLevels: ICE_LEVELS,
    modifiers: [COFFEE_MODIFIERS[0], COFFEE_MODIFIERS[2], COFFEE_MODIFIERS[5]],
  },
  {
    id: 'm11', categoryId: 'c2', name: 'Iced Americano', price: 4.00,
    isAvailable: true, description: 'Espresso over ice water',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 4.00 }, { name: 'M', price: 4.50 }, { name: 'L', price: 5.00 }],
    sugarLevels: SUGAR_LEVELS,
    iceLevels: ICE_LEVELS,
    modifiers: [COFFEE_MODIFIERS[0], COFFEE_MODIFIERS[1]],
  },
  {
    id: 'm12', categoryId: 'c2', name: 'Cold Brew', price: 5.50,
    isAvailable: true, description: 'Slow-steeped for 20 hours, smooth and bold',
    productType: 'beverage',
    sizes: [{ name: 'M', price: 5.50 }, { name: 'L', price: 6.25 }],
    sugarLevels: SUGAR_LEVELS,
    iceLevels: ICE_LEVELS,
    modifiers: [COFFEE_MODIFIERS[2], COFFEE_MODIFIERS[5], COFFEE_MODIFIERS[6]],
  },
  {
    id: 'm13', categoryId: 'c2', name: 'Iced Mocha', price: 5.75,
    isAvailable: true, description: 'Iced chocolate espresso with milk',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 5.75 }, { name: 'M', price: 6.50 }, { name: 'L', price: 7.25 }],
    sugarLevels: SUGAR_LEVELS,
    iceLevels: ICE_LEVELS,
    modifiers: [COFFEE_MODIFIERS[0], COFFEE_MODIFIERS[2], COFFEE_MODIFIERS[8]],
  },

  // ─── Tea (c3) ──────────────────────────────────────────
  {
    id: 'm14', categoryId: 'c3', name: 'Green Tea Latte', price: 4.75,
    isAvailable: true, description: 'Premium matcha with steamed milk',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 4.75 }, { name: 'M', price: 5.50 }, { name: 'L', price: 6.25 }],
    sugarLevels: SUGAR_LEVELS,
    iceLevels: ICE_LEVELS,
    modifiers: [COFFEE_MODIFIERS[2], COFFEE_MODIFIERS[3]],
  },
  {
    id: 'm15', categoryId: 'c3', name: 'Earl Grey', price: 3.00,
    isAvailable: true, description: 'Classic bergamot black tea',
    productType: 'beverage',
    sugarLevels: SUGAR_LEVELS,
  },
  {
    id: 'm16', categoryId: 'c3', name: 'Jasmine Tea', price: 3.00,
    isAvailable: true, description: 'Fragrant jasmine-infused green tea',
    productType: 'beverage',
    sugarLevels: SUGAR_LEVELS,
  },
  {
    id: 'm17', categoryId: 'c3', name: 'Thai Milk Tea', price: 5.00,
    isAvailable: true, description: 'Creamy Thai tea with condensed milk',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 5.00 }, { name: 'M', price: 5.75 }, { name: 'L', price: 6.50 }],
    sugarLevels: SUGAR_LEVELS,
    iceLevels: ICE_LEVELS,
  },

  // ─── Bakery (c4) ───────────────────────────────────────
  {
    id: 'm4', categoryId: 'c4', name: 'Butter Croissant', price: 3.00,
    isAvailable: true, description: 'Flaky French-style butter croissant',
    imageUrl: '/img/prod_croissant_1780722955992.png',
    productType: 'food',
  },
  {
    id: 'm5', categoryId: 'c4', name: 'Chocolate Muffin', price: 3.50,
    isAvailable: true, description: 'Rich double chocolate chip muffin',
    imageUrl: '/img/prod_muffin_1780722969435.png',
    productType: 'food',
  },
  {
    id: 'm18', categoryId: 'c4', name: 'Almond Croissant', price: 4.00,
    isAvailable: true, description: 'Croissant filled with almond cream',
    productType: 'food',
  },
  {
    id: 'm19', categoryId: 'c4', name: 'Banana Bread', price: 3.50,
    isAvailable: true, description: 'Homemade moist banana bread slice',
    productType: 'food',
  },
  {
    id: 'm20', categoryId: 'c4', name: 'Cinnamon Roll', price: 4.50,
    isAvailable: true, description: 'Warm cinnamon swirl with cream cheese icing',
    productType: 'food',
  },

  // ─── Snacks (c5) ───────────────────────────────────────
  {
    id: 'm21', categoryId: 'c5', name: 'Club Sandwich', price: 7.50,
    isAvailable: true, description: 'Triple-decker with chicken, bacon, lettuce',
    productType: 'food',
  },
  {
    id: 'm22', categoryId: 'c5', name: 'Tuna Sandwich', price: 6.50,
    isAvailable: true, description: 'Fresh tuna salad on sourdough',
    productType: 'food',
  },
  {
    id: 'm23', categoryId: 'c5', name: 'French Fries', price: 4.00,
    isAvailable: true, description: 'Crispy golden fries with ketchup',
    productType: 'food',
  },
  {
    id: 'm24', categoryId: 'c5', name: 'Caesar Salad', price: 8.00,
    isAvailable: true, description: 'Romaine lettuce, croutons, parmesan',
    productType: 'food',
  },

  // ─── Desserts (c6) ─────────────────────────────────────
  {
    id: 'm25', categoryId: 'c6', name: 'Tiramisu', price: 6.50,
    isAvailable: true, description: 'Classic Italian coffee-flavored dessert',
    productType: 'food',
  },
  {
    id: 'm26', categoryId: 'c6', name: 'Cheesecake', price: 6.00,
    isAvailable: true, description: 'New York style baked cheesecake',
    productType: 'food',
  },
  {
    id: 'm27', categoryId: 'c6', name: 'Brownie', price: 4.50,
    isAvailable: true, description: 'Fudgy chocolate brownie',
    productType: 'food',
  },

  // ─── Smoothies (c7) ────────────────────────────────────
  {
    id: 'm7', categoryId: 'c7', name: 'Matcha Frappe', price: 6.00,
    isAvailable: true, description: 'Premium Japanese green tea blended',
    productType: 'beverage',
    sizes: [{ name: 'S', price: 6.00 }, { name: 'M', price: 6.75 }, { name: 'L', price: 7.50 }],
    sugarLevels: SUGAR_LEVELS,
    iceLevels: ICE_LEVELS,
  },
  {
    id: 'm28', categoryId: 'c7', name: 'Mango Smoothie', price: 6.00,
    isAvailable: true, description: 'Fresh mango blended with yogurt',
    productType: 'beverage',
    sizes: [{ name: 'M', price: 6.00 }, { name: 'L', price: 7.00 }],
    sugarLevels: SUGAR_LEVELS,
    iceLevels: ICE_LEVELS,
  },
  {
    id: 'm29', categoryId: 'c7', name: 'Berry Smoothie', price: 6.50,
    isAvailable: true, description: 'Mixed berries with banana and oat milk',
    productType: 'beverage',
    sizes: [{ name: 'M', price: 6.50 }, { name: 'L', price: 7.50 }],
    sugarLevels: SUGAR_LEVELS,
    iceLevels: ICE_LEVELS,
  },

  // ─── Specials (c8) ─────────────────────────────────────
  {
    id: 'm30', categoryId: 'c8', name: 'Affogato', price: 5.50,
    isAvailable: true, description: 'Vanilla gelato drowned in espresso',
    productType: 'food',
  },
  {
    id: 'm31', categoryId: 'c8', name: 'Breakfast Set', price: 12.00,
    isAvailable: true, description: 'Croissant, scrambled eggs, juice & coffee',
    productType: 'food',
  },
]

// ── Tables ───────────────────────────────────────────────
const MOCK_TABLES: Table[] = [
  { id: 't1',  number: 1,  capacity: 2, status: 'available', zone: 'Indoor' },
  { id: 't2',  number: 2,  capacity: 2, status: 'available', zone: 'Indoor' },
  { id: 't3',  number: 3,  capacity: 4, status: 'occupied',  zone: 'Indoor' },
  { id: 't4',  number: 4,  capacity: 4, status: 'available', zone: 'Indoor' },
  { id: 't5',  number: 5,  capacity: 6, status: 'available', zone: 'Indoor' },
  { id: 't6',  number: 6,  capacity: 2, status: 'reserved',  zone: 'Indoor' },
  { id: 't7',  number: 7,  capacity: 4, status: 'available', zone: 'Outdoor' },
  { id: 't8',  number: 8,  capacity: 4, status: 'available', zone: 'Outdoor' },
  { id: 't9',  number: 9,  capacity: 6, status: 'occupied',  zone: 'Outdoor' },
  { id: 't10', number: 10, capacity: 8, status: 'available', zone: 'VIP' },
  { id: 't11', number: 11, capacity: 4, status: 'available', zone: 'VIP' },
  { id: 't12', number: 12, capacity: 2, status: 'available', zone: 'Bar' },
]

// ── Customers ────────────────────────────────────────────
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust_1', name: 'Sophia Chen',   phone: '012-555-001', points: 450, totalOrders: 34, lastVisit: '2026-06-17' },
  { id: 'cust_2', name: 'Dara Morn',     phone: '012-555-002', points: 280, totalOrders: 21, lastVisit: '2026-06-15' },
  { id: 'cust_3', name: 'Vicheka Ky',    phone: '012-555-003', points: 120, totalOrders: 9,  lastVisit: '2026-06-10' },
  { id: 'cust_4', name: 'Srey Pich',     phone: '012-555-004', points: 830, totalOrders: 67, lastVisit: '2026-06-18' },
  { id: 'cust_5', name: 'Sokha Chhim',   phone: '012-555-005', points: 60,  totalOrders: 5 },
  { id: 'cust_6', name: 'James Wilson',  phone: '012-555-006', points: 175, totalOrders: 14, lastVisit: '2026-06-16' },
  { id: 'cust_7', name: 'Emily Park',    phone: '012-555-007', points: 520, totalOrders: 41, lastVisit: '2026-06-17' },
  { id: 'cust_8', name: 'Rathana Sok',   phone: '012-555-008', points: 90,  totalOrders: 7,  lastVisit: '2026-06-14' },
]

// ── Repository ───────────────────────────────────────────
export const menuRepository = {
  getCategories: async () => new Promise<Category[]>(res => setTimeout(() => res(MOCK_CATEGORIES), 200)),
  getItems: async () => new Promise<MenuItem[]>(res => setTimeout(() => {
    const itemsWithImages = MOCK_ITEMS.map(item => ({
      ...item,
      imageUrl: item.imageUrl || `https://placehold.co/300x300/f1f5f9/64748b?text=${encodeURIComponent(item.name.replace(' ', '+'))}`
    }))
    res(itemsWithImages)
  }, 200)),
  getTables: async () => new Promise<Table[]>(res => setTimeout(() => res(MOCK_TABLES), 100)),
  getCustomers: async () => new Promise<Customer[]>(res => setTimeout(() => res(MOCK_CUSTOMERS), 100)),
  searchCustomers: async (query: string) => {
    const q = query.toLowerCase()
    return MOCK_CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  },
  create: async (data: Partial<MenuItem>) => ({ ...data, id: `m_${Date.now()}` } as MenuItem),
  update: async (id: string, data: Partial<MenuItem>) => ({ ...data, id } as MenuItem),
  delete: async (_id: string) => {},
}
