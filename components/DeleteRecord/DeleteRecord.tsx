'use client';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { removeJournal, removePerson } from '@/app/personal-actions';
import styles from '@/styles/editorial.module.css';

export default function DeleteRecord({ id, kind }: { id: string; kind: 'person' | 'journal' }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  return (
    <div>
      {!confirming ? (
        <button
          type="button"
          className={styles.delete}
          title={`Delete ${kind}`}
          aria-label={`Delete ${kind}`}
          onClick={() => setConfirming(true)}
        >
          <Trash2 size={18} />
        </button>
      ) : (
        <div className={styles.actions}>
          <p>Delete permanently?</p>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  const result = await (kind === 'person' ? removePerson(id) : removeJournal(id));
                  if (result.error) setError(result.error);
                  else {
                    router.push(kind === 'person' ? '/people' : '/journal');
                  }
                } catch {
                  setError('Could not delete. Try again.');
                }
              })
            }
          >
            Delete
          </button>
          <button
            type="button"
            className={styles.delete}
            disabled={pending}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
