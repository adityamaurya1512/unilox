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
    <div className="bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col h-full hover:-translate-y-1">
      <div className="relative w-full pt-[75%] bg-gray-700 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="p-5 flex flex-col flex-grow gap-3">
        <h3 className="text-lg font-semibold text-white line-clamp-2">
          {product.name}
        </h3>
        <p className="text-2xl font-bold text-blue-400">
          {formatPrice(product.price)}
        </p>
        
        {onAddToCart && (
          <button
            className="mt-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
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
