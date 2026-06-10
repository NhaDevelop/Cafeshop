export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{8,15}$/.test(phone);
}

export function isEmpty(value: string | null | undefined): boolean {
  return value == null || value.trim() === '';
}
