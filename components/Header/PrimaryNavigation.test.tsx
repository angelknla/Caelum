import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import PrimaryNavigation from './PrimaryNavigation';

const navigation = vi.hoisted(() => ({ pathname: '/journal/new' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));

it('marks the parent destination for nested pages', () => {
  render(<PrimaryNavigation />);
  expect(screen.getByRole('link', { name: 'Journal' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Chart' })).not.toHaveAttribute('aria-current');
});

it('gives Calendar its own destination and active state', () => {
  navigation.pathname = '/calendar';
  render(<PrimaryNavigation />);
  expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('href', '/calendar');
  expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Today' })).not.toHaveAttribute('aria-current');
});
