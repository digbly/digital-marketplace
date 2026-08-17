import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Zap,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  MessageSquarePlus,
  X,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';

export const ProductDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, addToCart, addReview } = useMarketplaceStore();

  const product = products.find((p) => p.slug === slug) || products[0];

  const [activeImage, setActiveImage] = useState(product?.preview_images?.[0] || product?.thumbnail_url || '');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Product not found</h2>
        <Link to="/browse" className="mt-4 inline-block text-sm text-indigo-400 hover:underline">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewComment.trim()) {
      addReview(product.id, reviewRating, reviewComment.trim());
      setIsReviewModalOpen(false);
      setReviewComment('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-slate-200">Marketplace</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-slate-200">Catalog</Link>
        <span>/</span>
        <span className="text-slate-200 truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (2 Cols): Gallery & Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Visual Showcase */}
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video relative">
              <img
                src={activeImage || product.thumbnail_url || ''}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-slate-900/90 backdrop-blur text-indigo-300 border border-indigo-500/30">
                  {product.product_type === 'downloadable_file'
                    ? '📁 Downloadable File'
                    : product.product_type === 'license_key'
                    ? '🔑 License Key'
                    : '📦 Bundle'}
                </span>
                {product.version && (
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 backdrop-blur text-slate-200">
                    v{product.version}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {product.preview_images && product.preview_images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.preview_images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-24 h-16 rounded-xl overflow-hidden border-2 transition flex-shrink-0 ${
                      activeImage === img ? 'border-indigo-500 shadow-md shadow-indigo-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white">Asset Overview & Documentation</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-4">
              {product.description || product.short_description}
            </div>

            {/* Technical Specifications Matrix */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Technical Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs text-slate-400 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-xs font-semibold text-white">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Verified Customer Reviews</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">{product.rating_avg.toFixed(1)} out of 5</span>
                  <span className="text-xs text-slate-400">({product.rating_count} reviews)</span>
                </div>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <MessageSquarePlus className="w-4 h-4 text-indigo-400" />
                <span>Write Review</span>
              </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              {(!product.reviews || product.reviews.length === 0) ? (
                <p className="text-xs text-slate-500 py-4">No reviews yet for this product. Be the first to leave a review!</p>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {rev.buyer?.name?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-200">{rev.buyer?.name || 'Verified Buyer'}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout & Vendor Box */}
        <div className="space-y-6">
          {/* Purchase Action Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 sticky top-24">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Total Sales: {product.total_sales}</span>
                <span className="text-emerald-400 font-medium">In Stock / Instant Delivery</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white">{product.name}</h1>
              <p className="text-xs text-slate-400 mt-2">{product.short_description}</p>
            </div>

            {/* Pricing Details */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Single Commercial License</span>
                <span className="text-3xl font-extrabold text-white">${product.effective_price.toFixed(2)}</span>
                {product.sale_price && (
                  <span className="text-xs text-slate-400 line-through ml-2">${product.price.toFixed(2)}</span>
                )}
              </div>
              {product.sale_price && (
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Save ${(product.price - product.sale_price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
              >
                <span>Buy Now with Instant Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => addToCart(product)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
              >
                Add to Cart
              </button>

              {product.demo_url && (
                <a
                  href={product.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Live Interactive Preview</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Guarantees */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Lifetime updates & access guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Encrypted delivery with anti-tamper signature</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant download link & license key generation</span>
              </div>
            </div>
          </div>

          {/* Creator Profile Box */}
          {product.vendor && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-4">
              <img
                src={product.vendor.logo_url || ''}
                alt={product.vendor.store_name}
                className="w-12 h-12 rounded-2xl object-cover border border-purple-500/30"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-purple-400 uppercase font-bold tracking-wider">Creator Store</div>
                <h4 className="text-sm font-bold text-white truncate">{product.vendor.store_name}</h4>
                <p className="text-xs text-slate-400 truncate">{product.vendor.bio}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Review {product.name}</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-white">
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
                      onClick={() => setReviewRating(star)}
                      className="p-1.5 rounded-lg hover:bg-slate-800"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Feedback & Comments</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  required
                  placeholder="Describe your experience with this asset, quality of code, ease of setup..."
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
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
