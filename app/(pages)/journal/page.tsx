import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { listJournal, PersonalStorageError } from '@/lib/data/personal';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';
import journalStyles from './journal.module.css';

export const metadata = { title: 'Journal | Caelum' };
export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await getCurrentAccount())) redirect('/login');
  const params = await searchParams;
  const page = Math.min(1000, Math.max(0, Number(params.page) || 0));
  const tag = typeof params.tag === 'string' ? params.tag.trim().toLowerCase().slice(0, 40) : '';
  let entries: Awaited<ReturnType<typeof listJournal>> = [];
  let error = '';
  try {
    entries = await listJournal(Math.floor(page), tag);
  } catch (failure) {
    if (!(failure instanceof PersonalStorageError)) throw failure;
    error = failure.message;
  }
  return (
    <article className={`${styles.page} ${journalStyles.journal}`}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Journal / Your own words</p>
        <h1>A life, observed.</h1>
      </header>
      <div className={`${styles.toolbar} ${journalStyles.toolbar}`}>
        <Link href="/journal/new" className={styles.actions}>
          <Plus size={18} /> New entry
        </Link>
        <form className={`${styles.toolbar} ${journalStyles.filter}`}>
          <label className={styles.field}>
            Tag
            <input name="tag" defaultValue={tag} maxLength={40} />
          </label>
          <button type="submit">Filter</button>
        </form>
      </div>
      {error && <p role="status">{error}</p>}
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <span className={styles.tag}>
              {entry.entry_date} · {entry.tags.join(' / ')}
            </span>
            <h2>
              <Link prefetch={false} href={`/journal/${entry.id}`}>
                {entry.title}
              </Link>
            </h2>
            <p className={styles.body}>
              {entry.body.slice(0, 220)}
              {entry.body.length > 220 ? '...' : ''}
            </p>
          </li>
        ))}
      </ul>
      {!error && !entries.length && <p>No entries match this view.</p>}
      <nav className={styles.tabs} aria-label="Journal pages">
        {page > 0 && (
          <Link
            prefetch={false}
            href={`/journal?page=${Math.floor(page) - 1}&tag=${encodeURIComponent(tag)}`}
          >
            Newer entries
          </Link>
        )}
        {entries.length === 20 && (
          <Link
            prefetch={false}
            href={`/journal?page=${Math.floor(page) + 1}&tag=${encodeURIComponent(tag)}`}
          >
            Older entries
          </Link>
        )}
      </nav>
    </article>
  );
}
