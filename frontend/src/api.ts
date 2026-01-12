import type { Product } from './types';

// Use environment variable in production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000' : '');

/**
 * Fetches all products from the backend
 */
export async function fetchProducts(): Promise<Product[]> {
  const url = API_BASE_URL ? `${API_BASE_URL}/api/products` : '/api/products';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}
