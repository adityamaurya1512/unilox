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

/**
 * Generate discount code (Admin API - if next order is nth order)
 */
export async function generateDiscountCode(): Promise<{ code: string | null; discountPercentage: number; message: string }> {
  const url = getApiUrl('/api/admin/discount/generate');
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate discount code');
  }
  
  return response.json();
}

/**
 * Get admin statistics
 */
export async function getAdminStats() {
  const url = getApiUrl('/api/admin/stats');
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  
  return response.json();
}

/**
 * Validate a discount code
 */
export async function validateDiscountCode(code: string): Promise<{ valid: boolean; discountPercentage?: number; message?: string }> {
  const url = getApiUrl('/api/discount/validate');
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to validate discount code');
  }
  
  return response.json();
}

/**
 * Checkout - Create order with optional discount code
 */
export async function checkout(discountCode?: string) {
  const url = getApiUrl('/api/checkout');
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ discountCode: discountCode || null }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to checkout' }));
    throw new Error(error.error || 'Failed to checkout');
  }
  
  return response.json();
}
