// ── Order Types ───────────────────────────────────────────
import type { SugarLevel, IceLevel } from './menu.types'

export type OrderStatus     = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export type PaymentStatus   = 'paid' | 'partial' | 'unpaid'
export type PaymentMethod   = 'cash' | 'card' | 'qr'
export type OrderSource     = 'pos' | 'online'

export interface OrderModifier {
  id: string
  name: string
  price: number
}

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  subtotal: number
  size?: string
  sugarLevel?: SugarLevel
  iceLevel?: IceLevel
  modifiers?: OrderModifier[]
  itemDiscount?: number
  note?: string
}

export interface OrderPayment {
  id: string
  amount: number
  method: PaymentMethod
  timestamp: string
}

export interface Order {
  id: string
  tableId?: string
  tableLabel?: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  source: OrderSource
  payments?: OrderPayment[]
  items: OrderItem[]
  subtotal: number
  tax: number
  grandTotal: number
  createdAt: string
  updatedAt: string
}

// ── DTOs (sent to backend) ────────────────────────────────

export interface CreateOrderItemDTO {
  menuItemId: string
  quantity: number
  size?: string
  sugarLevel?: SugarLevel
  iceLevel?: IceLevel
  modifiers?: OrderModifier[]
  note?: string
}

export interface CreateOrderDTO {
  tableId?: string
  tableLabel?: string
  source: OrderSource
  items: CreateOrderItemDTO[]
}

export interface PaymentDTO {
  orderId: string
  method: PaymentMethod
  amount: number
}
