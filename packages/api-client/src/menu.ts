import type { MenuItem, Category, CreateMenuItemDTO } from '@cafe-nux/types';
import { apiFetch } from './base';

export const menuApi = {
  getCategories: () =>
    apiFetch<Category[]>('/menu/categories'),
  getItems: (categoryId?: string) =>
    apiFetch<MenuItem[]>(`/menu/items${categoryId ? `?categoryId=${categoryId}` : ''}`),
  getItem: (id: string) =>
    apiFetch<MenuItem>(`/menu/items/${id}`),
  createItem: (data: CreateMenuItemDTO) =>
    apiFetch<MenuItem>('/menu/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id: string, data: Partial<CreateMenuItemDTO>) =>
    apiFetch<MenuItem>(`/menu/items/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteItem: (id: string) =>
    apiFetch<void>(`/menu/items/${id}`, { method: 'DELETE' }),
};
