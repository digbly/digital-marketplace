import { apiSlice } from './apiSlice';
import type { ApiResponse } from '../../types/auth';
import type { Category, Product } from '../../types/marketplace';

export const storefrontApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/storefront/categories',
      providesTags: ['Categories'],
    }),
    getStorefrontProducts: builder.query<
      ApiResponse<Product[]>,
      { category_id?: string; search?: string; sort?: string; page?: number; per_page?: number } | void
    >({
      query: (params) => ({
        url: '/storefront/products',
        params: params || {},
      }),
    }),
    getProductBySlug: builder.query<ApiResponse<Product>, string>({
      query: (slug) => `/storefront/products/${slug}`,
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetStorefrontProductsQuery,
  useGetProductBySlugQuery,
} = storefrontApi;
