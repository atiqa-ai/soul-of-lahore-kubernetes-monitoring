'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import type { PlaceReview } from '@/lib/reviews';
import { REVIEW_LIMITS } from '@/lib/reviews';

interface ReviewsSectionProps {
  placeId: string;
  placeTitle: string;
}

interface SubmitState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
}

function RatingStars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className={`text-xl leading-none transition-transform ${onChange ? 'hover:scale-125 cursor-pointer' : 'cursor-default'} ${star <= value ? 'text-amber-400' : 'text-white/20'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ placeId, placeTitle }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' });
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/reviews?place=${encodeURIComponent(placeId)}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load reviews');
      setReviews(json.reviews ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load reviews');
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    fetchReviews();
    if (sectionRef.current) {
      sectionRef.current.style.opacity = '0';
      sectionRef.current.style.transform = 'translateY(30px)';
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(sectionRef.current);
    }
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < REVIEW_LIMITS.minRating || !comment.trim()) return;
    setSubmit({ status: 'submitting' });
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place_id: placeId, author: author.trim(), rating, comment: comment.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit review');
      setReviews((prev) => [json.review, ...prev]);
      setAuthor('');
      setRating(0);
      setComment('');
      setSubmit({ status: 'success', message: 'Thank you! Your review has been added.' });
    } catch (err) {
      setSubmit({ status: 'error', message: err instanceof Error ? err.message : 'Could not submit review' });
    }
  };

  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const topReviews = [...reviews]
    .sort(
      (a, b) =>
        b.rating - a.rating ||
        (new Date(b.created_at).getTime() || 0) - (new Date(a.created_at).getTime() || 0)
    )
    .slice(0, 2);
  const hiddenCount = Math.max(0, reviews.length - topReviews.length);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 px-6 bg-gradient-to-b from-black via-neutral-950 to-black overflow-hidden"
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-amber-500/60">Visitors&apos; Voice</span>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3 text-white/90">Reviews for {placeTitle}</h2>
          <p className="text-sm text-white/50 max-w-xl mx-auto">
            Share your experience of this timeless landmark.
          </p>
          {reviews.length > 0 && (
            <div className="flex flex-col items-center gap-1.5 mt-5">
              <div className="flex items-center gap-2">
                <RatingStars value={Math.round(average)} />
                <span className="text-sm text-amber-400/80 font-medium">{average.toFixed(1)} / 5</span>
              </div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-white/30">
                {reviews.length} review{reviews.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Review list */}
        <div className="mb-12">
          {loading && (
            <div className="text-center py-10">
              <div className="inline-block w-6 h-6 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin " />
              <p className="mt-3 text-xs tracking-[0.2em] uppercase text-white/40">Entering the story...</p>
            </div>
          )}

          {!loading && loadError && (
            <div className="text-center py-8 text-sm text-red-400/80 border border-red-500/20 rounded-xl bg-red-500/[0.04]">
              {loadError}
            </div>
          )}

          {!loading && !loadError && reviews.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-white/40 italic">No reviews yet. Be the first to share your story.</p>
            </div>
          )}

          {!loading && topReviews.length > 0 && (
            <div ref={listRef} className="space-y-4">
              {topReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-transparent border border-amber-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-amber-400/90">
                          {review.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/85">{review.author}</p>
                        <p className="text-[10px] tracking-wide text-white/30">
                          {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <RatingStars value={review.rating} />
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed">{review.comment}</p>
                </article>
              ))}
            </div>
          )}

          {!loading && hiddenCount > 0 && (
            <div className="mt-5 text-center">
              <Link
                href={`/reviews#${placeId}`}
                className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-amber-400/70 hover:text-amber-300 transition-colors"
              >
                View all {reviews.length} reviews
                <span className="text-amber-400/70">→</span>
              </Link>
            </div>
          )}
        </div>

        {/* Submit form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 md:p-8"
        >
          <h3 className="text-lg font-semibold text-white/90 mb-5">Leave a Review</h3>

          <div className="flex flex-wrap items-center gap-4 mb-5">
            <label className="flex items-center gap-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-white/40">Your name</span>
              <input
                type="text"
                value={author}
                maxLength={REVIEW_LIMITS.authorMax}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Anonymous"
                className="px-3 py-2 w-44 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/40"
              />
            </label>
            <div className="flex items-center gap-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-white/40">Rating</span>
              <RatingStars value={rating} onChange={setRating} />
            </div>
          </div>

          <textarea
            value={comment}
            maxLength={REVIEW_LIMITS.commentMax}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            required
            placeholder="What did you see? How did it feel?"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/40 resize-none"
          />

          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-white/35">
              {rating < REVIEW_LIMITS.minRating || !comment.trim()
                ? 'Select a rating and write your story to submit.'
                : `${comment.trim().length}/${REVIEW_LIMITS.commentMax}`}
            </p>
            <button
              type="submit"
              disabled={submit.status === 'submitting' || rating < REVIEW_LIMITS.minRating || !comment.trim()}
              className="px-6 py-2.5 rounded-xl bg-amber-500/90 text-black text-xs font-semibold tracking-[0.2em] uppercase hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submit.status === 'submitting' ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>

          {submit.status === 'success' && (
            <p className="mt-4 text-sm text-emerald-400/80">{submit.message}</p>
          )}
          {submit.status === 'error' && (
            <p className="mt-4 text-sm text-red-400/80">{submit.message}</p>
          )}
        </form>
      </div>
    </section>
  );
}
