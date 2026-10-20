import Modal from '@components/Modal/Modal';
import ReferenceDetails from '@components/ReferenceDetails/ReferenceDetails';
import ReferenceLibrary from '@components/ReferenceLibrary/ReferenceLibrary';
import { notFound, redirect } from 'next/navigation';
import { REFERENCE } from '@/lib/astrology/reference';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';

export const metadata = { title: 'Explore | Caelum' };
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string }>;
}) {
  if (!(await getCurrentAccount())) redirect('/login');
  const { entry: id } = await searchParams;
  const entry = id ? REFERENCE.find((item) => item.id === id) : null;
  if (id && !entry) notFound();
  return (
    <>
      <article className={styles.page}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Explore / A symbolic language</p>
          <h1>The sky, in context.</h1>
        </header>
        <ReferenceLibrary />
      </article>
      {entry && (
        <Modal key={entry.id} label={entry.name} closeHref="/explore">
          <ReferenceDetails id={entry.id} />
        </Modal>
      )}
    </>
  );
}
