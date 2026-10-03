import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { lock } from '@/app/auth-actions';
import styles from './Header.module.css';

export default function Header({ signedIn }: { signedIn: boolean }) {
    return (
        <header className={styles.header}>
            <Link className={styles.brand} href="/">Caelum</Link>
            <nav aria-label="Account">
                {signedIn ? (
                    <form action={lock}><button type="submit" title="Sign out" aria-label="Sign out"><LogOut size={18} /></button></form>
                ) : (
                    <Link href="/login">Sign in</Link>
                )}
            </nav>
        </header>
    );
}