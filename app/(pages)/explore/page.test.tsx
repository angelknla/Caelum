import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ account: vi.fn() }));
vi.mock('@/lib/session', () => ({ getCurrentAccount: mocks.account }));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
  notFound: () => {
    throw new Error('not-found');
  },
}));
vi.mock('@components/Modal/Modal', () => ({
  default: ({ label }: { label: string }) => (
    <div role="dialog" aria-label={label}>
      Details
    </div>
  ),
}));
vi.mock('@components/ReferenceDetails/ReferenceDetails', () => ({ default: () => null }));

import ExplorePage from './page';

beforeEach(() => {
  vi.clearAllMocks();
});

it('requires an authenticated account before rendering personal reference details', async () => {
  mocks.account.mockResolvedValue(null);
  await expect(ExplorePage({ searchParams: Promise.resolve({ entry: 'sun' }) })).rejects.toThrow(
    'redirect:/login'
  );
});

it('keeps the library behind the selected planet modal', async () => {
  mocks.account.mockResolvedValue({ memberId: 'test' });
  render(await ExplorePage({ searchParams: Promise.resolve({ entry: 'sun' }) }));
  expect(screen.getByRole('heading', { name: 'The sky, in context.' })).toBeInTheDocument();
  expect(screen.getByRole('dialog', { name: 'Sun' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Sun' })).toHaveAttribute('href', '/explore?entry=sun');
});

it('renders the library without a modal and rejects unknown entries', async () => {
  mocks.account.mockResolvedValue({ memberId: 'test' });
  render(await ExplorePage({ searchParams: Promise.resolve({}) }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await expect(
    ExplorePage({ searchParams: Promise.resolve({ entry: 'unknown' }) })
  ).rejects.toThrow('not-found');
});
