import JournalEditor from '@components/JournalEditor/JournalEditor';
import { redirect } from 'next/navigation';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';
import journalStyles from '../journal.module.css';
export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  if (!(await getCurrentAccount())) redirect('/login');
  const { prompt } = await searchParams;
  return (
    <article className={`${styles.page} ${journalStyles.journal}`}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Journal</p>
        <h1>A moment in words.</h1>
      </header>
      <JournalEditor prompt={typeof prompt === 'string' ? prompt.slice(0, 1000) : ''} />
    </article>
  );
}
