import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  isAdding?: boolean;
}

/**
 * Reusable Product Card Component
 * Displays product information with image, name, price, and add to cart button
 */
export function ProductCard({ product, onAddToCart, isAdding = false }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-700/50 hover:border-gray-600">
      <div className="relative w-full pt-[75%] bg-gray-900 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow gap-2.5">
        <h3 className="text-base font-medium text-white line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <p className="text-xl font-semibold text-blue-400 mt-1">
          {formatPrice(product.price)}
        </p>
        
        {onAddToCart && (
          <button
            className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95"
            onClick={() => onAddToCart(product.id)}
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
