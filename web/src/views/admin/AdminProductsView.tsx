import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Check,
  XCircle,
} from 'lucide-react';
import {
  useGetAdminProductsQuery,
  useModerateProductMutation,
} from '../../store/services/adminApi';
import { getErrorMessage } from '../../utils/apiError';
import type { Product } from '../../types/marketplace';

export const AdminProductsView: React.FC = () => {
  const { data: productsRes, isLoading, isFetching, error, refetch } = useGetAdminProductsQuery();
  const [moderateProduct, { isLoading: isModerating }] = useModerateProductMutation();

  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const products = productsRes?.data || [];

  const handleModerate = async (
    product: Product,
    newStatus: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived',
    isFeatured?: boolean
  ) => {
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
    try {
      await moderateProduct({
        id: product.id,
        status: newStatus,
        is_featured: isFeatured !== undefined ? isFeatured : product.is_featured,
      }).unwrap();

      setActionSuccessMessage(`Updated product "${product.name}" status.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setActionErrorMessage(getErrorMessage(err, 'Failed to moderate product.'));
      setTimeout(() => setActionErrorMessage(null), 4000);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    await handleModerate(product, product.status, !product.is_featured);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Product Moderation Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review all listed digital goods across vendors, moderate status & featured items
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {actionErrorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionErrorMessage}</span>
        </div>
      )}

      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
            <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading catalog items...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-bold text-white">Could not fetch product catalog</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No products found across any vendor catalog.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Product Title</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {products.map((product) => {
                  const effectivePrice = product.sale_price !== null && product.sale_price !== undefined && product.sale_price > 0
                    ? Number(product.sale_price)
                    : Number(product.price || 0);

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.thumbnail_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block text-sm">{product.name}</span>
                            <span className="text-[11px] text-slate-400 capitalize">
                              {product.product_type ? product.product_type.replace('_', ' ') : 'Digital Product'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-300">
                        {product.vendor?.store_name || 'Independent Creator'}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-white text-sm">${effectivePrice.toFixed(2)}</span>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          disabled={isModerating}
                          onClick={() => handleToggleFeatured(product)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 ${
                            product.is_featured
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{product.is_featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            product.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : product.status === 'pending_review'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.status !== 'published' ? (
                            <button
                              disabled={isModerating}
                              onClick={() => handleModerate(product, 'published')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Publish</span>
                            </button>
                          ) : (
                            <button
                              disabled={isModerating}
                              onClick={() => handleModerate(product, 'rejected')}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
