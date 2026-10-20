import DeleteRecord from '@components/DeleteRecord/DeleteRecord';
import PersonSky from '@components/PersonSky/PersonSky';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { compareCharts } from '@/lib/astrology/synastry';
import { buildToday } from '@/lib/astrology/today';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getPerson, PersonalStorageError } from '@/lib/data/personal';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';

export const dynamic = 'force-dynamic';

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentAccount())) redirect('/login');
  const { id } = await params;
  let person: Awaited<ReturnType<typeof getPerson>>;
  try {
    person = await getPerson(id);
  } catch (error) {
    if (!(error instanceof PersonalStorageError)) throw error;
    return (
      <section className={styles.page}>
        <h1>People</h1>
        <p>{error.message}</p>
      </section>
    );
  }
  if (!person) notFound();
  let today: ReturnType<typeof buildToday> | null = null;
  let own: Awaited<ReturnType<typeof getBirthProfile>> = null;
  if (person.chart) {
    try {
      today = buildToday(person.chart);
    } catch {
      // Keep the saved natal chart available if the current sky cannot be calculated.
    }
    try {
      own = await getBirthProfile();
    } catch (error) {
      if (!(error instanceof ProfileStorageError)) throw error;
    }
  }
  const comparisonAvailable = Boolean(own?.chart && person.chart);
  const contacts = own?.chart && person.chart ? compareCharts(own.chart, person.chart) : [];
  return (
    <article className={styles.page}>
      <header className={styles.heading}>
        <Link href="/people">People</Link>
        <p className={styles.eyebrow}>{person.relationship || 'Another sky'}</p>
        <div className={styles.row}>
          <h1>{person.name}</h1>
          <div className={styles.actions}>
            <Link href={`/people/${id}/edit`} title="Edit person" aria-label="Edit person">
              <Pencil size={18} />
            </Link>
            <DeleteRecord id={id} kind="person" />
          </div>
        </div>
        <p>
          {person.birth.date} · {person.birth.time ?? 'Time unknown'} · {person.birth.place}
        </p>
      </header>
      <PersonSky
        person={person}
        today={today}
        contacts={contacts}
        comparisonAvailable={comparisonAvailable}
      />
    </article>
  );
}
