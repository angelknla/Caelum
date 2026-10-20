'use client';
import { Save } from 'lucide-react';
import { useActionState, useState } from 'react';
import { submitJournal } from '@/app/personal-actions';
import styles from '@/styles/editorial.module.css';
import type { JournalEntry } from '@/types/personal';

export default function JournalEditor({
  entry,
  prompt = '',
}: {
  entry?: JournalEntry;
  prompt?: string;
}) {
  const [state, action, pending] = useActionState(submitJournal.bind(null, entry?.id ?? null), {});
  const [draft, setDraft] = useState({
    entry_date: entry?.entry_date ?? new Date().toLocaleDateString('en-CA'),
    title: entry?.title ?? '',
    body: entry?.body ?? prompt,
    tags: entry?.tags.join(', ') ?? '',
  });
  const [snapshot, setSnapshot] = useState(true);
  const update = (field: keyof typeof draft, value: string) =>
    setDraft((previous) => ({ ...previous, [field]: value }));
  return (
    <form action={action} className={styles.form}>
      <label className={styles.field}>
        Date
        <input
          name="entry_date"
          type="date"
          min="1900-01-01"
          max={new Date().toLocaleDateString('en-CA')}
          value={draft.entry_date}
          onChange={(event) => update('entry_date', event.target.value)}
          disabled={pending}
          required
        />
      </label>
      <label className={styles.field}>
        Title
        <input
          name="title"
          maxLength={120}
          value={draft.title}
          onChange={(event) => update('title', event.target.value)}
          disabled={pending}
          required
        />
      </label>
      <label className={styles.field}>
        Entry
        <textarea
          name="body"
          maxLength={50000}
          value={draft.body}
          onChange={(event) => update('body', event.target.value)}
          disabled={pending}
          required
        />
      </label>
      <label className={styles.field}>
        Tags, comma-separated
        <input
          name="tags"
          maxLength={491}
          value={draft.tags}
          onChange={(event) => update('tags', event.target.value)}
          disabled={pending}
        />
      </label>
      {!entry && (
        <label>
          <input
            type="checkbox"
            name="sky"
            checked={snapshot}
            onChange={(event) => setSnapshot(event.target.checked)}
            disabled={pending}
          />{' '}
          Include the current sky snapshot
        </label>
      )}
      {state.error && (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      )}
      <div className={styles.actions}>
        <button disabled={pending} type="submit">
          <Save size={18} /> {pending ? 'Saving...' : 'Save entry'}
        </button>
      </div>
    </form>
  );
}
