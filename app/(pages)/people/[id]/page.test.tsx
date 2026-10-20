import type PersonSky from '@components/PersonSky/PersonSky';
import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  account: vi.fn(),
  person: vi.fn(),
  profile: vi.fn(),
  today: vi.fn(),
  compare: vi.fn(),
  sky: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ getCurrentAccount: mocks.account }));
vi.mock('@/lib/data/personal', () => ({
  getPerson: mocks.person,
  PersonalStorageError: class extends Error {},
}));
vi.mock('@/lib/data/birth-profiles', () => ({
  getBirthProfile: mocks.profile,
  ProfileStorageError: class extends Error {},
}));
vi.mock('@/lib/astrology/today', () => ({ buildToday: mocks.today }));
vi.mock('@/lib/astrology/synastry', () => ({ compareCharts: mocks.compare }));
vi.mock('@components/DeleteRecord/DeleteRecord', () => ({ default: () => null }));
vi.mock('@components/PersonSky/PersonSky', () => ({
  default: (props: Parameters<typeof PersonSky>[0]) => {
    mocks.sky(props);
    return <div>Personal sky</div>;
  },
}));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
  notFound: () => {
    throw new Error('not-found');
  },
}));

import { ProfileStorageError } from '@/lib/data/birth-profiles';
import { PersonalStorageError } from '@/lib/data/personal';
import PersonPage from './page';

const person = {
  id: 'person-id',
  name: 'Alex',
  relationship: 'Friend',
  birth: { date: '2000-01-01', time: '12:00', place: 'Greenwich' },
  chart: { utc: 'person-chart' },
};
const request = () => PersonPage({ params: Promise.resolve({ id: person.id }) });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.account.mockResolvedValue({ memberId: 'viewer' });
  mocks.person.mockResolvedValue(person);
  mocks.profile.mockResolvedValue({ chart: { utc: 'viewer-chart' } });
  mocks.today.mockReturnValue({ summary: { text: 'Daily reading' } });
  mocks.compare.mockReturnValue([{ name: 'Trine' }]);
});

it('authenticates before accessing a person and rejects missing or unowned records', async () => {
  mocks.account.mockResolvedValue(null);
  await expect(request()).rejects.toThrow('redirect:/login');
  expect(mocks.person).not.toHaveBeenCalled();
  expect(mocks.today).not.toHaveBeenCalled();
  mocks.account.mockResolvedValue({ memberId: 'viewer' });
  mocks.person.mockResolvedValue(null);
  await expect(request()).rejects.toThrow('not-found');
  expect(mocks.profile).not.toHaveBeenCalled();
  expect(mocks.today).not.toHaveBeenCalled();
});

it('calculates the daily sky from this person and compares the viewer chart to theirs', async () => {
  render(await request());
  expect(mocks.person).toHaveBeenCalledWith(person.id);
  expect(mocks.today).toHaveBeenCalledWith(person.chart);
  expect(mocks.compare).toHaveBeenCalledWith({ utc: 'viewer-chart' }, person.chart);
  expect(mocks.sky).toHaveBeenCalledWith(
    expect.objectContaining({
      person,
      comparisonAvailable: true,
      today: mocks.today.mock.results[0].value,
    })
  );
  expect(screen.getByRole('link', { name: 'Edit person' })).toHaveAttribute(
    'href',
    `/people/${person.id}/edit`
  );
});

it('does not invent a daily sky or comparison for an incomplete birth chart', async () => {
  mocks.person.mockResolvedValue({ ...person, chart: null });
  render(await request());
  expect(mocks.today).not.toHaveBeenCalled();
  expect(mocks.profile).not.toHaveBeenCalled();
  expect(mocks.compare).not.toHaveBeenCalled();
  expect(mocks.sky).toHaveBeenCalledWith(
    expect.objectContaining({ today: null, contacts: [], comparisonAvailable: false })
  );
});

it('keeps the saved person chart available when the daily calculation fails', async () => {
  mocks.today.mockImplementation(() => {
    throw new Error('ephemeris unavailable');
  });
  render(await request());
  expect(mocks.sky).toHaveBeenCalledWith(
    expect.objectContaining({ person, today: null, comparisonAvailable: true })
  );
});

it('shows their daily sky even when the viewer chart is missing or storage is unavailable', async () => {
  for (const profile of [null, { chart: null }, new ProfileStorageError()]) {
    if (profile instanceof Error) mocks.profile.mockRejectedValue(profile);
    else mocks.profile.mockResolvedValue(profile);
    render(await request());
    expect(mocks.sky).toHaveBeenLastCalledWith(
      expect.objectContaining({
        person,
        today: mocks.today.mock.results[0].value,
        comparisonAvailable: false,
        contacts: [],
      })
    );
  }
  expect(mocks.compare).not.toHaveBeenCalled();
});

it('retains the person storage error state and propagates unexpected failures', async () => {
  const error = new PersonalStorageError();
  error.message = 'Person storage unavailable';
  mocks.person.mockRejectedValue(error);
  render(await request());
  expect(screen.getByText(error.message)).toBeInTheDocument();
  expect(mocks.today).not.toHaveBeenCalled();
  mocks.person.mockRejectedValue(new Error('unexpected'));
  await expect(request()).rejects.toThrow('unexpected');
});
