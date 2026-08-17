import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  DownloadCloud,
  Key,
  ShieldCheck,
  Zap,
  Star,
  Layers,
  TrendingUp,
  PackageOpen,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useGetCategoriesQuery, useGetStorefrontProductsQuery } from '../../store/services/storefrontApi';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedCategory, addToCart } = useMarketplaceStore();

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: productsData, isLoading: isProductsLoading } = useGetStorefrontProductsQuery({
    is_featured: true,
    per_page: 6,
  });

  const categories = categoriesData?.data || [];
  const featuredProducts = productsData?.data || [];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-radial-[at_50%_0%] from-indigo-950/60 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Multi-Vendor Digital Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Premium Digital Assets,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Built for Modern Makers.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover verified SaaS boilerplates, UI design systems, code scripts, and software license keys from elite independent creators worldwide.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/browse"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/vendor"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              Start Selling Your Assets
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-800/60 max-w-4xl mx-auto text-left">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <DownloadCloud className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-200">Instant Download</span>
              </div>
              <p className="text-[11px] text-slate-400">Secure signed URLs with lifetime access.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Key className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-200">License Key Gen</span>
              </div>
              <p className="text-[11px] text-slate-400">Automated key pool & activation.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-200">Escrow Security</span>
              </div>
              <p className="text-[11px] text-slate-400">Platform held wallet & buyer protection.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-200">Multi-Vendor</span>
              </div>
              <p className="text-[11px] text-slate-400">Independent creator storefronts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Browse by Category</h2>
            <p className="text-xs text-slate-400">Explore curated collections of digital goods</p>
          </div>
          <Link to="/browse" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800" />
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800/60 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  navigate('/browse');
                }}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-left transition group cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-white"
                  style={{ backgroundColor: `${cat.color || '#6366f1'}25`, border: `1px solid ${cat.color || '#6366f1'}50` }}
                >
                  <Layers className="w-5 h-5" style={{ color: cat.color || '#6366f1' }} />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">{cat.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{cat.description || 'Explore digital assets'}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Featured Digital Products</h2>
          </div>
          <Link to="/browse" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden animate-pulse">
                <div className="aspect-video bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-5 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-full" />
                  <div className="pt-4 border-t border-slate-800 flex justify-between">
                    <div className="h-6 bg-slate-800 rounded w-16" />
                    <div className="h-8 bg-slate-800 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <PackageOpen className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No featured products found</h3>
            <p className="text-xs text-slate-400">Check back later or browse our full catalog.</p>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition flex flex-col"
              >
                {/* Product Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-slate-800">
                  {product.thumbnail_url ? (
                    <img
                      src={product.thumbnail_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800/80 text-slate-600">
                      <Layers className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 backdrop-blur text-indigo-300 border border-indigo-500/30">
                      {product.product_type === 'downloadable_file'
                        ? 'Downloadable'
                        : product.product_type === 'license_key'
                        ? 'License Key'
                        : 'Bundle'}
                    </span>
                    {product.version && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 backdrop-blur text-slate-300">
                        v{product.version}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Vendor Store Tag */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="text-slate-400">{product.vendor?.store_name || 'Verified Vendor'}</span>
                      <div className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{(product.rating_avg || 0).toFixed(1)}</span>
                        <span className="text-slate-500 font-normal">({product.rating_count || 0})</span>
                      </div>
                    </div>

                    <Link to={`/products/${product.slug}`} className="block group-hover:text-indigo-400 transition">
                      <h3 className="font-bold text-base text-white line-clamp-1">{product.name}</h3>
                    </Link>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
                      {product.short_description || product.description || 'Premium high-quality digital product.'}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Price</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-white">
                          ${(product.effective_price ?? product.price ?? 0).toFixed(2)}
                        </span>
                        {product.sale_price && (
                          <span className="text-xs text-slate-500 line-through">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(product)}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                      >
                        Add to Cart
                      </button>
                      <Link
                        to={`/products/${product.slug}`}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="View Details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Sell your digital products to thousands of creators</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Keep up to 90% of your earnings. Instant automated deliveries, encrypted key vaults, and automated payouts.
            </p>
          </div>
          <Link
            to="/vendor"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 shadow-lg shadow-indigo-600/30 transition"
          >
            Become a Creator Vendor
          </Link>
        </div>
      </section>
    </div>
  );
};
