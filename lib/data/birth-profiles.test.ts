import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('sweph', () => {
  throw new Error('Profile storage must not load the native calculation engine.');
});
const mocks = vi.hoisted(() => ({
  account: vi.fn(),
  from: vi.fn(),
  eq: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
  single: vi.fn(),
  select: vi.fn(),
}));
vi.mock('@/lib/session', () => ({ getCurrentAccount: mocks.account }));
vi.mock('@/lib/supabase/server', () => ({ getSupabase: () => ({ from: mocks.from }) }));

import type { BirthInput } from '@/types/chart';
import { getBirthProfile, saveBirthProfile, saveProfileDetails } from './birth-profiles';

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
  const query = {
    select: mocks.select,
    eq: mocks.eq,
    maybeSingle: mocks.single,
    upsert: mocks.upsert,
    update: mocks.update,
  };
  mocks.from.mockReturnValue(query);
  mocks.select.mockReturnValue(query);
  mocks.eq.mockReturnValue(query);
  mocks.update.mockReturnValue(query);
  mocks.single.mockResolvedValue({ data: null, error: null });
  mocks.upsert.mockResolvedValue({ error: null });
});

describe('custom-session profile ownership', () => {
  it('rejects anonymous reads and writes before querying', async () => {
    mocks.account.mockResolvedValue(null);
    await expect(getBirthProfile()).rejects.toThrow('Sign in');
    await expect(saveBirthProfile(birth, null)).rejects.toThrow('Sign in');
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('scopes reads and writes to each verified account', async () => {
    for (const memberId of ['account-a', 'account-b']) {
      mocks.account.mockResolvedValue({ memberId });
      await getBirthProfile();
      expect(mocks.eq).toHaveBeenLastCalledWith('member_id', memberId);
      await saveBirthProfile(birth, null);
      expect(mocks.upsert).toHaveBeenLastCalledWith(
        expect.objectContaining({ member_id: memberId, birth, chart: null }),
        { onConflict: 'member_id' }
      );
    }
  });
  it('scopes optional details updates and reports unavailable storage', async () => {
    mocks.account.mockResolvedValue({ memberId: 'account-a' });
    mocks.single.mockResolvedValue({ data: { member_id: 'account-a' }, error: null });
    await saveProfileDetails({ nickname: 'A' });
    expect(mocks.eq).toHaveBeenLastCalledWith('member_id', 'account-a');
    mocks.single.mockResolvedValue({ data: null, error: { code: '42P01' } });
    await expect(getBirthProfile()).rejects.toThrow('phase1.sql');
  });
  it('returns saved details with the owned birth profile', async () => {
    mocks.account.mockResolvedValue({ memberId: 'account-a' });
    const details = { nickname: 'Sky', interests: ['Career'], experience: 'familiar' };
    mocks.single.mockResolvedValue({
      data: { birth, chart: null, details, updated_at: '2026-10-13' },
      error: null,
    });
    await expect(getBirthProfile()).resolves.toMatchObject({ birth, details });
    expect(mocks.select).toHaveBeenCalledWith('birth, chart, details, updated_at');
    expect(mocks.eq).toHaveBeenCalledWith('member_id', 'account-a');
  });
});
