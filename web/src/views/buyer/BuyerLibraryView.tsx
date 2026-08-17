import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DownloadCloud,
  Key,
  Copy,
  Check,
  Star,
  ExternalLink,
  X,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';

export const BuyerLibraryView: React.FC = () => {
  const { libraryItems, addReview } = useMarketplaceStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [reviewModalProduct, setReviewModalProduct] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (fileName: string) => {
    alert(`Downloading ${fileName} from secure storage...`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewModalProduct && comment.trim()) {
      addReview(reviewModalProduct, rating, comment.trim());
      setReviewModalProduct(null);
      setComment('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Digital Library</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access your purchased downloads, software license keys, and version updates
          </p>
        </div>

        <Link
          to="/browse"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <span>Browse More Assets</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {libraryItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
          <DownloadCloud className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">Your library is currently empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not purchased any digital assets yet. Browse our marketplace to get started.
          </p>
          <Link
            to="/browse"
            className="inline-block mt-3 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryItems.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between p-6 space-y-6"
            >
              {/* Product Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <img
                    src={item.product?.thumbnail_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300'}
                    alt={item.product_name}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {item.product_type}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 truncate">{item.product_name}</h3>
                    <p className="text-xs text-slate-400">Vendor: {item.vendor?.store_name}</p>
                  </div>
                </div>

                {/* Downloads section */}
                {item.downloads && item.downloads.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                      Secure Files:
                    </div>
                    {item.downloads.map((dl) => (
                      <div
                        key={dl.id}
                        className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <DownloadCloud className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {dl.file?.original_name || 'asset_package.zip'}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>v{dl.file?.version || '1.0.0'}</span>
                              <span>•</span>
                              <span>{dl.max_downloads ? `${dl.max_downloads - dl.download_count} left` : 'Unlimited'}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownload(dl.file?.original_name || 'file.zip')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold shadow transition flex-shrink-0"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* License Keys section */}
                {item.license_key && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                      Software License Key:
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Key className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-mono font-bold text-amber-300 truncate">
                            {item.license_key.license_key}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {item.license_key.max_activations} workstation activations
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyKey(item.license_key!.license_key)}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium flex items-center gap-1"
                        title="Copy Key"
                      >
                        {copiedKey === item.license_key.license_key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === item.license_key.license_key ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to={`/products/${item.product?.slug || ''}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>View Product</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => setReviewModalProduct(item.product_id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Leave Review</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Rate & Review Product</h3>
              <button onClick={() => setReviewModalProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1.5 rounded-lg hover:bg-slate-800"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required
                  placeholder="Tell other creators about code quality, setup experience, and documentation..."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
