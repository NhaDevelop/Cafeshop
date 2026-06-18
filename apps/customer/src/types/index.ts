export interface Category   { id: string; name: string; description?: string; sortOrder: number }
export interface ProductSize { name: string; price: number; }
export interface MenuItem   { id: string; categoryId: string; name: string; description?: string; price: number; isAvailable: boolean; imageUrl?: string; sizes?: ProductSize[] }
export type OrderStatus     = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export interface OrderItem  { id: string; menuItemId: string; name: string; quantity: number; price: number; subtotal: number; note?: string; size?: string; sugarLevel?: string; iceLevel?: string; modifiers?: any[] }
export interface Order      { id: string; tableId?: string; tableLabel?: string; status: OrderStatus; paymentStatus: 'paid' | 'unpaid'; source: 'pos'|'online'; items: OrderItem[]; subtotal: number; tax: number; grandTotal: number; createdAt: string; updatedAt: string }
export interface CreateOrderItemDTO { menuItemId: string; name?: string; price?: number; quantity: number; note?: string; size?: string; sugarLevel?: string; iceLevel?: string; modifiers?: any[] }
export interface CreateOrderDTO     { tableId?: string; tableLabel?: string; source: 'pos'|'online'; items: CreateOrderItemDTO[] }
