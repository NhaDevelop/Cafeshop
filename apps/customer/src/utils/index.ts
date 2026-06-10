export const calculateTotal = (subtotal: number) => {
  const tax       = Math.round(subtotal * 0.10 * 100) / 100
  const grandTotal = Math.round((subtotal + tax) * 100) / 100
  return { subtotal: Math.round(subtotal * 100) / 100, tax, grandTotal }
}
