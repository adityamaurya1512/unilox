import { useState, useEffect } from 'react';
import { getCart } from '../api';
import type { CartItem, Product } from '../types';
import { fetchProducts } from '../api';

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

/**
 * Cart Page Component
 * Displays cart items with product details and allows checkout
 */
export function Cart() {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        const items = await getCart();
        const products = await fetchProducts();
        
        // Enrich cart items with product details
        const itemsWithProducts: CartItemWithProduct[] = items.map(item => ({
          ...item,
          product: products.find(p => p.id === item.productId),
        }));
        
        setCartItems(itemsWithProducts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cart');
        console.error('Error loading cart:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.product) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <p className="text-white text-lg mb-4">Your cart is empty</p>
            <a
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => {
                if (!item.product) return null;
                
                return (
                  <div
                    key={item.productId}
                    className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-white font-semibold text-lg mb-2">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        Price: {formatPrice(item.product.price)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center">
                      <p className="text-white font-bold text-xl">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white text-lg font-semibold">Total:</span>
                <span className="text-white text-2xl font-bold">
                  {formatPrice(calculateTotal())}
                </span>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
