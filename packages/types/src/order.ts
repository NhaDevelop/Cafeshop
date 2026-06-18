export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderSource = 'pos' | 'online';
export type PaymentMethod = 'cash' | 'card' | 'qr';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface OrderModifier {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  sugarLevel?: string;
  iceLevel?: string;
  modifiers?: OrderModifier[];
  note?: string;
  subtotal: number;
}

export interface OrderPayment {
  id: string;
  amount: number;
  method: PaymentMethod;
  timestamp: string;
}

export interface Order {
  id: string;
  tableId?: string;
  tableLabel?: string;
  source: OrderSource;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payments?: OrderPayment[];
  items: OrderItem[];
  total: number;
  tax: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDTO {
  tableId?: string;
  tableLabel?: string;
  source: OrderSource;
  paymentStatus?: PaymentStatus;
  items: { menuItemId: string; name?: string; price?: number; quantity: number; size?: string; sugarLevel?: string; iceLevel?: string; modifiers?: OrderModifier[]; note?: string }[];
}
