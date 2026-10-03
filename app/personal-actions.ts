'use server';
import { Temporal } from '@js-temporal/polyfill';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { validateBirth } from '@/lib/astrology/birth';
import { calculateNatal, calculateSky } from '@/lib/astrology/engine';
import { lunarPhase } from '@/lib/astrology/today';
import {
  deleteJournalRecord,
  deletePersonRecord,
  saveJournalEntry,
  savePerson,
} from '@/lib/data/personal';
import { getCurrentAccount } from '@/lib/session';
import type { BirthInput } from '@/types/chart';
import type { JournalEntry } from '@/types/personal';

export type PersonalResult = { error?: string; id?: string };
export async function submitPerson(
  id: string | null,
  name: string,
  relationship: string,
  consent: boolean,
  input: BirthInput,
  draftOnly = false
): Promise<PersonalResult> {
  if (!(await getCurrentAccount())) return { error: 'Sign in before saving.' };
  if (
    consent !== true ||
    typeof name !== 'string' ||
    typeof relationship !== 'string' ||
    !name.trim() ||
    name.trim().length > 120 ||
    relationship.length > 120
  )
    return { error: 'Enter a name and confirm permission to store these details.' };
  try {
    const birth = validateBirth(input);
    const chart = birth.time && !draftOnly ? calculateNatal(birth) : null;
    const savedId = await savePerson(id, {
      name: name.trim(),
      relationship: relationship.trim(),
      birth,
      chart,
    });
    revalidatePath('/people');
    return { id: savedId };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save person.' };
  }
}
export async function submitJournal(
  id: string | null,
  _: PersonalResult,
  form: FormData
): Promise<PersonalResult> {
  if (!(await getCurrentAccount())) return { error: 'Sign in before saving.' };
  const title = String(form.get('title') ?? '').trim();
  const body = String(form.get('body') ?? '').trim();
  const tags = [
    ...new Set(
      String(form.get('tags') ?? '')
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
  let entryDate: string;
  try {
    entryDate = Temporal.PlainDate.from(String(form.get('entry_date'))).toString();
    if (entryDate < '1900-01-01' || entryDate > Temporal.Now.plainDateISO().toString())
      throw new Error();
  } catch {
    return { error: 'Choose an entry date from 1900 through today.' };
  }
  if (
    !title ||
    title.length > 120 ||
    !body ||
    body.length > 50000 ||
    tags.length > 12 ||
    tags.some((tag) => tag.length > 40)
  )
    return { error: 'Check the entry title, text, and tags.' };
  let sky: JournalEntry['sky'] = null;
  if (!id && form.get('sky') === 'on') {
    try {
      const snapshot = calculateSky(new Date());
      const moon = snapshot.positions.find((item) => item.id === 'Moon')!;
      sky = {
        at: snapshot.at,
        moon: `${moon.degree.toFixed(2)}° ${moon.sign}`,
        phase: lunarPhase(snapshot.elongation),
        illumination: snapshot.illumination,
        engine: snapshot.engine,
      };
    } catch {
      return {
        error: 'The current sky could not be calculated. Retry or uncheck the sky snapshot.',
      };
    }
  }
  let savedId: string;
  try {
    savedId = await saveJournalEntry(id, { entry_date: entryDate, title, body, tags }, sky);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save entry.' };
  }
  revalidatePath('/journal');
  redirect(`/journal/${savedId}`);
}
export async function removePerson(id: string): Promise<PersonalResult> {
  try {
    await deletePersonRecord(id);
    revalidatePath('/people');
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not delete person.' };
  }
}
export async function removeJournal(id: string): Promise<PersonalResult> {
  try {
    await deleteJournalRecord(id);
    revalidatePath('/journal');
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not delete entry.' };
  }
}
