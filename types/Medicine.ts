export interface Medicine {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  stock: number;
}

export interface CartItem extends Medicine {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}