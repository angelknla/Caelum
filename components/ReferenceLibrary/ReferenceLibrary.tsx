'use client';
import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { REFERENCE } from '@/lib/astrology/reference';
import styles from '@/styles/editorial.module.css';

export default function ReferenceLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const search = useDeferredValue(query.trim().toLowerCase());
  const entries = REFERENCE.filter(
    (entry) =>
      (category === 'All' || category === entry.category) &&
      `${entry.name} ${entry.summary} ${entry.reflection}`.toLowerCase().includes(search)
  );
  return (
    <>
      <div className={styles.toolbar}>
        <label className={`${styles.field} ${styles.search}`}>
          Search
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className={styles.field}>
          Collection
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {['All', 'Planets', 'Signs', 'Houses', 'Aspects'].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      <p className={styles.muted} aria-live="polite">
        {entries.length} entries
      </p>
      <ul className={`${styles.list} ${styles.libraryList}`}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <span className={styles.tag}>{entry.category}</span>
            <h2>
              <Link href={`/explore/${entry.id}`}>{entry.name}</Link>
            </h2>
            <p>{entry.summary}</p>
          </li>
        ))}
      </ul>
      {!entries.length && <p>No entries match this search.</p>}
    </>
  );
}
