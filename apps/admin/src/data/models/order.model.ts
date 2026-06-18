import type { OrderStatus, OrderItem } from '../../types'

/**
 * Data Transfer Object — maps raw API JSON (snake_case) to clean frontend Order entities (camelCase).
 * This lives in `data/models/` so all API-to-entity mapping is in one place.
 * When the Laravel backend is connected, only update these DTOs.
 */
export interface OrderResponseDto {
  _id: string
  table_id?: string
  order_status: OrderStatus
  order_source: 'pos' | 'online'
  line_items: Array<{
    item_id: string
    item_name: string
    qty: number
    unit_price: number
    total: number
  }>
  sub_total: number
  tax_amount: number
  total_amount: number
  created_at: string
  updated_at: string
}

export const mapOrderDtoToEntity = (dto: OrderResponseDto) => ({
  id: dto._id,
  tableId: dto.table_id,
  status: dto.order_status,
  source: dto.order_source,
  items: dto.line_items.map(item => ({
    id: item.item_id,
    menuItemId: item.item_id,
    name: item.item_name,
    quantity: item.qty,
    price: item.unit_price,
    subtotal: item.total
  })),
  subtotal: dto.sub_total,
  tax: dto.tax_amount,
  grandTotal: dto.total_amount,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at
})
