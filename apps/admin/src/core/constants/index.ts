export const APP_NAME = 'Cafe NUX Admin'
export const TAX_RATE = 0.1

export const SOCKET_EVENTS = {
  ORDER_NEW:            'order:new',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_READY:          'order:ready',
} as const
