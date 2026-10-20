import BirthFlow from '@components/BirthFlow/BirthFlow';
import { redirect } from 'next/navigation';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';
import type { BirthInput } from '@/types/chart';

export const metadata = { title: 'Your beginning | Caelum' };
export const dynamic = 'force-dynamic';

export default async function BeginPage() {
  if (!(await getCurrentAccount())) redirect('/login');
  let initial: BirthInput | undefined;
  try {
    initial = (await getBirthProfile())?.birth;
  } catch (error) {
    if (!(error instanceof ProfileStorageError)) throw error;
  }
  return <BirthFlow initial={initial} />;
}
