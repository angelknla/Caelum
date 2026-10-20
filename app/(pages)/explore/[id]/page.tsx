import { notFound, redirect } from 'next/navigation';
import { REFERENCE } from '@/lib/astrology/reference';

export default async function ReferencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!REFERENCE.some((entry) => entry.id === id)) notFound();
  redirect(`/explore?entry=${encodeURIComponent(id)}`);
}
