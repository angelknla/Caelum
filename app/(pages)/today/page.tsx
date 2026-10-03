import TodayView from '@components/TodayView/TodayView';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildToday } from '@/lib/astrology/today';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';

export const metadata = { title: 'Today | Caelum' };
export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  if (!(await getCurrentAccount())) redirect('/login');
  let profile: Awaited<ReturnType<typeof getBirthProfile>>;
  try {
    profile = await getBirthProfile();
  } catch (error) {
    if (!(error instanceof ProfileStorageError)) throw error;
    return (
      <section>
        <h1>Your sky is waiting.</h1>
        <p>Birth profile storage is not ready yet.</p>
        <Link href="/begin">Birth details</Link>
      </section>
    );
  }
  if (!profile) redirect('/begin');
  if (!profile.chart) redirect('/chart');
  let today: ReturnType<typeof buildToday>;
  try {
    today = buildToday(profile.chart);
  } catch {
    return (
      <section>
        <h1>A pause in the sky.</h1>
        <p>Today&apos;s calculation is unavailable. Your saved natal chart is unchanged.</p>
        <Link href="/today">Try again</Link>
        <p>
          <Link href="/chart">Your natal chart</Link>
        </p>
      </section>
    );
  }
  return <TodayView today={today} timeZone={profile.birth.timeZone} />;
}
