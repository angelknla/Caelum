'use client';

import { ArrowRight, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { submitDetails } from '@/app/birth-actions';
import editorial from '@/styles/editorial.module.css';
import type { ProfileDetails as SavedDetails } from '@/types/chart';
import styles from './ProfileDetails.module.css';

const interests = [
  'Love',
  'Career',
  'Money',
  'Personal growth',
  'Family',
  'Friendships',
  'Creativity',
  'Spirituality',
];
export default function ProfileDetails({ initial }: { initial?: SavedDetails }) {
  const [state, action, pending] = useActionState(submitDetails, {});
  return (
    <section className={`${editorial.page} ${styles.profile}`}>
      <header className={editorial.heading}>
        <p className={editorial.eyebrow}>Your account</p>
        <h1>Your profile.</h1>
        <Link className={styles.birthLink} href="/begin">
          <Pencil size={18} />
          Edit birth details
        </Link>
      </header>
      <form action={action}>
        <fieldset disabled={pending}>
          <label htmlFor="nickname">
            Nickname <span>Optional</span>
          </label>
          <input
            id="nickname"
            name="nickname"
            maxLength={120}
            autoComplete="nickname"
            defaultValue={initial?.nickname ?? ''}
          />
          <label htmlFor="currentLocation">
            Current location <span>Optional</span>
          </label>
          <input
            id="currentLocation"
            name="currentLocation"
            maxLength={120}
            autoComplete="address-level2"
            defaultValue={initial?.currentLocation ?? ''}
          />
          <label htmlFor="pronouns">
            Pronouns <span>Optional</span>
          </label>
          <input
            id="pronouns"
            name="pronouns"
            maxLength={120}
            defaultValue={initial?.pronouns ?? ''}
          />
          <fieldset className={styles.interests}>
            <legend>What draws your attention?</legend>
            {interests.map((interest) => (
              <label key={interest}>
                <input
                  type="checkbox"
                  name="interests"
                  value={interest}
                  defaultChecked={initial?.interests?.includes(interest) ?? false}
                />
                {interest}
              </label>
            ))}
          </fieldset>
          <label htmlFor="experience">Your relationship with astrology</label>
          <select
            id="experience"
            name="experience"
            defaultValue={initial?.experience ?? 'beginner'}
          >
            <option value="beginner">Just beginning</option>
            <option value="familiar">A little familiar</option>
            <option value="advanced">Deeply familiar</option>
            <option value="nerd">An astrology nerd</option>
          </select>
          <div className={styles.actions}>
            <Link href="/chart">Cancel</Link>
            <button type="submit">
              {pending ? 'Saving...' : 'Save & return'}
              <ArrowRight size={18} />
            </button>
          </div>
        </fieldset>
        {state.error && (
          <p role="alert" className={styles.error}>
            {state.error}
          </p>
        )}
      </form>
    </section>
  );
}
