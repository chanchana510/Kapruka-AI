import React from 'react';

const getPlaceholder = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('rose') || lowerName.includes('flower') || lowerName.includes('bouquet') || lowerName.includes('orchid')) {
    return { bg: 'from-rose-100 to-orange-50', emoji: '🌸' };
  }
  if (lowerName.includes('cake') || lowerName.includes('chocolate') || lowerName.includes('gateau')) {
    return { bg: 'from-amber-100 to-orange-50', emoji: '🎂' };
  }
  if (lowerName.includes('bear') || lowerName.includes('toy') || lowerName.includes('plush')) {
    return { bg: 'from-blue-100 to-purple-50', emoji: '🧸' };
  }
  if (lowerName.includes('hamper') || lowerName.includes('basket')) {
    return { bg: 'from-green-100 to-emerald-50', emoji: '🧺' };
  }
  return { bg: 'from-slate-100 to-gray-50', emoji: '🛍️' };
};

export default function ProductCard({ product, onAdd, onImageError }) {
  const placeholder = getPlaceholder(product.name);
  return (
    <div className="min-w-[280px] md:min-w-[320px] bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/40 flex flex-col group cursor-pointer hover:shadow-xl transition-all font-sans">
      <div className="relative h-48 w-full">
        {product.image ? (
          <img 
            alt={product.name} 
            className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105" 
            src={product.image} 
            onError={onImageError}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${placeholder.bg} flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 backdrop-blur-sm bg-white/10"></div>
            <span className="text-6xl drop-shadow-md z-10">{placeholder.emoji}</span>
          </div>
        )}
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
