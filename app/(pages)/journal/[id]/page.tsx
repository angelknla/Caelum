import DeleteRecord from '@components/DeleteRecord/DeleteRecord';
import JournalEditor from '@components/JournalEditor/JournalEditor';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getJournalEntry } from '@/lib/data/personal';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';
import journalStyles from '../journal.module.css';
export default async function EntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  if (!(await getCurrentAccount())) redirect('/login');
  const entry = await getJournalEntry((await params).id);
  if (!entry) notFound();
  const edit = (await searchParams).edit === '1';
  return (
    <article className={`${styles.page} ${journalStyles.journal}`}>
      <header className={styles.heading}>
        <Link href="/journal">Journal</Link>
        <p className={styles.eyebrow}>
          {entry.entry_date} / {entry.tags.join(' · ')}
        </p>
        <div className={styles.row}>
          <h1>{entry.title}</h1>
          <div className={styles.actions}>
            <Link
              href={`/journal/${entry.id}?edit=${edit ? '0' : '1'}`}
              title={edit ? 'Close editor' : 'Edit entry'}
              aria-label={edit ? 'Close editor' : 'Edit entry'}
            >
              <Pencil size={18} />
            </Link>
            <DeleteRecord id={entry.id} kind="journal" />
          </div>
        </div>
      </header>
      {edit ? (
        <JournalEditor entry={entry} />
      ) : (
        <p className={`${styles.prose} ${styles.body}`}>{entry.body}</p>
      )}
      {entry.sky && (
        <section className={styles.evidence}>
          <h2>The sky when saved</h2>
          <p>
            {entry.sky.phase} · Moon {entry.sky.moon} · {(entry.sky.illumination * 100).toFixed(1)}%
            illuminated
          </p>
          <p>
            {entry.sky.at} · {entry.sky.engine}. This is the original save-time snapshot, not the
            entry date&apos;s sky or an explanation of your experience.
          </p>
        </section>
      )}
    </article>
  );
}
