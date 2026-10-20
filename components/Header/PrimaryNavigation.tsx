'use client';

import { CalendarDays, Compass, NotebookPen, Orbit, Sun, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

const destinations = [
  { href: '/today', label: 'Today', icon: Sun },
  { href: '/chart', label: 'Chart', icon: Orbit },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/people', label: 'People', icon: UsersRound },
  { href: '/journal', label: 'Journal', icon: NotebookPen },
];

export default function PrimaryNavigation() {
  const pathname = usePathname();
  const activeHref = destinations.find(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  )?.href;
  return (
    <nav className={styles.primary} aria-label="Your universe">
      {destinations.map(({ href, label, icon: Icon }) => {
        const active = activeHref === href;
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-label={label}
            title={label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={styles.navIcon} size={22} aria-hidden="true" />
            <span className={styles.navLabel}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
