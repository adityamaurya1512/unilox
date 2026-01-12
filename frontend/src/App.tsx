import { useState, useEffect } from 'react';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { fetchProducts, addToCart } from './api';
import type { Product } from './types';

type Page = 'products' | 'cart';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);
      await addToCart(productId, 1);
      // Show success message or update UI
      alert('Item added to cart!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  if (currentPage === 'cart') {
    return (
      <>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Uniblox Store</h1>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentPage('products')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Products
              </button>
              <button
                onClick={() => setCurrentPage('cart')}
                className="text-blue-600 font-semibold"
              >
                Cart
              </button>
            </div>
          </div>
        </nav>
        <Cart />
      </>
    );
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Uniblox Store</h1>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentPage('products')}
              className="text-blue-600 font-semibold"
            >
              Products
            </button>
            <button
              onClick={() => setCurrentPage('cart')}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Cart
            </button>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">
            Products
          </h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-600">
                Loading products...
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
              <p className="text-sm mt-2">
                Make sure the backend server is running on http://localhost:3000
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">
                    No products available
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      isAdding={addingToCart === product.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
