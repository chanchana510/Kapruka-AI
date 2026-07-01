import React, { useState } from 'react';

const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return false;
  return true;
};

export default function ProductCard({ product, onAdd, onImageError }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!product || !isValidImageUrl(product.image) || imgFailed) {
    return null;
  }

  return (
    <div className="min-w-[280px] md:min-w-[320px] bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/40 flex flex-col group cursor-pointer hover:shadow-xl transition-all font-sans">
      <div className="relative h-48 w-full bg-gray-100">
        <img 
          alt={product.name || 'Product'} 
          className="w-full h-full object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105" 
          src={product.image} 
          onError={(e) => {
            setImgFailed(true);
            if (onImageError) onImageError(e);
          }}
        />
        <button 
          onClick={(e) => { e.stopPropagation(); onAdd(product, e); }}
          className="absolute bottom-3 right-3 w-10 h-10 bg-deep-purple/90 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform border border-white/20 cursor-pointer"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1 justify-between">
        <div>
          <h3 className="text-lg text-on-surface font-bold leading-tight">
            {product.link ? (
              <a href={product.link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                {product.name}
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">open_in_new</span>
              </a>
            ) : (
              product.name
            )}
          </h3>
          <p className="text-deep-purple font-bold text-xl mt-1">{product.price} LKR</p>
          <p className="text-on-surface-variant text-sm line-clamp-2 mt-1">{product.description}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onAdd(product, e); }}
          className="mt-3 w-full py-2 bg-deep-purple hover:opacity-90 text-white rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <span>Add to Cart 🛒</span>
        </button>
      </div>
    </div>
  );
}
