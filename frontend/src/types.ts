export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}
