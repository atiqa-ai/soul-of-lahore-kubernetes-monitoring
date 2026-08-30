import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { places } from '@/data/places';
import PlaceClient from './PlaceClient';
import LoadingFallback from '@/app/components/LoadingFallback';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return places.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const place = places.find((p) => p.slug === params.slug);
  if (!place) return { title: 'Not Found — Soul of Lahore' };
  return {
    title: `${place.title} — ${place.subtitle} | Soul of Lahore`,
    description: place.description,
    openGraph: {
      title: `${place.title} — Soul of Lahore`,
      description: place.description,
      images: [{ url: place.media[0]?.src || '' }],
    },
  };
}

export default function PlacePage({ params }: Props) {
  const place = places.find((p) => p.slug === params.slug);
  if (!place) notFound();

  return (
    <Suspense fallback={<LoadingFallback label="Entering the story..." />}>
      <PlaceClient place={place} />
    </Suspense>
  );
}
