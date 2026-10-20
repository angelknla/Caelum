import AuthForm from '@components/AuthForm/AuthForm';
import Modal from '@components/Modal/Modal';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import styles from './page.module.css';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ login?: string }>;
}) {
  const showLogin = (await searchParams).login === 'true';
  const account = await getCurrentAccount();
  if (account) {
    try {
      const profile = await getBirthProfile();
      if (profile) redirect(profile.chart ? '/today' : '/chart');
    } catch (error) {
      if (!(error instanceof ProfileStorageError)) throw error;
    }
  }
  return (
    <>
      <section className={styles.arrival}>
        <Image
          className={`${styles.moon}${account ? '' : ` ${styles.rotatingMoon}`}`}
          src="/images/moon.jpg"
          alt="The near side of the full Moon, photographed by Gregory H. Revera"
          width={2580}
          height={2452}
          sizes="(max-width: 950px) 280px, 660px"
          priority
        />
        <div className={styles.title}>
          <p className={styles.eyebrow}>The sky / Your chart / Your life</p>
          <h1>Caelum</h1>
          <p className={styles.subtitle}>
            Your sky.
            <br />
            Your story.
          </p>
          <div className={styles.actions}>
            <Link className={styles.begin} href={account ? '/begin' : '/register'}>
              Begin <ArrowRight size={20} aria-hidden="true" />
            </Link>
            {!account && (
              <Link className={styles.returning} href="/?login=true" scroll={false}>
                Return to your sky <ArrowRight size={20} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
        <div className={styles.caption}>
          <span>01 / A personal universe</span>
          <a
            href="https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Moon · Gregory H. Revera / CC BY-SA 3.0
          </a>
        </div>
      </section>
      {showLogin && !account && (
        <Modal label="Sign in" closeHref="/" size="auth">
          <AuthForm
            mode="login"
            inModal
            available={isSupabaseConfigured() && Boolean(process.env.APP_PASSCODE)}
          />
        </Modal>
      )}
      <section className={styles.next}>
        <span className={styles.eyebrow}>A moment in the sky</span>
        <h2>
          A beginning.
          <br />
          Not a definition.
        </h2>
        <p>
          A chart is a map of the sky at your birth. Astrology offers a symbolic language for
          exploring it. The story remains yours.
        </p>
      </section>
    </>
  );
}
