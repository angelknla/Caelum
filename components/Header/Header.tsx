import BrandMark from '@components/BrandMark/BrandMark';
import { LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { lock } from '@/app/auth-actions';
import styles from './Header.module.css';
import PrimaryNavigation from './PrimaryNavigation';
import ScrollHeader from './ScrollHeader';

export default function Header({
  signedIn,
  chartReady = false,
}: {
  signedIn: boolean;
  chartReady?: boolean;
}) {
  return (
    <ScrollHeader>
      <Link className={styles.brand} href="/">
        <BrandMark />
        Caelum
      </Link>
      {chartReady && <PrimaryNavigation />}
      <nav aria-label="Account" className={styles.account}>
        {signedIn ? (
          <>
            <Link
              className={styles.profileLink}
              href="/profile"
              prefetch={false}
              title="Your profile"
              aria-label="Your profile"
            >
              <UserRound size={18} />
            </Link>
            <form action={lock}>
              <button type="submit" title="Sign out" aria-label="Sign out">
                <LogOut size={18} />
              </button>
            </form>
          </>
        ) : (
          <Link className={styles.signIn} href="/?login=true" scroll={false}>
            Sign in
          </Link>
        )}
      </nav>
    </ScrollHeader>
  );
}
