import type { DashboardStats, SalesSummary } from '@cafe-nux/types';
import { apiFetch } from './base';

export const reportApi = {
  getDashboardStats: () =>
    apiFetch<DashboardStats>('/reports/dashboard'),
  getSalesByRange: (from: string, to: string) =>
    apiFetch<SalesSummary[]>(`/reports/sales?from=${from}&to=${to}`),
};
