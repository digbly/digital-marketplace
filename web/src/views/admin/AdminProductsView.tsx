import React from 'react';
import { Sparkles } from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';

export const AdminProductsView: React.FC = () => {
  const { products, moderateProduct } = useMarketplaceStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Product Moderation Queue</h1>
        <p className="text-xs text-slate-400 mt-1">Review all listed digital goods across vendors, moderate status & featured items</p>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
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
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-800/50 transition">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img src={product.thumbnail_url || ''} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <span className="font-bold text-white block text-sm">{product.name}</span>
                      <span className="text-[11px] text-slate-400 capitalize">{product.product_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 font-semibold text-slate-300">
                  {product.vendor?.store_name || 'Independent Creator'}
                </td>

                <td className="py-4 px-4">
                  <span className="font-bold text-white text-sm">${product.effective_price.toFixed(2)}</span>
                </td>

                <td className="py-4 px-4">
                  <button
                    onClick={() => moderateProduct(product.id, product.status, !product.is_featured)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      product.is_featured
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{product.is_featured ? 'Featured' : 'Standard'}</span>
                  </button>
                </td>

                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {product.status}
                  </span>
                </td>

                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {product.status !== 'published' ? (
                      <button
                        onClick={() => moderateProduct(product.id, 'published')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => moderateProduct(product.id, 'rejected')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
