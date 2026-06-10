import type { PaymentMethod } from './order';

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  paidAt: string;
}

export interface CreatePaymentDTO {
  orderId: string;
  method: PaymentMethod;
  amount: number;
}
