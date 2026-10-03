import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { REFERENCE, referenceForChart } from '@/lib/astrology/reference';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';

export default async function ReferencePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAccount())) redirect('/login');
  const { id } = await params;
  const entry = REFERENCE.find(item => item.id === id);
  if (!entry) notFound();
  let evidence: string[] = [];
  try { const profile = await getBirthProfile(); if (profile?.chart) evidence = referenceForChart(id, profile.chart); }
  catch (error) { if (!(error instanceof ProfileStorageError)) throw error; }
  return <article className={styles.page}><header className={styles.heading}><Link href="/explore">Explore</Link><p className={styles.eyebrow}>{entry.category} / {entry.summary}</p><h1>{entry.name}</h1></header><p className={styles.prose}>{entry.reflection}</p><blockquote className={styles.prompt}>{entry.prompt}</blockquote><section className={styles.evidence}><h2>In your chart</h2>{evidence.length ? <ul>{evidence.map(item => <li key={item}>{item}</li>)}</ul> : <p>No corresponding placement or aspect is available in your saved chart. Absence does not imply a missing quality or life experience.</p>}<Link href="/chart">Your natal chart</Link></section></article>;
}