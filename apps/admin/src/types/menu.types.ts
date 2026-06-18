// ── Menu & Product Types ──────────────────────────────────

export type ProductType = 'beverage' | 'food'

export type SugarLevel = '0%' | '25%' | '50%' | '75%' | '100%'
export type IceLevel   = 'No Ice' | 'Less Ice' | 'Normal Ice' | 'Extra Ice'

export interface Category {
  id: string
  name: string
  description?: string
  sortOrder: number
  icon?: string
}

export interface ProductSize {
  name: string
  price: number
}

export interface ProductModifier {
  id: string
  name: string
  price: number
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  description?: string
  price: number
  isAvailable: boolean
  imageUrl?: string
  discount?: number
  productType: ProductType
  sizes?: ProductSize[]
  modifiers?: ProductModifier[]
  sugarLevels?: SugarLevel[]
  iceLevels?: IceLevel[]
}

export interface Table {
  id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  zone?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  points: number
  totalOrders: number
  lastVisit?: string
}
