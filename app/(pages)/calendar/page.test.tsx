import type CalendarView from '@components/CalendarView/CalendarView';
import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  account: vi.fn(),
  profile: vi.fn(),
  calendar: vi.fn(),
  view: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ getCurrentAccount: mocks.account }));
vi.mock('@/lib/data/birth-profiles', () => ({
  getBirthProfile: mocks.profile,
  ProfileStorageError: class extends Error {},
}));
vi.mock('@/lib/astrology/calendar', () => ({ calculateCalendar: mocks.calendar }));
vi.mock('@components/CalendarView/CalendarView', () => ({
  CALENDAR_KINDS: ['All', 'Lunar phase', 'Moon ingress', 'Station', 'Transit'],
  default: (props: Parameters<typeof CalendarView>[0]) => {
    mocks.view(props);
    return <div>Calendar</div>;
  },
}));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

import CalendarPage from './page';

const request = (params: Record<string, string> = {}) =>
  CalendarPage({ searchParams: Promise.resolve(params) });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.account.mockResolvedValue({ memberId: 'member' });
  mocks.profile.mockResolvedValue({
    birth: { timeZone: 'Europe/London' },
    chart: { utc: 'saved' },
  });
  mocks.calendar.mockReturnValue({ events: [] });
});

it('authenticates before accessing personal charts and requires a complete chart', async () => {
  mocks.account.mockResolvedValue(null);
  await expect(request()).rejects.toThrow('redirect:/login');
  expect(mocks.profile).not.toHaveBeenCalled();
  mocks.account.mockResolvedValue({ memberId: 'member' });
  mocks.profile.mockResolvedValue({ chart: null });
  await expect(request()).rejects.toThrow('redirect:/chart');
  expect(mocks.calendar).not.toHaveBeenCalled();
});

it('uses local midnight and preserves the horizon and event filter between ranges', async () => {
  render(await request({ start: '2026-10-21', days: '7', kind: 'Station' }));
  expect(mocks.calendar).toHaveBeenCalledWith(
    { utc: 'saved' },
    new Date('2026-10-20T23:00:00Z'),
    7,
    'Europe/London'
  );
  expect(mocks.view).toHaveBeenCalledWith(
    expect.objectContaining({
      kind: 'Station',
      startDate: '2026-10-21',
      previousHref: '/calendar?start=2026-10-14&days=7&kind=Station',
      nextHref: '/calendar?start=2026-10-28&days=7&kind=Station',
    })
  );
});

it('falls back safely from invalid dates and unknown event filters', async () => {
  render(await request({ start: 'not-a-date', days: '500', kind: 'Unknown' }));
  expect(mocks.calendar.mock.calls[0][2]).toBe(30);
  expect(mocks.view).toHaveBeenCalledWith(expect.objectContaining({ kind: 'All' }));
});
