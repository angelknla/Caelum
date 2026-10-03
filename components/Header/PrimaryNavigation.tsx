'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

const destinations = [
  { href: '/today', label: 'Today' },
  { href: '/chart', label: 'Chart' },
  { href: '/explore', label: 'Explore' },
  { href: '/people', label: 'People' },
  { href: '/journal', label: 'Journal' },
];

export default function PrimaryNavigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.primary} aria-label="Your universe">
      {destinations.map(({ href, label }) => {
        const active =
          pathname === href ||
          pathname.startsWith(`${href}/`) ||
          (href === '/today' && pathname === '/calendar');
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
