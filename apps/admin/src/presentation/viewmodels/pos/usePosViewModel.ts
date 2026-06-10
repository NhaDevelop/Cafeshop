import { defineStore } from 'pinia'
import type { MenuItem, Category, Order, CreateOrderDTO } from '../../../types'
import { menuRepository }    from '../../../data/repositories/menu.repository'
import { orderRepository }   from '../../../data/repositories/order.repository'
import { paymentRepository } from '../../../data/repositories/payment.repository'
import { calculateTotal }    from '../../../utils'
interface CartItem { id: string; menuItemId: string; name: string; quantity: number; price: number; subtotal: number; note?: string }
export const usePosStore = defineStore('pos', () => {
  const categories       = ref<Category[]>([])
  const menuItems        = ref<MenuItem[]>([])
  const cart             = ref<CartItem[]>([])
  const liveOrders       = ref<Order[]>([])
  const selectedCategory = ref<string | null>(null)
  const tableId          = ref('')
  const loading          = ref(false)
  const error            = ref<string | null>(null)
  const totals        = computed(() => calculateTotal(cart.value.reduce((s, i) => s + i.subtotal, 0)))
  const filteredItems = computed(() => selectedCategory.value ? menuItems.value.filter(i => i.categoryId === selectedCategory.value) : menuItems.value)
  const loadMenu = async () => {
    try {
      const [cats, items] = await Promise.all([menuRepository.getCategories(), menuRepository.getItems()])
      categories.value = cats; menuItems.value = items
    } catch { /* no backend yet */ }
  }
  const initSocket = () => { /* socket.io will be initialized when backend is ready */ }
  const addToCart = (item: MenuItem) => {
    const existing = cart.value.find(c => c.menuItemId === item.id)
    if (existing) { existing.quantity++; existing.subtotal = existing.quantity * item.price }
    else cart.value.push({ id: crypto.randomUUID(), menuItemId: item.id, name: item.name, quantity: 1, price: item.price, subtotal: item.price })
  }
  const removeFromCart = (menuItemId: string) => { cart.value = cart.value.filter(c => c.menuItemId !== menuItemId) }
  const updateQuantity = (menuItemId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(menuItemId)
    const existing = cart.value.find(c => c.menuItemId === menuItemId)
    if (existing) { existing.quantity = qty; existing.subtotal = qty * existing.price }
  }
  const clearCart = () => { cart.value = [] }
  const placeOrder = async (paymentMethod: 'cash'|'card'|'qr') => {
    if (!cart.value.length) return
    loading.value = true; error.value = null
    try {
      const dto: CreateOrderDTO = { tableId: tableId.value || undefined, source: 'pos', items: cart.value.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity })) }
      const order = await orderRepository.create(dto)
      await paymentRepository.create({ orderId: order.id, method: paymentMethod, amount: totals.value.grandTotal })
      clearCart(); return order
    } catch (e: unknown) { error.value = e instanceof Error ? e.message : 'Failed to place order' }
    finally { loading.value = false }
  }
  return { categories, filteredItems, cart, liveOrders, totals, selectedCategory, tableId, loading, error, loadMenu, initSocket, addToCart, removeFromCart, updateQuantity, clearCart, placeOrder }
})
