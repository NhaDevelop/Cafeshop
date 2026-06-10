export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  imageUrl?: string;
}

export interface ProductSize {
  name: string;
  price: number;
}

export interface ProductModifier {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  category?: Category;
  price: number;
  imageUrl?: string;
  description?: string;
  isAvailable: boolean;
  tags?: string[];
  discount?: number;
  sizes?: ProductSize[];
  modifiers?: ProductModifier[];
}

export interface CreateMenuItemDTO {
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  isAvailable: boolean;
}
