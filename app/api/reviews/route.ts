import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { REVIEW_LIMITS } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place');
  if (!placeId) {
    return NextResponse.json({ error: 'Missing place query parameter' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] }, { status: 200 });
}

export async function POST(request: NextRequest) {
  let body: { place_id?: string; author?: string; rating?: number; comment?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const placeId = (body.place_id ?? '').trim();
  const author = (body.author ?? '').trim().slice(0, REVIEW_LIMITS.authorMax) || 'Anonymous';
  const rating = Number(body.rating);
  const comment = (body.comment ?? '').trim().slice(0, REVIEW_LIMITS.commentMax);

  if (!placeId) {
    return NextResponse.json({ error: 'place_id is required' }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < REVIEW_LIMITS.minRating || rating > REVIEW_LIMITS.maxRating) {
    return NextResponse.json({ error: `rating must be an integer between ${REVIEW_LIMITS.minRating} and ${REVIEW_LIMITS.maxRating}` }, { status: 400 });
  }
  if (!comment) {
    return NextResponse.json({ error: 'comment is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({ place_id: placeId, author, rating, comment })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id query parameter' }, { status: 400 });
  }

  const { error } = await supabase.from('reviews').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
