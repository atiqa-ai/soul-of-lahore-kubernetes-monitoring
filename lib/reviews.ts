export interface PlaceReview {
  id: string;
  place_id: string;
  author: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const REVIEW_LIMITS = {
  authorMax: 40,
  commentMax: 1000,
  minRating: 1,
  maxRating: 5,
} as const;
