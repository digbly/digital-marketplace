import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  DownloadCloud,
  Key,
  ShieldCheck,
  Zap,
  TrendingUp,
  Flame,
  Clock,
  Layers,
  PackageOpen,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import {
  useGetCategoriesQuery,
  useGetStorefrontProductsQuery,
} from '../../store/services/storefrontApi';
import { ProductCard } from '../../components/marketplace/ProductCard';
import type { Product } from '../../types/marketplace';

interface ProductSectionProps {
  icon: React.ReactNode;
  tagline: string;
  title: string;
  description: string;
  viewAllLink: string;
  products: Product[];
  isLoading: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  icon,
  tagline,
  title,
  description,
  viewAllLink,
  products,
  isLoading,
  emptyTitle = 'No products found',
  emptySubtitle = 'Check back soon for new digital assets in this section.',
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            {icon}
            <span>{tagline}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{description}</p>
        </div>
        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group self-start sm:self-auto"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden animate-pulse">
              <div className="aspect-video bg-slate-800" />
              <div className="p-4 space-y-3">
                <div className="h-3.5 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800/60 rounded w-full" />
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <div className="h-5 bg-slate-800 rounded w-14" />
                  <div className="h-7 bg-slate-800 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <PackageOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm sm:text-base font-bold text-white">{emptyTitle}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{emptySubtitle}</p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <span>Explore Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedCategory } = useMarketplaceStore();

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery();

  // 1. Featured & Trending Query (8 items)
  const { data: featuredData, isLoading: isFeaturedLoading } = useGetStorefrontProductsQuery({
    is_featured: true,
    per_page: 8,
  });

  // 2. Newest / Fresh Releases Query (8 items)
  const { data: newestData, isLoading: isNewestLoading } = useGetStorefrontProductsQuery({
    sort_by: 'newest',
    per_page: 8,
  });

  // 3. Most Popular / Best Sellers Query (8 items)
  const { data: popularData, isLoading: isPopularLoading } = useGetStorefrontProductsQuery({
    sort_by: 'popular',
    per_page: 8,
  });

  const categories = categoriesData?.data || [];
  const featuredProducts = featuredData?.data || [];
  const newestProducts = newestData?.data || [];
  const popularProducts = popularData?.data || [];

  return (
    <div className="space-y-20 pb-12">
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

      {/* SECTION 1: Featured & Trending Products */}
      <ProductSection
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        tagline="Trending Now"
        title="Featured Digital Assets"
        description="Hand-picked and verified premium digital products from top makers."
        viewAllLink="/browse"
        products={featuredProducts}
        isLoading={isFeaturedLoading}
        emptyTitle="No featured products found"
        emptySubtitle="Check out our full catalog to discover all digital assets."
      />

      {/* SECTION 2: New Arrivals / Fresh Releases */}
      <ProductSection
        icon={<Clock className="w-3.5 h-3.5" />}
        tagline="Fresh Releases"
        title="Newly Added Products"
        description="The latest digital creations, scripts, templates, and boilerplates published this week."
        viewAllLink="/browse?sort_by=newest"
        products={newestProducts}
        isLoading={isNewestLoading}
        emptyTitle="No new releases yet"
        emptySubtitle="Creators are continuously uploading new products. Check back soon!"
      />

      {/* SECTION 3: Best Sellers & Top Rated */}
      <ProductSection
        icon={<Flame className="w-3.5 h-3.5 text-amber-400" />}
        tagline="Best Sellers"
        title="Community Favorites & Top Rated"
        description="The most downloaded and highest-rated assets loved by developers and designers."
        viewAllLink="/browse?sort_by=popular"
        products={popularProducts}
        isLoading={isPopularLoading}
        emptyTitle="No top rated products yet"
        emptySubtitle="Browse our full marketplace to leave the first review!"
      />

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Sell your digital products to thousands of creators</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Keep up to 90% of your earnings. Instant automated deliveries, encrypted key vaults, and automated payouts.
            </p>
          </div>
          <Link
            to="/vendor"
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shrink-0 shadow-lg shadow-indigo-600/30 transition"
          >
            Become a Creator Vendor
          </Link>
        </div>
      </section>
    </div>
  );
};
