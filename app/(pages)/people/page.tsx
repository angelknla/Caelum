import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { listPeople, PersonalStorageError } from '@/lib/data/personal';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';

export const metadata = { title: 'People | Caelum' };
export default async function PeoplePage() {
  if (!(await getCurrentAccount())) redirect('/login');
  let people: Awaited<ReturnType<typeof listPeople>> = [];
  let error = '';
  try { people = await listPeople(); } catch (failure) { if (!(failure instanceof PersonalStorageError)) throw failure; error = failure.message; }
  return <article className={styles.page}><header className={styles.heading}><p className={styles.eyebrow}>People / Shared skies</p><h1>Other beginnings.</h1></header><div className={styles.toolbar}><Link href="/people/new" className={styles.actions}><Plus size={18} /> Add person</Link></div>{error && <p role="status">{error}</p>}<ul className={styles.list}>{people.map(person => <li className={styles.item} key={person.id}><h2><Link href={`/people/${person.id}`}>{person.name}</Link></h2><p>{person.relationship} · {person.chart ? 'Calculated chart' : 'Birth details saved; chart incomplete'}</p></li>)}</ul>{!error && !people.length && <p>No people saved yet.</p>}</article>;
}