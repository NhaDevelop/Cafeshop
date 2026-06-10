export interface User        { id: string; name: string; email: string; role: 'admin'|'cashier'|'kitchen' }
export interface LoginDTO    { email: string; password: string }
export interface Category    { id: string; name: string; description?: string; sortOrder: number }
export interface ProductSize   { name: string; price: number }
export interface ProductModifier { id: string; name: string; price: number }
export interface MenuItem    { id: string; categoryId: string; name: string; description?: string; price: number; isAvailable: boolean; imageUrl?: string; discount?: number; sizes?: ProductSize[]; modifiers?: ProductModifier[] }
export type OrderStatus      = 'pending'|'preparing'|'ready'|'completed'|'cancelled'
export interface OrderModifier { id: string; name: string; price: number }
export interface OrderItem   { id: string; menuItemId: string; name: string; quantity: number; price: number; subtotal: number; size?: string; modifiers?: OrderModifier[]; note?: string }
export interface OrderPayment { id: string; amount: number; method: 'cash'|'card'|'qr'; timestamp: string }
export interface Order       { id: string; tableId?: string; tableLabel?: string; status: OrderStatus; paymentStatus: 'paid' | 'partial' | 'unpaid'; payments?: OrderPayment[]; source: 'pos'|'online'; items: OrderItem[]; subtotal: number; tax: number; grandTotal: number; createdAt: string; updatedAt: string }
export interface CreateOrderItemDTO { menuItemId: string; quantity: number; size?: string; modifiers?: OrderModifier[]; note?: string }
export interface CreateOrderDTO     { tableId?: string; tableLabel?: string; source: 'pos'|'online'; items: CreateOrderItemDTO[] }
export interface PaymentDTO  { orderId: string; method: 'cash'|'card'|'qr'; amount: number }
export interface SalesSummary{ date: string; revenue: number; orderCount: number; avgOrderValue: number }
export interface TopItem     { menuItemId: string; name: string; quantity: number; revenue: number }
export interface DashboardStats { todayRevenue: number; todayOrders: number; avgOrderValue: number; activeTables: number; topItems: TopItem[] }
