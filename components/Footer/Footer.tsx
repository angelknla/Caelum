import BrandMark from '@components/BrandMark/BrandMark';
import InstallApp from '@components/InstallApp/InstallApp';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.identity}>
        <Link href="/" className={styles.brand}>
          <BrandMark size={24} />
          Caelum
        </Link>
        <p>Your sky. Your story.</p>
      </div>
      <div className={styles.actions}>
        <InstallApp />
      </div>
      <p className={styles.legal}>
        &copy; {new Date().getUTCFullYear()} Caelum. <span>AGPL-3.0-only.</span>
      </p>
    </footer>
  );
}
