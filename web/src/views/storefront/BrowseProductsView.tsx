import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  DownloadCloud,
  Key,
  Layers,
  ArrowUpDown,
  Check,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import type { ProductType } from '../../types/marketplace';

export const BrowseProductsView: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
  } = useMarketplaceStore();

  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [minRating, setMinRating] = useState<number>(0);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (product.status !== 'published') return false;

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(q);
          const matchesDesc = product.short_description?.toLowerCase().includes(q) || false;
          if (!matchesName && !matchesDesc) return false;
        }

        // Category filter
        if (selectedCategory && product.category_id !== selectedCategory) {
          return false;
        }

        // Product type filter
        if (selectedType !== 'all' && product.product_type !== selectedType) {
          return false;
        }

        // Rating filter
        if (minRating > 0 && product.rating_avg < minRating) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.total_sales - a.total_sales;
        if (sortBy === 'rating') return b.rating_avg - a.rating_avg;
        if (sortBy === 'price_asc') return a.effective_price - b.effective_price;
        if (sortBy === 'price_desc') return b.effective_price - a.effective_price;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, searchQuery, selectedCategory, selectedType, minRating, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Browse Digital Marketplace</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore {filteredProducts.length} verified digital assets ready for instant download
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-white">Newest First</option>
              <option value="popular" className="bg-slate-900 text-white">Most Popular</option>
              <option value="rating" className="bg-slate-900 text-white">Highest Rated</option>
              <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="space-y-6">
          {/* Search Filter Input */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Search Assets</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keywords..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Product Type Filter */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Asset Format</h3>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Formats', icon: Layers },
                { id: 'downloadable_file', label: 'Downloadable Files', icon: DownloadCloud },
                { id: 'license_key', label: 'Software Licenses', icon: Key },
                { id: 'bundle', label: 'Bundles & Suites', icon: ShoppingBag },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedType(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    selectedType === item.id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  {selectedType === item.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Categories</h3>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Minimum Rating</h3>
            <div className="space-y-1">
              {[
                { rating: 0, label: 'All Ratings' },
                { rating: 4.5, label: '4.5 & up' },
                { rating: 4.0, label: '4.0 & up' },
              ].map((r) => (
                <button
                  key={r.rating}
                  onClick={() => setMinRating(r.rating)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    minRating === r.rating
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Star className={`w-3.5 h-3.5 ${r.rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                    <span>{r.label}</span>
                  </div>
                  {minRating === r.rating && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Products Catalog Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Filter className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No matching digital products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search query, clearing category filters, or selecting all formats.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedType('all');
                  setSearchQuery('');
                  setMinRating(0);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-slate-800">
                      <img
                        src={product.thumbnail_url || ''}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 backdrop-blur text-indigo-300 border border-indigo-500/30">
                          {product.product_type === 'downloadable_file'
                            ? 'File'
                            : product.product_type === 'license_key'
                            ? 'Key'
                            : 'Bundle'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="text-slate-400 truncate max-w-[140px]">{product.vendor?.store_name}</span>
                        <div className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{product.rating_avg.toFixed(1)}</span>
                        </div>
                      </div>

                      <Link to={`/products/${product.slug}`} className="block group-hover:text-indigo-400 transition">
                        <h3 className="font-bold text-sm text-white line-clamp-1">{product.name}</h3>
                      </Link>

                      <p className="text-xs text-slate-400 line-clamp-2">{product.short_description}</p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-white">${product.effective_price.toFixed(2)}</span>
                        {product.sale_price && (
                          <span className="text-[11px] text-slate-500 line-through">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => addToCart(product)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                      >
                        Add to Cart
                      </button>
                      <Link
                        to={`/products/${product.slug}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
