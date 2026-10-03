import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const mocks = vi.hoisted(() => ({
  account: vi.fn(),
  from: vi.fn(),
  eq: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  single: vi.fn(),
  select: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  range: vi.fn(),
  contains: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ getCurrentAccount: mocks.account }));
vi.mock('@/lib/supabase/server', () => ({ getSupabase: () => ({ from: mocks.from }) }));

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
const birth = {
  date: '2000-01-01',
  time: null,
  timeZone: 'UTC',
  disambiguation: 'reject' as const,
  latitude: 0,
  longitude: 0,
  place: 'Test',
  placeSource: 'manual',
};
beforeEach(() => {
  vi.clearAllMocks();
  const query = {
    select: mocks.select,
    eq: mocks.eq,
    insert: mocks.insert,
    update: mocks.update,
    delete: mocks.remove,
    maybeSingle: mocks.single,
    order: mocks.order,
    limit: mocks.limit,
    range: mocks.range,
    contains: mocks.contains,
  };
  for (const method of [
    mocks.from,
    mocks.select,
    mocks.eq,
    mocks.insert,
    mocks.update,
    mocks.remove,
    mocks.order,
    mocks.contains,
  ])
    method.mockReturnValue(query);
  mocks.single.mockResolvedValue({ data: { id, chart: null }, error: null });
  mocks.limit.mockResolvedValue({ data: [], error: null });
  mocks.range.mockResolvedValue({ data: [], error: null });
});
it('rejects anonymous personal reads and mutations before querying', async () => {
  mocks.account.mockResolvedValue(null);
  await expect(listPeople()).rejects.toThrow('Sign in');
  await expect(listJournal()).rejects.toThrow('Sign in');
  await expect(deletePersonRecord(id)).rejects.toThrow('Sign in');
  await expect(deleteJournalRecord(id)).rejects.toThrow('Sign in');
  expect(mocks.from).not.toHaveBeenCalled();
});
it('scopes list, reads, edits, and deletes to both verified ownership and record ID', async () => {
  for (const memberId of ['owner-a', 'owner-b']) {
    mocks.account.mockResolvedValue({ memberId });
    await listPeople();
    await listJournal();
    await getPerson(id);
    await getJournalEntry(id);
    await savePerson(id, { name: 'Test', relationship: '', birth, chart: null });
    await saveJournalEntry(
      id,
      { entry_date: '2026-10-03', title: 'Test', body: 'Private', tags: [] },
      null
    );
    await deletePersonRecord(id);
    await deleteJournalRecord(id);
    expect(mocks.eq).toHaveBeenCalledWith('member_id', memberId);
    expect(mocks.eq).toHaveBeenLastCalledWith('id', id);
    expect(mocks.insert).not.toHaveBeenCalled();
  }
});
it('assigns new records to the session owner, never an owner from the browser', async () => {
  mocks.account.mockResolvedValue({ memberId: 'verified-owner' });
  await savePerson(null, { name: 'Test', relationship: '', birth, chart: null });
  expect(mocks.insert).toHaveBeenLastCalledWith(
    expect.objectContaining({ member_id: 'verified-owner' })
  );
  await saveJournalEntry(
    null,
    { entry_date: '2026-10-03', title: 'Test', body: 'Private', tags: [] },
    null
  );
  expect(mocks.insert).toHaveBeenLastCalledWith(
    expect.objectContaining({ member_id: 'verified-owner' })
  );
});
it('rejects absent records, invalid IDs, and unavailable tables', async () => {
  mocks.account.mockResolvedValue({ memberId: 'owner' });
  mocks.single.mockResolvedValue({ data: null, error: null });
  await expect(deletePersonRecord(id)).rejects.toThrow('unavailable');
  await expect(getJournalEntry('bad-id')).rejects.toThrow('Invalid');
  mocks.limit.mockResolvedValue({ data: null, error: { code: '42P01' } });
  await expect(listPeople()).rejects.toThrow('phase5.sql');
});
