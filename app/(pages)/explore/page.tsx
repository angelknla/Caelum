import ReferenceLibrary from '@components/ReferenceLibrary/ReferenceLibrary';
import { redirect } from 'next/navigation';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';

export const metadata = { title: 'Explore | Caelum' };
export default async function ExplorePage() {
  if (!(await getCurrentAccount())) redirect('/login');
  return <article className={styles.page}><header className={styles.heading}><p className={styles.eyebrow}>Explore / A symbolic language</p><h1>The sky, in context.</h1></header><ReferenceLibrary /></article>;
}