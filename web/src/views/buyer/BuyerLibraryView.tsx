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
  Loader2,
  PackageOpen,
  Layers,
  AlertCircle,
} from 'lucide-react';
import {
  useGetBuyerLibraryQuery,
  useCreateReviewMutation,
} from '../../store/services/buyerApi';

export const BuyerLibraryView: React.FC = () => {
  const { data: libraryResponse, isLoading, isError, refetch } = useGetBuyerLibraryQuery();
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  const libraryItems = libraryResponse?.data || [];

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [reviewModalItem, setReviewModalItem] = useState<{ productId: string; orderItemId: string; productName: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalItem || !comment.trim()) return;

    setReviewError(null);
    try {
      await createReview({
        product_id: reviewModalItem.productId,
        order_item_id: reviewModalItem.orderItemId,
        rating,
        comment: comment.trim(),
      }).unwrap();

      setReviewSuccess('Review submitted successfully!');
      setTimeout(() => {
        setReviewSuccess(null);
        setReviewModalItem(null);
        setComment('');
      }, 1500);
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || 'Failed to submit review. Please try again.';
      setReviewError(errorMsg);
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-1/3" />
                  <div className="h-5 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-slate-800 rounded-xl" />
              <div className="h-16 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-20 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Failed to load your digital library</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Please make sure you are logged in and your session is active.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : libraryItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
          <PackageOpen className="w-10 h-10 text-slate-500 mx-auto" />
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
                  {item.product?.thumbnail_url ? (
                    <img
                      src={item.product.thumbnail_url}
                      alt={item.product_name}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                      <Layers className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {item.product_type}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 truncate">{item.product_name}</h3>
                    <p className="text-xs text-slate-400">Vendor: {item.vendor?.store_name || 'Creator'}</p>
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
                              {dl.file?.original_name || 'Asset Package'}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>v{dl.file?.version || '1.0.0'}</span>
                              <span>•</span>
                              <span>{dl.max_downloads ? `${dl.max_downloads - dl.download_count} downloads left` : 'Unlimited'}</span>
                            </p>
                          </div>
                        </div>

                        <a
                          href={`/api/v1/buyer/download/${dl.download_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold shadow transition flex-shrink-0"
                        >
                          Download
                        </a>
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
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
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
                {item.product?.slug ? (
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>View Product</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-xs text-slate-500">Asset purchased</span>
                )}

                <button
                  onClick={() =>
                    setReviewModalItem({
                      productId: item.product_id,
                      orderItemId: item.id,
                      productName: item.product_name,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
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
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Review {reviewModalItem.productName}</h3>
              <button
                onClick={() => {
                  setReviewModalItem(null);
                  setReviewError(null);
                  setReviewSuccess(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
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
                  onClick={() => {
                    setReviewModalItem(null);
                    setReviewError(null);
                    setReviewSuccess(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
