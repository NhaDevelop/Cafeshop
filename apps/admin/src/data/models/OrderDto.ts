import type { OrderStatus, OrderItem } from '@cafe-nux/types'

/**
 * Data Transfer Object (DTO) for Orders.
 * In a real-world scalable POS, the backend API response might look different from the client UI needs.
 * DTOs exist in the `data/models` folder to cleanly map raw API JSON into your clean frontend `Order` entities.
 */
export interface OrderResponseDto {
  _id: string; // MongoDB or UUID
  table_id?: string;
  order_status: OrderStatus;
  order_source: 'pos' | 'online';
  line_items: Array<{
    item_id: string;
    item_name: string;
    qty: number;
    unit_price: number;
    total: number;
  }>;
  sub_total: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * Mapper function to convert backend DTO to frontend Entity
 */
export const mapOrderDtoToEntity = (dto: OrderResponseDto): any => ({
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
