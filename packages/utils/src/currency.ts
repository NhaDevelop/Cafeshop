export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculateTax(amount: number, rate = 0.1): number {
  return Math.round(amount * rate * 100) / 100;
}

export function calculateTotal(subtotal: number, taxRate = 0.1): { subtotal: number; tax: number; grandTotal: number } {
  const tax = calculateTax(subtotal, taxRate);
  return { subtotal, tax, grandTotal: subtotal + tax };
}
