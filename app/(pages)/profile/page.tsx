import ProfileDetails from '@components/ProfileDetails/ProfileDetails';
import { redirect } from 'next/navigation';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';
import type { ProfileDetails as SavedDetails } from '@/types/chart';

export const metadata = { title: 'Your profile | Caelum' };
export const dynamic = 'force-dynamic';
export default async function ProfilePage() {
  if (!(await getCurrentAccount())) redirect('/login');
  let initial: SavedDetails | undefined;
  try {
    const profile = await getBirthProfile();
    if (!profile) redirect('/begin');
    initial = profile.details;
  } catch (error) {
    if (error instanceof ProfileStorageError) redirect('/begin');
    throw error;
  }
  return <ProfileDetails initial={initial} />;
}
