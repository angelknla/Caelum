'use client';
import BirthFlow from '@components/BirthFlow/BirthFlow';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { submitPerson } from '@/app/personal-actions';
import styles from '@/styles/editorial.module.css';
import type { Person } from '@/types/personal';

export default function PersonEditor({ person }: { person?: Person }) {
  const router = useRouter();
  const [name, setName] = useState(person?.name ?? '');
  const [relationship, setRelationship] = useState(person?.relationship ?? '');
  const [consent, setConsent] = useState(false);
  return (
    <section className={styles.page}>
      <div className={styles.form}>
        <label className={styles.field}>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label className={styles.field}>
          Relationship
          <input
            value={relationship}
            onChange={(event) => setRelationship(event.target.value)}
            maxLength={120}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />{' '}
          I have permission to store these birth details.
        </label>
      </div>
      <BirthFlow
        initial={person?.birth}
        subject={name || 'Another beginning'}
        save={async (birth, draftOnly) => {
          const result = await submitPerson(
            person?.id ?? null,
            name,
            relationship,
            consent,
            birth,
            draftOnly
          );
          if (result.id) {
            router.push(`/people/${result.id}`);
          }
          return result;
        }}
      />
    </section>
  );
}
