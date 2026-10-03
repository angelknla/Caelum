import 'server-only';
import { DATA_REVISION, ENGINE_VERSION } from '@/lib/astrology/engine';
import { getCurrentAccount } from '@/lib/session';
import { getSupabase } from '@/lib/supabase/server';
import type { BirthInput, NatalChart, SavedBirthProfile } from '@/types/chart';

export class ProfileStorageError extends Error {
  constructor() {
    super(
      'Birth profile storage is unavailable. Apply supabase/phase1.sql in the Supabase SQL editor, then try again.'
    );
  }
}

async function ownedClient() {
  const account = await getCurrentAccount();
  if (!account) throw new Error('Sign in before accessing birth details.');
  const client = getSupabase();
  if (!client) throw new ProfileStorageError();
  return { client, memberId: account.memberId };
}

export async function getBirthProfile(): Promise<SavedBirthProfile | null> {
  const { client, memberId } = await ownedClient();
  const { data, error } = await client
    .from('birth_profiles')
    .select('birth, chart, updated_at')
    .eq('member_id', memberId)
    .maybeSingle();
  if (error) throw new ProfileStorageError();
  if (!data) return null;
  const chart = data.chart as NatalChart | null;
  const current =
    chart?.schemaVersion === 1 &&
    chart.provenance?.engine === ENGINE_VERSION &&
    chart.provenance?.dataRevision === DATA_REVISION;
  return {
    birth: data.birth as BirthInput,
    chart: current ? chart : null,
    updatedAt: data.updated_at,
  };
}

export async function saveBirthProfile(birth: BirthInput, chart: NatalChart | null): Promise<void> {
  const { client, memberId } = await ownedClient();
  const { error } = await client
    .from('birth_profiles')
    .upsert(
      { member_id: memberId, birth, chart, updated_at: new Date().toISOString() },
      { onConflict: 'member_id' }
    );
  if (error) throw new ProfileStorageError();
}

export async function saveProfileDetails(
  details: Record<string, string | string[]>
): Promise<void> {
  const { client, memberId } = await ownedClient();
  const { data, error } = await client
    .from('birth_profiles')
    .update({ details, updated_at: new Date().toISOString() })
    .eq('member_id', memberId)
    .select('member_id')
    .maybeSingle();
  if (error || !data) throw new ProfileStorageError();
}
