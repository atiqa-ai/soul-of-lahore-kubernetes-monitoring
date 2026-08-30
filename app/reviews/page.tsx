import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { places } from '@/data/places';
import type { PlaceReview } from '@/lib/reviews';
import PlaceLogo from '@/app/components/PlaceLogo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Visitor Reviews — Soul of Lahore',
  description: 'Reviews left by visitors who walked the twelve landmarks of Lahore.',
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 text-sm leading-none" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? 'text-amber-400' : 'text-white/20'}>
          ★
        </span>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function ReviewsPage() {
  let reviews: PlaceReview[] = [];
  let loadError: string | null = null;

  try {
    const { data, error } = await supabase.from('reviews').select('*').limit(200);
    if (error) throw new Error(error.message);
    reviews = [...(data ?? [])]
      .sort((a, b) => (new Date(b.created_at).getTime() || 0) - (new Date(a.created_at).getTime() || 0))
      .slice(0, 200);
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Could not load reviews';
  }

  const known = new Set(places.map((p) => p.id));
  const visible = reviews.filter((r) => known.has(r.place_id));
  const grouped = new Map<string, PlaceReview[]>();
  places.forEach((p) => grouped.set(p.id, []));
  visible.forEach((r) => grouped.get(r.place_id)?.push(r));

  const totalReviews = visible.length;
  const overallAvg = totalReviews
    ? visible.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 md:pt-36 pb-20">
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-amber-500/60">
              Visitors&apos; Voice
            </span>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">The <span className="text-gold">Reviews</span></h1>
          <div className="divider-gold w-16 md:w-24 mx-auto mb-6" />
          <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
            Twelve landmarks, a thousand stories. Words left by travellers who stopped, looked, and listened.
          </p>

          {!loadError && (
            <div className="flex flex-col items-center gap-2 mt-6">
              <div className="flex items-center gap-3">
                <Stars value={overallAvg} />
                <span className="text-sm text-amber-400/80 font-medium">
                  {overallAvg.toFixed(1)} / 5
                </span>
              </div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-white/30">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''} across 12 landmarks
              </span>
            </div>
          )}
        </header>

        {loadError && (
          <div className="mb-14 text-center py-8 text-sm text-red-400/80 border border-red-500/20 rounded-xl bg-red-500/[0.04]">
            {loadError}
          </div>
        )}

        <div className="space-y-10 md:space-y-12">
          {places.map((place, i) => {
            const list = grouped.get(place.id) ?? [];
            const count = list.length;
            const avg = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;

            return (
              <article key={place.id} id={place.id} className="border-b border-white/[0.06] pb-10 md:pb-12 last:border-b-0">
                <Link href={`/place/${place.slug}`} className="group flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <PlaceLogo placeId={place.id} size={44} animated={false} />
                    <div>
                      <p className="text-[9px] tracking-[0.2em] uppercase text-white/25 mb-0.5">
                        {String(i + 1).padStart(2, '0')} · {place.label}
                      </p>
                      <h2 className="text-lg md:text-2xl font-bold text-white/90 group-hover:text-amber-300 transition-colors">
                        {place.title}
                      </h2>
                      <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 mt-0.5">{place.subtitle}</p>
                    </div>
                  </div>

                  {!loadError && count > 0 && (
                    <div className="flex flex-col items-end gap-1.5">
                      <Stars value={avg} />
                      <span className="text-[10px] tracking-[0.2em] uppercase text-white/35">
                        {avg.toFixed(1)} / 5 · {count} review{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </Link>

                {loadError ? (
                  <p className="text-xs text-white/30 italic">Reviews could not be loaded right now.</p>
                ) : count === 0 ? (
                  <p className="text-sm text-white/40 italic inline-flex items-center gap-2">
                    <span className="text-amber-400/60">✦</span>
                    No reviews yet — be the first to share your story.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {list.map((review) => (
                      <div
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
                                {formatDate(review.created_at)}
                              </p>
                            </div>
                          </div>
                          <Stars value={review.rating} />
                        </div>
                        {review.comment && (
                          <p className="text-sm text-white/75 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="pt-14 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-5">
            <Link
              href="/places"
              className="text-[11px] tracking-[0.25em] uppercase text-amber-400/60 hover:text-amber-300 transition-colors"
            >
              View All Places
            </Link>
            <span className="w-px h-3 bg-white/10" />
            <Link
              href="/"
              className="text-[11px] tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors"
            >
              Return Home
            </Link>
          </div>
          <p className="mt-8 pt-6 border-t border-white/5 w-full text-center text-[9px] tracking-[0.3em] uppercase text-white/15">
            Every Brick Tells A Story.
          </p>
        </div>
      </div>
    </main>
  );
}