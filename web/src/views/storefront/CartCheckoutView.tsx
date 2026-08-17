import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  CreditCard,
  CheckCircle2,
  DownloadCloud,
  Key,
  ArrowRight,
  Lock,
  Copy,
  Check,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import type { Order, OrderItem } from '../../types/marketplace';

export const CartCheckoutView: React.FC = () => {
  const { cart, removeFromCart, clearCart, getCartTotal, checkoutCart } = useMarketplaceStore();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto' | 'wallet'>('card');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const subtotal = getCartTotal();
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim().toUpperCase() === 'DIGI20') {
      setAppliedDiscount(20);
    } else {
      alert('Invalid coupon code. Try "DIGI20" for 20% off!');
    }
  };

  const handleProcessCheckout = () => {
    const order = checkoutCart(paymentMethod);
    setCompletedOrder(order);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // If order is completed, show Order Success & Instant Access view
  if (completedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Payment Verified & Settled</span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Thank you for your purchase!</h1>
            <p className="text-sm text-slate-400 mt-2">
              Order #{completedOrder.order_number} has been processed. Your digital items are now unlocked and ready.
            </p>
          </div>

          {/* Delivered Items List */}
          <div className="text-left pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Your Digital Assets</h3>

            {completedOrder.items?.map((item: OrderItem) => (
              <div key={item.id} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{item.product_name}</h4>
                    <span className="text-xs text-slate-400">Sold by {item.vendor?.store_name}</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-400">${item.price.toFixed(2)}</span>
                </div>

                {/* Download links */}
                {item.downloads && item.downloads.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DownloadCloud className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {item.downloads[0].file?.original_name || 'Downloadable Package'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.downloads[0].max_downloads} downloads remaining
                        </div>
                      </div>
                    </div>

                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Starting secure stream for: ${item.downloads?.[0].download_token}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                    >
                      Download File
                    </a>
                  </div>
                )}

                {/* License Key */}
                {item.license_key && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Your Software License Key</div>
                        <div className="text-xs font-mono font-bold text-amber-300">
                          {item.license_key.license_key}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyKey(item.license_key!.license_key)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1"
                    >
                      {copiedKey === item.license_key.license_key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === item.license_key.license_key ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <Link
              to="/buyer/library"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
            >
              Go to My Digital Library
            </Link>
            <Link
              to="/browse"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Explore our marketplace to discover premium source code, templates, and digital assets.
        </p>
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
        >
          <span>Browse Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Checkout & Instant Delivery</h1>
        <p className="text-xs text-slate-400 mt-1">Review your cart and select payment method</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-sm text-white">Items in Cart ({cart.length})</h2>
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            </div>

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-4"
                >
                  <img
                    src={item.product.thumbnail_url || ''}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-700 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                    <p className="text-xs text-slate-400">By {item.product.vendor?.store_name}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {item.product.product_type}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-white">${item.product.effective_price.toFixed(2)}</div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-xs text-slate-400 hover:text-rose-400 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="font-bold text-sm text-white">Select Payment Method</h2>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                { id: 'paypal', label: 'PayPal Express', icon: Zap },
                { id: 'crypto', label: 'Crypto (USDC / USDT)', icon: Lock },
                { id: 'wallet', label: 'Platform Wallet', icon: ShieldCheck },
              ].map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id as any)}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                    paymentMethod === pm.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/10'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <pm.icon className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-medium">{pm.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <h2 className="font-bold text-sm text-white">Order Summary</h2>

            {/* Coupon input */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs text-slate-400 block">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="e.g. DIGI20"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white uppercase placeholder:normal-case focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-[11px] text-emerald-400 font-semibold">20% discount coupon applied!</p>
              )}
            </form>

            <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="text-slate-200 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Discount (20%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Taxes / Fees:</span>
                <span className="text-emerald-400 font-medium">$0.00 (Included)</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-white pt-3 border-t border-slate-800">
                <span>Total Amount:</span>
                <span className="text-xl text-indigo-400 font-extrabold">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleProcessCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>Complete Payment (${total.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[11px] text-slate-500 space-y-1">
              <p>🔒 256-bit Encrypted Transaction</p>
              <p>Digital files are immediately delivered to your account library.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
