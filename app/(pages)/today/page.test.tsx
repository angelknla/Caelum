import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ account: vi.fn(), profile: vi.fn(), today: vi.fn() }));
vi.mock('@/lib/session', () => ({ getCurrentAccount: mocks.account }));
vi.mock('@/lib/data/birth-profiles', () => ({
  getBirthProfile: mocks.profile,
  ProfileStorageError: class extends Error {},
}));
vi.mock('@/lib/astrology/today', () => ({ buildToday: mocks.today }));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

import TodayPage from './page';

beforeEach(() => {
  vi.resetAllMocks();
});
it('redirects anonymous requests before reading any birth chart', async () => {
  mocks.account.mockResolvedValue(null);
  await expect(TodayPage()).rejects.toThrow('redirect:/login');
  expect(mocks.profile).not.toHaveBeenCalled();
});
it('routes missing profiles and drafts without calculating invented positions', async () => {
  mocks.account.mockResolvedValue({ id: 'member' });
  mocks.profile.mockResolvedValue(null);
  await expect(TodayPage()).rejects.toThrow('redirect:/begin');
  mocks.profile.mockResolvedValue({ chart: null });
  await expect(TodayPage()).rejects.toThrow('redirect:/chart');
  expect(mocks.today).not.toHaveBeenCalled();
});
it('preserves the saved chart when current sky calculation fails', async () => {
  mocks.account.mockResolvedValue({ id: 'member' });
  mocks.profile.mockResolvedValue({ chart: { utc: 'saved' } });
  mocks.today.mockImplementation(() => {
    throw new Error('missing data');
  });
  render(await TodayPage());
  expect(screen.getByText(/saved natal chart is unchanged/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Try again' })).toHaveAttribute('href', '/today');
});
