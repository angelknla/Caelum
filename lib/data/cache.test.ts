import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  account: vi.fn(),
  query: vi.fn(),
  entries: new Map<string, { value: unknown; tag: string; expires: number }>(),
  tags: vi.fn(),
}));
vi.mock('server-only', () => ({}));
// Model Next's persistent key/tag contract; integration checks exercise Next itself.
vi.mock('next/cache', () => ({
  unstable_cache:
    (
      load: () => Promise<unknown>,
      parts: string[],
      options: { tags: string[]; revalidate: number }
    ) =>
    async () => {
      const key = JSON.stringify(parts);
      const entry = mocks.entries.get(key);
      if (entry && entry.expires > Date.now()) return entry.value;
      const value = await load();
      mocks.entries.set(key, {
        value,
        tag: options.tags[0],
        expires: Date.now() + options.revalidate * 1000,
      });
      return value;
    },
  updateTag: (tag: string) => {
    mocks.tags(tag);
    for (const [key, entry] of mocks.entries) if (entry.tag === tag) mocks.entries.delete(key);
  },
}));
vi.mock('@/lib/session', () => ({ getCurrentAccount: mocks.account }));
vi.mock('@/lib/supabase/server', () => ({
  getSupabase: () => ({
    from: () => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
        contains: () => chain,
        update: () => chain,
        insert: () => chain,
        delete: () => chain,
        upsert: mocks.query,
        maybeSingle: mocks.query,
        range: mocks.query,
        limit: mocks.query,
      };
      return chain;
    },
  }),
}));

import type { BirthInput } from '@/types/chart';
import { getBirthProfile, saveBirthProfile, saveProfileDetails } from './birth-profiles';
import {
  deleteJournalRecord,
  deletePersonRecord,
  getJournalEntry,
  getPerson,
  listJournal,
  listPeople,
  saveJournalEntry,
  savePerson,
} from './personal';

const id = '00000000-0000-4000-8000-000000000001';
const birth: BirthInput = {
  date: '2000-01-01',
  time: null,
  timeZone: 'UTC',
  disambiguation: 'reject',
  latitude: 0,
  longitude: 0,
  place: 'Test',
  placeSource: 'manual',
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.entries.clear();
  mocks.account.mockResolvedValue({ memberId: 'a' });
  mocks.query.mockResolvedValue({
    data: { birth, chart: null, id, updated_at: 'first' },
    error: null,
  });
});
afterEach(() => vi.useRealTimers());

it('deduplicates concurrent and subsequent profile reads while verifying access on every call', async () => {
  await Promise.all([getBirthProfile(), getBirthProfile(), getBirthProfile()]);
  await getBirthProfile();
  expect(mocks.query).toHaveBeenCalledTimes(1);
  expect(mocks.account).toHaveBeenCalledTimes(4);
  mocks.account.mockResolvedValue(null);
  await expect(getBirthProfile()).rejects.toThrow('Sign in');
});

it('isolates owners, records, journal pages, and tags', async () => {
  await getPerson(id);
  mocks.account.mockResolvedValue({ memberId: 'b' });
  await getPerson(id);
  await getPerson('00000000-0000-4000-8000-000000000002');
  mocks.query.mockResolvedValue({ data: [], error: null });
  await listJournal();
  await listJournal(1);
  await listJournal(1, 'work');
  await listJournal(1, 'work');
  expect(mocks.query).toHaveBeenCalledTimes(6);
});

it('reuses reads for fifteen minutes, then expires old data without caching failures', async () => {
  vi.useFakeTimers();
  await getBirthProfile();
  vi.advanceTimersByTime(899999);
  await getBirthProfile();
  expect(mocks.query).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(1);
  mocks.query.mockResolvedValueOnce({ data: null, error: { code: 'offline' } });
  await expect(getBirthProfile()).rejects.toThrow('storage');
  await getBirthProfile();
  expect(mocks.query).toHaveBeenCalledTimes(3);
});

it('invalidates profile, list, detail and filter reads after every successful edit or deletion', async () => {
  await getBirthProfile();
  await saveBirthProfile(birth, null);
  await getBirthProfile();
  await saveProfileDetails({ nickname: 'New' });
  await getBirthProfile();
  expect(mocks.query).toHaveBeenCalledTimes(5);
  for (const [read, mutations, scope] of [
    [
      () => getPerson(id),
      [
        () => savePerson(id, { name: 'New', relationship: '', birth, chart: null }),
        () => deletePersonRecord(id),
      ],
      'people',
    ],
    [
      () => getJournalEntry(id),
      [
        () =>
          saveJournalEntry(
            id,
            { title: 'New', body: 'Text', tags: [], entry_date: '2026-10-20' },
            null
          ),
        () => deleteJournalRecord(id),
      ],
      'journal',
    ],
  ] as const) {
    await read();
    for (const mutate of mutations) {
      await mutate();
      const count = mocks.query.mock.calls.length;
      await read();
      expect(mocks.query).toHaveBeenCalledTimes(count + 1);
      expect(mocks.tags).toHaveBeenLastCalledWith(`caelum:${scope}:a`);
    }
  }
  mocks.query.mockResolvedValue({ data: [], error: null });
  await listPeople();
  await listJournal(0, 'work');
  await listJournal(1, 'work');
  mocks.query.mockResolvedValue({ data: { id }, error: null });
  await deletePersonRecord(id);
  await deleteJournalRecord(id);
  mocks.query.mockResolvedValue({ data: [], error: null });
  const count = mocks.query.mock.calls.length;
  await listPeople();
  await listJournal(0, 'work');
  await listJournal(1, 'work');
  expect(mocks.query).toHaveBeenCalledTimes(count + 3);
});

it('keeps cached reads after an unsuccessful write', async () => {
  await getBirthProfile();
  mocks.query.mockResolvedValue({ data: null, error: { code: 'offline' } });
  await expect(saveBirthProfile(birth, null)).rejects.toThrow('storage');
  await getBirthProfile();
  expect(mocks.query).toHaveBeenCalledTimes(2);
  expect(mocks.tags).not.toHaveBeenCalled();
});
