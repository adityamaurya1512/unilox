import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

/**
 * Reusable Product Card Component
 * Displays product information with image, name, price, and add to cart button
 */
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col h-full hover:-translate-y-1">
      <div className="relative w-full pt-[75%] bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover"
          loading="lazy"
        />
        {product.quantity === 0 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-semibold">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {formatPrice(product.price)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {product.quantity > 0 
            ? `${product.quantity} in stock` 
            : 'Out of stock'}
        </p>
        
        {onAddToCart && (
          <button
            className="mt-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
            onClick={() => onAddToCart(product.id)}
            disabled={product.quantity === 0}
          >
            {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        )}
      </div>
    </div>
  );
}
