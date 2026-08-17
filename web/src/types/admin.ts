import type { Order } from './marketplace';

export interface AdminAnalyticsData {
  total_revenue: number;
  total_commission: number;
  total_orders: number;
  total_products: number;
  total_vendors: number;
  total_buyers: number;
  recent_orders: Order[];
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

export interface PaginatedAdminData<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApproveVendorPayload {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_rate?: number;
}

export interface ModerateProductPayload {
  id: string;
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
  is_featured?: boolean;
}

export interface ProcessPayoutPayload {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  admin_note?: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}
