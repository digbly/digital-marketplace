export type UserRole = 'admin' | 'vendor' | 'customer';

export type ProductType = 'downloadable_file' | 'license_key' | 'bundle';
export type ProductStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  avatar?: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  store_name: string;
  slug: string;
  bio?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  commission_rate?: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  user?: User;
}

export interface Category {
  id: string;
  parent_id?: string | null;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  sort_order: number;
  children?: Category[];
}

export interface ProductFile {
  id: string;
  product_id: string;
  file_name: string;
  original_name: string;
  file_size: number;
  mime_type?: string | null;
  version: string;
  is_main: boolean;
}

export interface ProductLicenseKey {
  id: string;
  product_id: string;
  license_key: string;
  status: 'available' | 'assigned' | 'revoked';
  max_activations: number;
  activation_count: number;
  assigned_at?: string | null;
  expires_at?: string | null;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  buyer?: User;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id?: string | null;
  slug: string;
  name: string;
  short_description?: string | null;
  description?: string | null;
  changelog?: string | null;
  price: number;
  sale_price?: number | null;
  effective_price: number;
  product_type: ProductType;
  status: ProductStatus;
  thumbnail_url?: string | null;
  preview_images: string[];
  demo_url?: string | null;
  version: string;
  download_limit?: number | null;
  expiry_days?: number | null;
  total_sales: number;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  attributes?: Record<string, unknown>;
  created_at: string;
  vendor?: Vendor;
  category?: Category;
  files?: ProductFile[];
  reviews?: Review[];
}

export interface OrderDownload {
  id: string;
  order_item_id: string;
  product_file_id: string;
  download_token: string;
  download_url: string;
  download_count: number;
  max_downloads?: number | null;
  expires_at?: string | null;
  is_expired: boolean;
  file?: ProductFile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  product_name: string;
  product_type: ProductType;
  price: number;
  status: string;
  product?: Product;
  vendor?: Vendor;
  downloads?: OrderDownload[];
  license_key?: ProductLicenseKey;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  transaction_id?: string | null;
  paid_at?: string | null;
  created_at: string;
  buyer?: User;
  items?: OrderItem[];
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description?: string | null;
  created_at: string;
}

export interface VendorWallet {
  id: string;
  vendor_id: string;
  balance: number;
  holding_balance: number;
  total_earned: number;
  total_withdrawn: number;
  currency: string;
  transactions?: WalletTransaction[];
}

export interface PayoutRequest {
  id: string;
  vendor_id: string;
  amount: number;
  payout_method: string;
  payout_account_details: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  admin_note?: string | null;
  processed_at?: string | null;
  created_at: string;
  vendor?: Vendor;
}

export interface CartItem {
  product: Product;
  license_type?: string;
}
