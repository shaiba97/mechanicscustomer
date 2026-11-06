"use client";

import { api } from "@/lib/api-client";

export type ReviewPayload = {
  id: string;
  order_item_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type PartReviewsResponse = {
  results: ReviewPayload[];
  count: number;
  average: number | null;
};

export async function fetchPartReviews(partId: string): Promise<PartReviewsResponse> {
  return api.get<PartReviewsResponse>(`/api/parts/${partId}/reviews`);
}

export async function upsertReview(input: {
  orderItemId: string;
  rating: number;
  comment: string;
}): Promise<ReviewPayload> {
  return api.post<ReviewPayload>("/api/reviews", input);
}
