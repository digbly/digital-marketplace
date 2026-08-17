import { apiSlice } from './apiSlice';
import type { ApiResponse } from '../../types/auth';
import type { Category, Order, Product } from '../../types/marketplace';

export interface StorefrontProductParams {
  category_id?: string;
  search?: string;
  product_type?: string;
  is_featured?: boolean;
  sort_by?: 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  per_page?: number;
}

export interface PaginatedProductsResponse {
  data: Product[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CheckoutPayload {
  items: Array<{ product_id: string }>;
  payment_method: string;
  discount_code?: string;
}

export interface CheckoutResponseData {
  message: string;
  data: Order;
  payment?: any;
  redirect_url?: string | null;
  client_secret?: string | null;
}

export const storefrontApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/storefront/categories',
      providesTags: ['Categories'],
    }),
    getStorefrontProducts: builder.query<PaginatedProductsResponse, StorefrontProductParams | void>({
      query: (params) => ({
        url: '/storefront/products',
        params: params || {},
      }),
      providesTags: ['StorefrontProducts'],
    }),
    getProductBySlug: builder.query<ApiResponse<Product>, string>({
      query: (slug) => `/storefront/products/${slug}`,
      providesTags: (_res, _err, slug) => [{ type: 'StorefrontProducts', id: slug }],
    }),
    checkout: builder.mutation<CheckoutResponseData, CheckoutPayload>({
      query: (payload) => ({
        url: '/storefront/checkout',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['BuyerLibrary', 'StorefrontProducts'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetStorefrontProductsQuery,
  useGetProductBySlugQuery,
  useCheckoutMutation,
} = storefrontApi;
