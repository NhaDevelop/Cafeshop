import type { Order, CreateOrderDTO, OrderStatus } from '@cafe-nux/types';
import { apiFetch } from './base';

export const orderApi = {
  getOrders: (params?: { status?: OrderStatus; date?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<Order[]>(`/orders${q ? `?${q}` : ''}`);
  },
  getOrder: (id: string) =>
    apiFetch<Order>(`/orders/${id}`),
  createOrder: (data: CreateOrderDTO) =>
    apiFetch<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: OrderStatus) =>
    apiFetch<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
