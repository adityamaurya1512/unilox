import { useState, useEffect } from 'react';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { Admin } from './components/Admin';
import { fetchProducts, addToCart } from './api';
import type { Product } from './types';

type Page = 'products' | 'cart' | 'admin';

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
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center max-w-7xl">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Uniblox</h1>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage('products')}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Products
              </button>
              <button
                onClick={() => setCurrentPage('cart')}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-blue-600 bg-blue-50"
              >
                Cart
              </button>
              <button
                onClick={() => setCurrentPage('admin')}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Admin
              </button>
            </div>
          </div>
        </nav>
        <Cart />
      </>
    );
  }

  if (currentPage === 'admin') {
    return (
      <>
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center max-w-7xl">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Uniblox</h1>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage('products')}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Products
              </button>
              <button
                onClick={() => setCurrentPage('cart')}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Cart
              </button>
              <button
                onClick={() => setCurrentPage('admin')}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-blue-600 bg-blue-50"
              >
                Admin
              </button>
            </div>
          </div>
        </nav>
        <Admin />
      </>
    );
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center max-w-7xl">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Uniblox</h1>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage('products')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                currentPage === 'products'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setCurrentPage('cart')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                currentPage === 'cart'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Cart
            </button>
            <button
              onClick={() => setCurrentPage('admin')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                currentPage === 'admin'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Products</h2>
            <p className="text-gray-500 text-sm">Browse our collection</p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-sm text-gray-500">Loading products...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              <p className="font-medium mb-1">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm text-gray-500">No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
