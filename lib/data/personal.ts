import 'server-only';
import { DATA_REVISION, ENGINE_VERSION } from '@/lib/astrology/engine';
import { getCurrentAccount } from '@/lib/session';
import { getSupabase } from '@/lib/supabase/server';
import type { JournalEntry, Person } from '@/types/personal';

export class PersonalStorageError extends Error {
  constructor() {
    super(
      'People and Journal storage is not ready. Run supabase/phase5.sql as a new query in your existing Supabase project.'
    );
  }
}
async function ownedClient() {
  const account = await getCurrentAccount();
  if (!account) throw new Error('Sign in before accessing personal records.');
  const client = getSupabase();
  if (!client) throw new PersonalStorageError();
  return { client, memberId: account.memberId };
}
function checkedId(id: string) {
  if (
    typeof id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    throw new Error('Invalid record identifier.');
  return id;
}
function currentPerson(person: Person): Person {
  const chart = person.chart;
  return {
    ...person,
    chart:
      chart?.schemaVersion === 1 &&
      chart.provenance.engine === ENGINE_VERSION &&
      chart.provenance.dataRevision === DATA_REVISION
        ? chart
        : null,
  };
}
export async function listPeople(): Promise<Person[]> {
  const { client, memberId } = await ownedClient();
  const { data, error } = await client
    .from('people')
    .select('*')
    .eq('member_id', memberId)
    .order('updated_at', { ascending: false })
    .limit(200);
  if (error) throw new PersonalStorageError();
  return (data ?? []).map((person) => currentPerson(person as Person));
}
export async function getPerson(id: string): Promise<Person | null> {
  const { client, memberId } = await ownedClient();
  const { data, error } = await client
    .from('people')
    .select('*')
    .eq('member_id', memberId)
    .eq('id', checkedId(id))
    .maybeSingle();
  if (error) throw new PersonalStorageError();
  return data ? currentPerson(data as Person) : null;
}
export async function savePerson(
  id: string | null,
  person: Pick<Person, 'name' | 'relationship' | 'birth' | 'chart'>
): Promise<string> {
  const { client, memberId } = await ownedClient();
  const values = { ...person, updated_at: new Date().toISOString() };
  const query = id
    ? client.from('people').update(values).eq('member_id', memberId).eq('id', checkedId(id))
    : client
        .from('people')
        .insert({ ...values, member_id: memberId, consent_confirmed_at: new Date().toISOString() });
  const { data, error } = await query.select('id').maybeSingle();
  if (error) throw new PersonalStorageError();
  if (!data) throw new Error('This record is unavailable.');
  return data.id;
}
export async function deletePersonRecord(id: string) {
  const { client, memberId } = await ownedClient();
  const { data, error } = await client
    .from('people')
    .delete()
    .eq('member_id', memberId)
    .eq('id', checkedId(id))
    .select('id')
    .maybeSingle();
  if (error) throw new PersonalStorageError();
  if (!data) throw new Error('This record is unavailable.');
}
export async function listJournal(page = 0, tag = ''): Promise<JournalEntry[]> {
  const { client, memberId } = await ownedClient();
  if (!Number.isInteger(page) || page < 0 || page > 1000 || tag.length > 40)
    throw new Error('Invalid journal filter.');
  let query = client
    .from('journal_entries')
    .select('*')
    .eq('member_id', memberId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (tag) query = query.contains('tags', [tag]);
  const { data, error } = await query.range(page * 20, page * 20 + 19);
  if (error) throw new PersonalStorageError();
  return (data ?? []) as JournalEntry[];
}
export async function getJournalEntry(id: string): Promise<JournalEntry | null> {
  const { client, memberId } = await ownedClient();
  const { data, error } = await client
    .from('journal_entries')
    .select('*')
    .eq('member_id', memberId)
    .eq('id', checkedId(id))
    .maybeSingle();
  if (error) throw new PersonalStorageError();
  return data as JournalEntry | null;
}
export async function saveJournalEntry(
  id: string | null,
  entry: Pick<JournalEntry, 'entry_date' | 'title' | 'body' | 'tags'>,
  sky: JournalEntry['sky']
): Promise<string> {
  const { client, memberId } = await ownedClient();
  const values = { ...entry, updated_at: new Date().toISOString(), ...(id ? {} : { sky }) };
  const query = id
    ? client
        .from('journal_entries')
        .update(values)
        .eq('member_id', memberId)
        .eq('id', checkedId(id))
    : client.from('journal_entries').insert({ ...values, member_id: memberId });
  const { data, error } = await query.select('id').maybeSingle();
  if (error) throw new PersonalStorageError();
  if (!data) throw new Error('This entry is unavailable.');
  return data.id;
}
export async function deleteJournalRecord(id: string) {
  const { client, memberId } = await ownedClient();
  const { data, error } = await client
    .from('journal_entries')
    .delete()
    .eq('member_id', memberId)
    .eq('id', checkedId(id))
    .select('id')
    .maybeSingle();
  if (error) throw new PersonalStorageError();
  if (!data) throw new Error('This entry is unavailable.');
}
