import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return false;
  return true;
};

export default function ProductCarousel({ products, onAdd }) {
  const [failedImageIds, setFailedImageIds] = useState(new Set());

  // Reset tracking state when products change (new search/chat)
  useEffect(() => {
    setFailedImageIds(new Set());
  }, [products]);

  if (!products || !Array.isArray(products) || products.length === 0) return null;

  const validProducts = products.filter((product) => {
    return product && (product.name || product.link);
  });

  if (validProducts.length === 0) return null;

  return (
    <div className="ml-14 -mr-4 md:mr-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-500 overflow-x-auto hide-scrollbar flex gap-4 pr-10 pb-4">
      {validProducts.map((product, index) => {
        return (
          <ProductCard 
            key={product.id || index} 
            product={product} 
            onAdd={onAdd}
            onImageError={() => {
              setFailedImageIds(prev => {
                const newSet = new Set(prev);
                newSet.add(product.id || products.indexOf(product));
                return newSet;
              });
            }}
          />
        );
      })}
    </div>
  );
}
