import { useState, useEffect } from 'react';
import { getCart, validateDiscountCode, generateDiscountCode, checkout } from '../api';
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
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentage: number } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [requestingCode, setRequestingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

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

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.product) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (appliedDiscount) {
      const discountAmount = subtotal * appliedDiscount.percentage;
      return subtotal - discountAmount;
    }
    return subtotal;
  };

  const calculateDiscountAmount = () => {
    if (appliedDiscount) {
      return calculateSubtotal() * appliedDiscount.percentage;
    }
    return 0;
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      alert('Please enter a discount code');
      return;
    }

    try {
      setValidatingCode(true);
      const result = await validateDiscountCode(discountCode.trim());
      
      if (result.valid && result.discountPercentage) {
        setAppliedDiscount({ 
          code: discountCode.trim(), 
          percentage: result.discountPercentage 
        });
        setError(null);
      } else {
        alert(result.message || 'Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to validate discount code');
      setAppliedDiscount(null);
    } finally {
      setValidatingCode(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
  };

  const handleRequestDiscountCode = async () => {
    try {
      setRequestingCode(true);
      setCodeMessage(null);
      const result = await generateDiscountCode();
      
      if (result.code) {
        setGeneratedCode(result.code);
        setDiscountCode(result.code);
        setCodeMessage('Discount code generated! You can apply it below.');
      } else {
        setGeneratedCode(null);
        setCodeMessage('Order not eligible for discount. Next order is not the nth order.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate discount code');
      setCodeMessage(null);
    } finally {
      setRequestingCode(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      setCheckingOut(true);
      const discountCodeToUse = appliedDiscount?.code || null;
      const result = await checkout(discountCodeToUse || undefined);
      
      alert(`Order placed successfully! Order ID: ${result.order.id}`);
      
      // Reset cart state
      setCartItems([]);
      setAppliedDiscount(null);
      setDiscountCode('');
      setGeneratedCode(null);
      setCodeMessage(null);
      
      // Optionally redirect or show success page
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-medium mb-1">Error</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-500 text-sm">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => {
                if (!item.product) return null;
                
                return (
                  <div
                    key={item.productId}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <h3 className="text-gray-900 font-medium text-sm mb-1 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-1">
                        {formatPrice(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center">
                      <p className="text-gray-900 font-semibold text-base">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Discount Code Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <h2 className="text-gray-900 text-base font-semibold mb-4">Discount Code</h2>
              
              {/* Request Code Button */}
              <div className="mb-4">
                <button
                  onClick={handleRequestDiscountCode}
                  disabled={requestingCode}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-md transition-colors"
                >
                  {requestingCode ? 'Requesting...' : 'Request Discount Code'}
                </button>
              </div>

              {/* Generated Code Display */}
              {generatedCode && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-green-700 font-medium text-xs mb-1">Your Discount Code:</p>
                      <p className="text-gray-900 text-sm font-mono break-all">{generatedCode}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedCode)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Message Display */}
              {codeMessage && (
                <div className={`mb-4 p-3 rounded-md text-xs ${
                  generatedCode 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                }`}>
                  <p>{codeMessage}</p>
                </div>
              )}

              {/* Apply Code Section */}
              {!appliedDiscount ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter discount code"
                    className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={validatingCode || !discountCode.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                  >
                    {validatingCode ? 'Validating...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                  <div>
                    <p className="text-green-700 font-medium text-sm">Code Applied: {appliedDiscount.code}</p>
                    <p className="text-green-600 text-xs">
                      {Math.round(appliedDiscount.percentage * 100)}% discount applied
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveDiscount}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h2 className="text-gray-900 text-base font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({Math.round(appliedDiscount.percentage * 100)}%):</span>
                    <span className="font-medium">-{formatPrice(calculateDiscountAmount())}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 text-base font-semibold">Total:</span>
                  <span className="text-gray-900 text-xl font-bold">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-md transition-colors shadow-sm hover:shadow-md"
              >
                {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
