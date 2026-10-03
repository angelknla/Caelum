'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { submitDetails } from '@/app/birth-actions';
import styles from './ProfileDetails.module.css';

const interests = ['Love', 'Career', 'Money', 'Personal growth', 'Family', 'Friendships', 'Creativity', 'Spirituality'];
export default function ProfileDetails() {
  const [state, action, pending] = useActionState(submitDetails, {});
  return <section className={styles.profile}><p className={styles.eyebrow}>Your life / A little more of you</p><h1>Beyond the chart.</h1><form action={action}><fieldset disabled={pending}><label htmlFor="nickname">Nickname <span>Optional</span></label><input id="nickname" name="nickname" maxLength={120} autoComplete="nickname" /><label htmlFor="currentLocation">Current location <span>Optional</span></label><input id="currentLocation" name="currentLocation" maxLength={120} autoComplete="address-level2" /><label htmlFor="pronouns">Pronouns <span>Optional</span></label><input id="pronouns" name="pronouns" maxLength={120} /><fieldset className={styles.interests}><legend>What draws your attention?</legend>{interests.map(interest => <label key={interest}><input type="checkbox" name="interests" value={interest} />{interest}</label>)}</fieldset><label htmlFor="experience">Your relationship with astrology</label><select id="experience" name="experience" defaultValue="beginner"><option value="beginner">Just beginning</option><option value="familiar">A little familiar</option><option value="advanced">Deeply familiar</option><option value="nerd">An astrology nerd</option></select><div className={styles.actions}><Link href="/chart">Skip for now</Link><button type="submit">{pending ? 'Saving...' : 'Save & return'}<ArrowRight size={18} /></button></div></fieldset>{state.error && <p role="alert" className={styles.error}>{state.error}</p>}</form></section>;
}