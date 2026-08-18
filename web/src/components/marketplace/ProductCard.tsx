import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Layers, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import type { Product } from '../../types/marketplace';

export interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { t } = useTranslation();
  const { addToCart } = useMarketplaceStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'downloadable_file':
        return t('storefront.instantDownload');
      case 'license_key':
        return 'License Key';
      case 'bundle':
        return 'Bundle';
      default:
        return 'Digital';
    }
  };

  return (
    <div className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/20 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Product Thumbnail */}
        <Link to={`/products/${product.slug}`} className="block relative aspect-video overflow-hidden bg-slate-800/80">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800/60 text-slate-600">
              <Layers className="w-9 h-9 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
          )}

          {/* Type & Version Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap pointer-events-none">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur text-indigo-300 border border-indigo-500/30 shadow-sm">
              {getProductTypeLabel(product.product_type)}
            </span>
            {product.version && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-950/70 backdrop-blur text-slate-300 border border-slate-700/50">
                v{product.version}
              </span>
            )}
          </div>

          {/* Featured / Discount Badge */}
          {product.sale_price && (
            <div className="absolute top-2.5 right-2.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/90 text-white shadow-sm">
                Sale
              </span>
            </div>
          )}
        </Link>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Vendor & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="text-slate-400 font-medium truncate max-w-[130px]" title={product.vendor?.store_name || 'Verified Vendor'}>
              {product.vendor?.store_name || 'Verified Vendor'}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{(product.rating_avg || 0).toFixed(1)}</span>
              {product.rating_count ? (
                <span className="text-[11px] text-slate-500 font-normal">({product.rating_count})</span>
              ) : null}
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.slug}`} className="block group-hover:text-indigo-400 transition-colors">
            <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 leading-snug" title={product.name}>
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          {!compact && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
              {product.short_description || product.description || 'Premium high-quality digital product.'}
            </p>
          )}
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="p-4 sm:p-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 bg-slate-950/20">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">{t('common.price')}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-extrabold text-white">
              ${(product.effective_price ?? product.price ?? 0).toFixed(2)}
            </span>
            {product.sale_price && (
              <span className="text-xs text-slate-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAddToCart}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:scale-[1.02]'
            }`}
            title={t('storefront.addToCart')}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>✓</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{t('storefront.addToCart')}</span>
              </>
            )}
          </button>
          <Link
            to={`/products/${product.slug}`}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={t('common.view')}
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
