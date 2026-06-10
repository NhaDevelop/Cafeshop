import type { OrderStatus } from '@cafe-nux/types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#F5C842',
  preparing: '#C8860A',
  ready: '#4CAF50',
  completed: '#6B7280',
  cancelled: '#EF4444',
};

export function getNextStatus(status: OrderStatus): OrderStatus | null {
  const flow: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];
  const idx = flow.indexOf(status);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
}
