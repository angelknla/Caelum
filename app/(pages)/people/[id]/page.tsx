import ChartWheel from '@components/ChartWheel/ChartWheel';
import DeleteRecord from '@components/DeleteRecord/DeleteRecord';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { compareCharts } from '@/lib/astrology/synastry';
import { getBirthProfile } from '@/lib/data/birth-profiles';
import { getPerson, PersonalStorageError } from '@/lib/data/personal';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAccount())) redirect('/login');
  const { id } = await params;
  let person: Awaited<ReturnType<typeof getPerson>>;
  try { person = await getPerson(id); } catch (error) { if (!(error instanceof PersonalStorageError)) throw error; return <section className={styles.page}><h1>People</h1><p>{error.message}</p></section>; }
  if (!person) notFound();
  const own = await getBirthProfile();
  const contacts = own?.chart && person.chart ? compareCharts(own.chart, person.chart) : [];
  return <article className={styles.page}><header className={styles.heading}><Link href="/people">People</Link><p className={styles.eyebrow}>{person.relationship || 'Another sky'}</p><div className={styles.row}><h1>{person.name}</h1><div className={styles.actions}><Link href={`/people/${id}/edit`} title="Edit person" aria-label="Edit person"><Pencil size={18} /></Link><DeleteRecord id={id} kind="person" /></div></div><p>{person.birth.date} · {person.birth.time ?? 'Time unknown'} · {person.birth.place}</p></header>{person.chart ? <ChartWheel chart={person.chart} /> : <p>Birth details are saved, but no complete chart is available. Edit to enter a known time or recalculate. No rising sign or houses are invented.</p>}<section className={styles.evidence}><h2>Between your skies</h2><p>Planet-to-planet major aspects within 3°. These are symbolic comparisons, not a compatibility score or a verdict on a relationship. Chart-to-chart motion is not classified as applying or separating.</p>{contacts.map(contact => <details className={styles.item} key={`${contact.from}-${contact.to}-${contact.name}`}><summary>Your {contact.from} {contact.name.toLowerCase()} {person.name}&apos;s {contact.to} · {contact.orb.toFixed(2)}°</summary><p>{contact.reflection}</p></details>)}{!contacts.length && <p>No qualifying comparison is available.</p>}</section></article>;
}