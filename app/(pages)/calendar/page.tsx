import CalendarView, { CALENDAR_KINDS } from '@components/CalendarView/CalendarView';
import { Temporal } from '@js-temporal/polyfill';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { calculateCalendar } from '@/lib/astrology/calendar';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';

export const metadata = { title: 'Calendar | Caelum' };
export const dynamic = 'force-dynamic';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await getCurrentAccount())) redirect('/login');
  let profile: Awaited<ReturnType<typeof getBirthProfile>>;
  try {
    profile = await getBirthProfile();
  } catch (error) {
    if (!(error instanceof ProfileStorageError)) throw error;
    return (
      <section className={styles.page}>
        <h1>Your sky is waiting.</h1>
        <p>Birth profile storage is not ready yet.</p>
        <Link href="/begin">Birth details</Link>
      </section>
    );
  }
  if (!profile?.chart) redirect('/chart');
  const params = await searchParams;
  const days = params.days === '7' ? 7 : 30;
  const current = Temporal.Now.plainDateISO(profile.birth.timeZone);
  let startDate = current;
  try {
    if (typeof params.start === 'string') {
      const requested = Temporal.PlainDate.from(params.start);
      if (Math.abs(current.until(requested).days) <= 366) startDate = requested;
    }
  } catch {
    // Invalid dates fall back to the current local date.
  }
  const start = new Date(
    startDate.toZonedDateTime({ timeZone: profile.birth.timeZone, plainTime: '00:00' })
      .epochMilliseconds
  );
  let calendar: ReturnType<typeof calculateCalendar>;
  try {
    calendar = calculateCalendar(profile.chart, start, days, profile.birth.timeZone);
  } catch {
    return (
      <section className={styles.page}>
        <h1>A pause in the sky.</h1>
        <p>
          The selected calendar could not be calculated. Your saved birth chart is still available.
        </p>
        <Link href="/calendar">Current calendar</Link>
      </section>
    );
  }
  const kind = CALENDAR_KINDS.find((name) => name === params.kind) ?? 'All';
  const shift = (amount: number) =>
    `/calendar?start=${startDate.add({ days: amount })}&days=${days}&kind=${encodeURIComponent(kind)}`;
  return (
    <CalendarView
      calendar={calendar}
      timeZone={profile.birth.timeZone}
      startDate={startDate.toString()}
      kind={kind}
      previousHref={shift(-days)}
      nextHref={shift(days)}
    />
  );
}
