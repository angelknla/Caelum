'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { validateBirth } from '@/lib/astrology/birth';
import { calculateNatal } from '@/lib/astrology/engine';
import {
  ProfileStorageError,
  saveBirthProfile,
  saveProfileDetails,
} from '@/lib/data/birth-profiles';
import { searchPlaces } from '@/lib/places';
import { getCurrentAccount } from '@/lib/session';
import type { BirthInput } from '@/types/chart';

export async function findBirthplaces(query: string) {
  if (!(await getCurrentAccount())) return { places: [], error: 'Sign in to search birthplaces.' };
  try {
    return { places: await searchPlaces(query) };
  } catch {
    return {
      places: [],
      error: 'Place search is unavailable. You can enter coordinates and timezone manually.',
    };
  }
}

export async function submitBirth(
  input: BirthInput,
  draftOnly = false
): Promise<{ error?: string }> {
  if (!(await getCurrentAccount()))
    return { error: 'Your session ended. Sign in again before saving.' };
  try {
    const birth = validateBirth(input);
    const chart = birth.time && !draftOnly ? calculateNatal(birth) : null;
    await saveBirthProfile(birth, chart);
  } catch (error) {
    if (error instanceof ProfileStorageError) return { error: error.message };
    return { error: error instanceof Error ? error.message : 'Could not save birth details.' };
  }
  revalidatePath('/');
  revalidatePath('/chart');
  revalidatePath('/today');
  redirect('/chart');
}

export async function submitDetails(
  _: { error?: string },
  form: FormData
): Promise<{ error?: string }> {
  if (!(await getCurrentAccount())) return { error: 'Sign in before saving.' };
  const text = (name: string) => String(form.get(name) ?? '').trim();
  const details = {
    nickname: text('nickname'),
    currentLocation: text('currentLocation'),
    pronouns: text('pronouns'),
    experience: text('experience'),
    interests: form.getAll('interests').map(String),
  };
  const choices = [
    'Love',
    'Career',
    'Money',
    'Personal growth',
    'Family',
    'Friendships',
    'Creativity',
    'Spirituality',
  ];
  if (
    [details.nickname, details.currentLocation, details.pronouns].some(
      (value) => value.length > 120
    ) ||
    !['beginner', 'familiar', 'advanced', 'nerd'].includes(details.experience) ||
    details.interests.some((value) => !choices.includes(value))
  )
    return { error: 'Check your profile details.' };
  try {
    await saveProfileDetails(details);
  } catch (error) {
    return {
      error: error instanceof ProfileStorageError ? error.message : 'Could not save your profile.',
    };
  }
  redirect('/chart');
}
