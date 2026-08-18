import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  Clock,
  PackageOpen,
  LayoutGrid,
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-slate-800/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            {icon}
            <span>{tagline}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{description}</p>
        </div>
        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group self-start sm:self-auto"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <PackageOpen className="w-9 h-9 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">{emptyTitle}</h3>
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
  const { t } = useTranslation();
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
    <div className="space-y-12 pb-12">
      {/* Compact Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-radial-[at_50%_0%] from-indigo-950/50 via-slate-950 to-slate-950">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('nav.tagline')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {t('storefront.heroTitle')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            {t('storefront.heroSubtitle')}
          </p>

          {/* Compact Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/browse"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <span>{t('nav.browseAssets')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/vendor"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition"
            >
              {t('nav.vendorPortal')}
            </Link>
          </div>
        </div>
      </section>

      {/* Horizontal Category Pill Chips Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory(null);
              navigate('/browse');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition shrink-0 cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('common.all')} {t('nav.categories')}</span>
          </button>

          {isCategoriesLoading ? (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-7 w-24 rounded-full bg-slate-800 animate-pulse shrink-0" />
              ))}
            </div>
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  navigate('/browse');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color || '#6366f1' }}
                />
                <span>{cat.name}</span>
              </button>
            ))
          )}

          <Link
            to="/browse"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 ml-auto shrink-0 hidden sm:flex items-center gap-1 pl-2"
          >
            <span>View catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* SECTION 1: Featured & Trending Products (Now Immediately Above the Fold!) */}
      <ProductSection
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        tagline={t('nav.trending')}
        title={t('storefront.featuredProducts')}
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
        tagline={t('storefront.sortNewest')}
        title={t('storefront.recentlyAdded')}
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
        tagline={t('storefront.sortPopular')}
        title="Community Favorites & Top Rated"
        description="The most downloaded and highest-rated assets loved by developers and designers."
        viewAllLink="/browse?sort_by=popular"
        products={popularProducts}
        isLoading={isPopularLoading}
        emptyTitle="No top rated products yet"
        emptySubtitle="Browse our full marketplace to leave the first review!"
      />

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Sell your digital products to thousands of creators</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Keep up to 90% of your earnings. Instant automated deliveries, encrypted key vaults, and automated payouts.
            </p>
          </div>
          <Link
            to="/vendor"
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shrink-0 shadow-lg shadow-indigo-600/30 transition"
          >
            Become a Creator Vendor
          </Link>
        </div>
      </section>
    </div>
  );
};
