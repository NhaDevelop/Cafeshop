import type { PaymentDTO } from '../../types'
import { apiFetch } from '../services/api.service'
export const paymentRepository = {
  create: (data: PaymentDTO) => apiFetch<void>('/payments', { method: 'POST', body: JSON.stringify(data) }),
}
