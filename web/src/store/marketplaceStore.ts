import { create } from 'zustand';
import type { CartItem, Category, Order, OrderItem, PayoutRequest, Product, User, UserRole, Vendor, VendorWallet } from '../types/marketplace';
import {
  mockAdminUser,
  mockCategories,
  mockCurrentUser,
  mockPayoutRequests,
  mockProducts,
  mockPurchasedItems,
  mockVendors,
  mockVendorUser,
  mockVendorWallet,
} from '../data/digitalMarketplaceData';

interface MarketplaceState {
  currentUser: User;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;

  // Catalog
  categories: Category[];
  products: Product[];
  vendors: Vendor[];
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Cart & Checkout
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  checkoutCart: (paymentMethod: string) => Order;

  // Buyer Library
  libraryItems: OrderItem[];
  addReview: (productId: string, rating: number, comment: string) => void;

  // Vendor Portal State
  vendorWallet: VendorWallet;
  vendorProducts: Product[];
  addVendorProduct: (productData: Partial<Product>) => Product;
  updateVendorProduct: (productId: string, productData: Partial<Product>) => void;
  deleteVendorProduct: (productId: string) => void;
  requestPayout: (amount: number, method: string, details: Record<string, any>) => void;

  // Admin Portal State
  payoutRequests: PayoutRequest[];
  updatePayoutStatus: (payoutId: string, status: 'approved' | 'rejected' | 'processed', note?: string) => void;
  updateVendorStatus: (vendorId: string, status: 'approved' | 'rejected' | 'suspended', commission?: number) => void;
  moderateProduct: (productId: string, status: Product['status'], isFeatured?: boolean) => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  currentUser: mockCurrentUser,
  activeRole: 'customer',
  switchRole: (role: UserRole) => {
    let user = mockCurrentUser;
    if (role === 'vendor') user = mockVendorUser;
    if (role === 'admin') user = mockAdminUser;
    set({ activeRole: role, currentUser: user });
  },

  categories: mockCategories,
  products: mockProducts,
  vendors: mockVendors,
  selectedCategory: null,
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  cart: [],
  addToCart: (product: Product) => {
    const { cart } = get();
    if (!cart.some((item) => item.product.id === product.id)) {
      set({ cart: [...cart, { product }] });
    }
  },
  removeFromCart: (productId: string) => {
    set({ cart: get().cart.filter((item) => item.product.id !== productId) });
  },
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.product.effective_price, 0);
  },

  checkoutCart: (paymentMethod: string) => {
    const { cart, currentUser, libraryItems, products } = get();
    const subtotal = get().getCartTotal();
    const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const newOrderItems: OrderItem[] = cart.map((item, index) => {
      const p = item.product;

      const orderItem: OrderItem = {
        id: `item-order-${Date.now()}-${index}`,
        order_id: `ord-${Date.now()}`,
        product_id: p.id,
        vendor_id: p.vendor_id,
        product_name: p.name,
        product_type: p.product_type,
        price: p.effective_price,
        status: 'completed',
        product: p,
        vendor: p.vendor,
        downloads: p.files?.map((f) => ({
          id: `dl-${Date.now()}-${f.id}`,
          order_item_id: `item-order-${Date.now()}-${index}`,
          product_file_id: f.id,
          download_token: `token-${Math.random().toString(36).substring(2, 12)}`,
          download_url: '#',
          download_count: 0,
          max_downloads: p.download_limit ?? 10,
          expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          is_expired: false,
          file: f,
        })),
        license_key: p.product_type === 'license_key' || p.product_type === 'bundle' ? {
          id: `lic-${Date.now()}`,
          product_id: p.id,
          license_key: 'KEY-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          status: 'assigned',
          max_activations: 2,
          activation_count: 0,
          assigned_at: new Date().toISOString(),
        } : undefined,
      };

      return orderItem;
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      buyer_id: currentUser.id,
      subtotal_amount: subtotal,
      discount_amount: 0,
      total_amount: subtotal,
      payment_method: paymentMethod,
      payment_status: 'paid',
      transaction_id: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      items: newOrderItems,
    };

    // Update state
    set({
      cart: [],
      libraryItems: [...newOrderItems, ...libraryItems],
      products: products.map((p) => {
        if (cart.some((c) => c.product.id === p.id)) {
          return { ...p, total_sales: p.total_sales + 1 };
        }
        return p;
      }),
    });

    return newOrder;
  },

  libraryItems: mockPurchasedItems,
  addReview: (productId: string, rating: number, comment: string) => {
    const { products, currentUser } = get();
    set({
      products: products.map((p) => {
        if (p.id === productId) {
          const newReviews = [
            ...(p.reviews || []),
            {
              id: `rev-${Date.now()}`,
              product_id: productId,
              buyer_id: currentUser.id,
              rating,
              comment,
              created_at: new Date().toISOString(),
              buyer: currentUser,
            },
          ];
          const avg = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
          return {
            ...p,
            reviews: newReviews,
            rating_avg: Math.round(avg * 10) / 10,
            rating_count: newReviews.length,
          };
        }
        return p;
      }),
    });
  },

  vendorWallet: mockVendorWallet,
  vendorProducts: mockProducts.filter((p) => p.vendor_id === 'vnd-1'),
  addVendorProduct: (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      vendor_id: 'vnd-1',
      slug: (productData.name || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: productData.name || 'Untitled Digital Product',
      short_description: productData.short_description || '',
      description: productData.description || '',
      price: productData.price || 29.00,
      sale_price: productData.sale_price,
      effective_price: productData.sale_price ?? productData.price ?? 29.00,
      product_type: productData.product_type || 'downloadable_file',
      status: 'published',
      thumbnail_url: productData.thumbnail_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
      preview_images: productData.preview_images || ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200'],
      version: productData.version || '1.0.0',
      total_sales: 0,
      rating_avg: 5.0,
      rating_count: 0,
      is_featured: false,
      created_at: new Date().toISOString(),
      vendor: mockVendors[0],
      files: productData.files || [],
    };

    set((state) => ({
      products: [newProduct, ...state.products],
      vendorProducts: [newProduct, ...state.vendorProducts],
    }));

    return newProduct;
  },
  updateVendorProduct: (productId: string, productData: Partial<Product>) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === productId ? { ...p, ...productData } : p)),
      vendorProducts: state.vendorProducts.map((p) => (p.id === productId ? { ...p, ...productData } : p)),
    }));
  },
  deleteVendorProduct: (productId: string) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
      vendorProducts: state.vendorProducts.filter((p) => p.id !== productId),
    }));
  },
  requestPayout: (amount: number, method: string, details: Record<string, any>) => {
    const { vendorWallet, payoutRequests } = get();
    if (vendorWallet.balance < amount) return;

    const newPayout: PayoutRequest = {
      id: `pay-${Date.now()}`,
      vendor_id: 'vnd-1',
      amount,
      payout_method: method,
      payout_account_details: details,
      status: 'pending',
      created_at: new Date().toISOString(),
      vendor: mockVendors[0],
    };

    const newTxn = {
      id: `txn-${Date.now()}`,
      wallet_id: vendorWallet.id,
      type: 'payout',
      amount: -amount,
      balance_before: vendorWallet.balance,
      balance_after: vendorWallet.balance - amount,
      description: `Payout Request #${newPayout.id}`,
      created_at: new Date().toISOString(),
    };

    set({
      payoutRequests: [newPayout, ...payoutRequests],
      vendorWallet: {
        ...vendorWallet,
        balance: vendorWallet.balance - amount,
        transactions: [newTxn, ...(vendorWallet.transactions || [])],
      },
    });
  },

  payoutRequests: mockPayoutRequests,
  updatePayoutStatus: (payoutId: string, status: 'approved' | 'rejected' | 'processed', note?: string) => {
    set((state) => ({
      payoutRequests: state.payoutRequests.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status,
              admin_note: note,
              processed_at: status === 'processed' ? new Date().toISOString() : p.processed_at,
            }
          : p
      ),
    }));
  },
  updateVendorStatus: (vendorId: string, status: 'approved' | 'rejected' | 'suspended', commission?: number) => {
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === vendorId
          ? { ...v, status, commission_rate: commission !== undefined ? commission : v.commission_rate }
          : v
      ),
    }));
  },
  moderateProduct: (productId: string, status: Product['status'], isFeatured?: boolean) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, status, is_featured: isFeatured !== undefined ? isFeatured : p.is_featured }
          : p
      ),
    }));
  },
}));
