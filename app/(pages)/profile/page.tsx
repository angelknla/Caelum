import ProfileDetails from '@components/ProfileDetails/ProfileDetails';
import { redirect } from 'next/navigation';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';

export const metadata = { title: 'Beyond the chart | Caelum' };
export const dynamic = 'force-dynamic';
export default async function ProfilePage() {
  if (!(await getCurrentAccount())) redirect('/login');
  try { if (!(await getBirthProfile())) redirect('/begin'); }
  catch (error) { if (error instanceof ProfileStorageError) redirect('/begin'); throw error; }
  return <ProfileDetails />;
}