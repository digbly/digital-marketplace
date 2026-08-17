import { apiSlice } from './apiSlice';
import type { ApiResponse } from '../../types/auth';
import type { OrderItem, Review } from '../../types/marketplace';

export interface CreateReviewPayload {
  product_id: string;
  order_item_id?: string;
  rating: number;
  comment?: string;
}

export const buyerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBuyerLibrary: builder.query<ApiResponse<OrderItem[]>, void>({
      query: () => '/buyer/library',
      providesTags: ['BuyerLibrary'],
    }),
    createReview: builder.mutation<ApiResponse<Review>, CreateReviewPayload>({
      query: (payload) => ({
        url: '/buyer/reviews',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['BuyerLibrary', 'StorefrontProducts'],
    }),
  }),
});

export const {
  useGetBuyerLibraryQuery,
  useCreateReviewMutation,
} = buyerApi;
