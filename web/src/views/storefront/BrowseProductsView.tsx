import React, { useState } from 'react';
import {
  Search,
  Star,
  DownloadCloud,
  Key,
  Layers,
  ArrowUpDown,
  Check,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import {
  useGetCategoriesQuery,
  useGetStorefrontProductsQuery,
} from '../../store/services/storefrontApi';
import { ProductCard } from '../../components/marketplace/ProductCard';
import type { ProductType } from '../../types/marketplace';

export const BrowseProductsView: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useMarketplaceStore();

  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [minRating, setMinRating] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const { data: productsData, isLoading: isProductsLoading } = useGetStorefrontProductsQuery({
    search: searchQuery.trim() || undefined,
    category_id: selectedCategory || undefined,
    product_type: selectedType !== 'all' ? selectedType : undefined,
    sort_by: sortBy,
    page,
    per_page: 12,
  });

  const rawProducts = productsData?.data || [];
  const meta = productsData?.meta;

  // Filter client-side for rating if specified
  const filteredProducts = minRating > 0
    ? rawProducts.filter((p) => (p.rating_avg || 0) >= minRating)
    : rawProducts;

  const totalPages = meta?.last_page || 1;

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedType('all');
    setSearchQuery('');
    setMinRating(0);
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Browse Digital Marketplace</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore {meta?.total ?? filteredProducts.length} verified digital assets ready for instant download
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
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
                  onClick={() => {
                    setSelectedType(item.id as any);
                    setPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
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
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                  className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                    setPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
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
        <div className="lg:col-span-3 space-y-6">
          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-slate-800" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-3.5 bg-slate-800 rounded w-1/3" />
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/60 rounded w-full" />
                    <div className="pt-3 border-t border-slate-800 flex justify-between">
                      <div className="h-5 bg-slate-800 rounded w-16" />
                      <div className="h-7 bg-slate-800 rounded w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
              <PackageOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No matching digital products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search query, clearing category filters, or selecting all formats.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-800">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
