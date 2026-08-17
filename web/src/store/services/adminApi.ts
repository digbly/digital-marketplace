import { apiSlice } from './apiSlice';
import type { ApiResponse } from '../../types/auth';
import type { Vendor, Product, PayoutRequest } from '../../types/marketplace';
import type {
  AdminAnalyticsData,
  PaginatedAdminData,
  PaginationParams,
  ApproveVendorPayload,
  ModerateProductPayload,
  ProcessPayoutPayload,
} from '../../types/admin';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAnalytics: builder.query<ApiResponse<AdminAnalyticsData>, void>({
      query: () => '/admin/analytics',
      providesTags: ['AdminAnalytics'],
    }),

    getAdminVendors: builder.query<PaginatedAdminData<Vendor>, PaginationParams | void>({
      query: (params) => ({
        url: '/admin/vendors',
        params: params || undefined,
      }),
      providesTags: ['AdminVendors'],
    }),

    updateVendorStatus: builder.mutation<ApiResponse<Vendor>, ApproveVendorPayload>({
      query: ({ id, ...body }) => ({
        url: `/admin/vendors/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminVendors', 'AdminAnalytics'],
    }),

    getAdminProducts: builder.query<PaginatedAdminData<Product>, PaginationParams | void>({
      query: (params) => ({
        url: '/admin/products',
        params: params || undefined,
      }),
      providesTags: ['AdminProducts'],
    }),

    moderateProduct: builder.mutation<ApiResponse<Product>, ModerateProductPayload>({
      query: ({ id, ...body }) => ({
        url: `/admin/products/${id}/moderate`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminProducts', 'AdminAnalytics', 'StorefrontProducts'],
    }),

    getAdminPayouts: builder.query<PaginatedAdminData<PayoutRequest>, PaginationParams | void>({
      query: (params) => ({
        url: '/admin/payouts',
        params: params || undefined,
      }),
      providesTags: ['AdminPayouts'],
    }),

    processPayout: builder.mutation<ApiResponse<PayoutRequest>, ProcessPayoutPayload>({
      query: ({ id, ...body }) => ({
        url: `/admin/payouts/${id}/process`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminPayouts', 'AdminAnalytics', 'VendorWallet'],
    }),
  }),
});

export const {
  useGetAdminAnalyticsQuery,
  useGetAdminVendorsQuery,
  useUpdateVendorStatusMutation,
  useGetAdminProductsQuery,
  useModerateProductMutation,
  useGetAdminPayoutsQuery,
  useProcessPayoutMutation,
} = adminApi;
