import type { Product, CartItem } from './types';
import { getSessionId } from './utils/session';

// Use environment variable in production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000' : '');

/**
 * Helper to get the base API URL
 */
function getApiUrl(endpoint: string): string {
  return API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
}

/**
 * Helper to get headers with session ID
 */
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
  };
}

/**
 * Fetches all products from the backend
 */
export async function fetchProducts(): Promise<Product[]> {
  const url = getApiUrl('/api/products');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

/**
 * Fetches cart items for the current session
 */
export async function getCart(): Promise<CartItem[]> {
  const url = getApiUrl('/api/cart');
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }
  return response.json();
}

/**
 * Adds an item to the cart
 */
export async function addToCart(productId: string, quantity: number): Promise<CartItem[]> {
  const url = getApiUrl('/api/cart');
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to add to cart' }));
    throw new Error(error.error || 'Failed to add to cart');
  }
  
  const data = await response.json();
  return data.cart;
}
