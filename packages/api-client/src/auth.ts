import type { LoginDTO, AuthResponse } from '@cafe-nux/types';
import { apiFetch } from './base';

export const authApi = {
  login: (data: LoginDTO) =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () =>
    apiFetch<void>('/auth/logout', { method: 'POST' }),
  me: () =>
    apiFetch<AuthResponse['user']>('/auth/me'),
};
