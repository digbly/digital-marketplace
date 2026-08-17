import { apiSlice } from './apiSlice';
import type { ApiResponse } from '../../types/auth';
import type {
  Vendor,
  Product,
  ProductFile,
  OrderItem,
  VendorWallet,
  PayoutRequest,
} from '../../types/marketplace';

export interface VendorProfilePayload {
  store_name: string;
  bio?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  payout_method?: string | null;
  payout_account_details?: Record<string, any> | null;
}

export interface StoreProductPayload {
  name: string;
  category_id?: string;
  product_type: 'downloadable_file' | 'license_key' | 'bundle';
  price: number;
  sale_price?: number;
  short_description?: string;
  description?: string;
  version?: string;
  thumbnail_url?: string;
  demo_url?: string;
}

export interface UpdateProductPayload extends Partial<StoreProductPayload> {
  id: string;
  status?: string;
}

export interface CreatePayoutPayload {
  amount: number;
  payout_method: string;
  payout_account_details: Record<string, any>;
}

export const vendorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVendorProfile: builder.query<ApiResponse<Vendor>, void>({
      query: () => '/vendor/profile',
      providesTags: ['VendorProfile'],
    }),

    updateVendorProfile: builder.mutation<ApiResponse<Vendor>, VendorProfilePayload>({
      query: (payload) => ({
        url: '/vendor/profile',
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['VendorProfile'],
    }),

    getVendorProducts: builder.query<
      ApiResponse<Product[]>,
      { page?: number; per_page?: number; search?: string } | void
    >({
      query: (params) => ({
        url: '/vendor/products',
        params: params || {},
      }),
      providesTags: ['VendorProducts'],
    }),

    createVendorProduct: builder.mutation<ApiResponse<Product>, StoreProductPayload>({
      query: (payload) => ({
        url: '/vendor/products',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['VendorProducts'],
    }),

    updateVendorProduct: builder.mutation<ApiResponse<Product>, UpdateProductPayload>({
      query: ({ id, ...payload }) => ({
        url: `/vendor/products/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['VendorProducts'],
    }),

    deleteVendorProduct: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/vendor/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorProducts'],
    }),

    uploadProductFile: builder.mutation<
      ApiResponse<ProductFile>,
      { productId: string; formData: FormData }
    >({
      query: ({ productId, formData }) => ({
        url: `/vendor/products/${productId}/files`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['VendorProducts'],
    }),

    importProductLicenseKeys: builder.mutation<
      ApiResponse<{ message: string; imported_count: number }>,
      { productId: string; keys: string[] }
    >({
      query: ({ productId, keys }) => ({
        url: `/vendor/products/${productId}/license-keys`,
        method: 'POST',
        body: { keys },
      }),
      invalidatesTags: ['VendorProducts'],
    }),

    getVendorOrders: builder.query<
      ApiResponse<OrderItem[]>,
      { page?: number; per_page?: number } | void
    >({
      query: (params) => ({
        url: '/vendor/orders',
        params: params || {},
      }),
      providesTags: ['VendorOrders'],
    }),

    getVendorWallet: builder.query<ApiResponse<VendorWallet>, void>({
      query: () => '/vendor/wallet',
      providesTags: ['VendorWallet'],
    }),

    requestPayout: builder.mutation<
      ApiResponse<PayoutRequest>,
      CreatePayoutPayload
    >({
      query: (payload) => ({
        url: '/vendor/payouts',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['VendorWallet'],
    }),
  }),
});

export const {
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
  useGetVendorProductsQuery,
  useCreateVendorProductMutation,
  useUpdateVendorProductMutation,
  useDeleteVendorProductMutation,
  useUploadProductFileMutation,
  useImportProductLicenseKeysMutation,
  useGetVendorOrdersQuery,
  useGetVendorWalletQuery,
  useRequestPayoutMutation,
} = vendorApi;
