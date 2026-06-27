import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function ProductCarousel({ products, onAdd }) {
  const [failedImageIds, setFailedImageIds] = useState(new Set());

  // Reset tracking state when products change (new search/chat)
  useEffect(() => {
    setFailedImageIds(new Set());
  }, [products]);

  if (!products || products.length === 0) return null;
  
  const validProducts = products.filter(product => product.image && product.image.trim() !== "");

  return (
    <div className="ml-14 -mr-4 md:mr-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-500 overflow-x-auto hide-scrollbar flex gap-4 pr-10 pb-4">
      {validProducts.map((product, index) => {
        if (failedImageIds.has(product.id || index)) return null;

        return (
          <ProductCard 
            key={product.id || index} 
            product={product} 
            onAdd={onAdd}
            onImageError={() => {
              setFailedImageIds(prev => {
                const newSet = new Set(prev);
                newSet.add(product.id || index);
                return newSet;
              });
            }}
          />
        );
      })}
    </div>
  );
}
