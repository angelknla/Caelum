import { Temporal } from '@js-temporal/polyfill';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { calculateCalendar } from '@/lib/astrology/calendar';
import { getBirthProfile } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';
import styles from '@/styles/editorial.module.css';

export const metadata = { title: 'Calendar | Caelum' };
export const dynamic = 'force-dynamic';
export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await getCurrentAccount())) redirect('/login');
  const profile = await getBirthProfile();
  if (!profile?.chart) redirect('/chart');
  const params = await searchParams;
  const days = params.days === '7' ? 7 : 30;
  const current = Temporal.Now.plainDateISO(profile.birth.timeZone);
  let startDate = current;
  try { if (typeof params.start === 'string') { const requested = Temporal.PlainDate.from(params.start); if (Math.abs(current.until(requested).days) <= 366) startDate = requested; } } catch { }
  const start = new Date(startDate.toZonedDateTime({ timeZone: profile.birth.timeZone, plainTime: '00:00' }).epochMilliseconds);
  let calendar: ReturnType<typeof calculateCalendar>;
  try { calendar = calculateCalendar(profile.chart, start, days); }
  catch { return <section className={styles.page}><h1>A pause in the sky.</h1><p>The selected calendar could not be calculated.</p><Link href="/calendar">Current calendar</Link></section>; }
  const format = (value: string) => new Intl.DateTimeFormat('en', { timeZone: profile.birth.timeZone, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
  const kind = typeof params.kind === 'string' ? params.kind : 'All';
  const visible = calendar.events.filter(event => kind === 'All' || kind === event.kind);
  const shift = (amount: number) => `/calendar?start=${startDate.add({ days: amount })}&days=${days}`;
  return <article className={styles.page}><header className={styles.heading}><p className={styles.eyebrow}>Today / The days ahead</p><h1>Your sky, unfolding.</h1><p>{startDate.toString()} · {days} days · {profile.birth.timeZone}</p><Link href="/today">Today</Link></header><form className={styles.toolbar}><label className={styles.field}>From<input type="date" name="start" defaultValue={startDate.toString()} /></label><label className={styles.field}>Horizon<select name="days" defaultValue={days}><option value="7">7 days</option><option value="30">30 days</option></select></label><label className={styles.field}>Events<select name="kind" defaultValue={kind}>{['All', 'Lunar phase', 'Moon ingress', 'Station', 'Transit'].map(name => <option key={name}>{name}</option>)}</select></label><button type="submit">View</button></form><nav className={styles.tabs} aria-label="Calendar range"><Link href={shift(-days)}>Previous {days} days</Link><Link href="/calendar">Current</Link><Link href={shift(days)}>Next {days} days</Link></nav>
    <section className={styles.evidence}><h2>A {days}-day reflection</h2><p>The closest sampled contacts in this range, not predictions of events.</p>{calendar.forecast.map(event => <details key={`forecast-${event.id}`} className={styles.item}><summary>{event.title}</summary><p>{event.reflection}</p><p>{event.evidence}</p></details>)}</section><section className={styles.evidence}><h2>Retrograde at the start</h2><p>{calendar.retrogrades.join(', ') || 'None of the ten planets is retrograde.'}</p></section><ol className={styles.list}>{visible.map(event => <li key={event.id} className={styles.item}><span className={styles.tag}>{event.kind} · {format(event.at)}{event.until && ` – ${format(event.until)}`}</span><h2>{event.title}</h2>{event.reflection && <p>{event.reflection}</p>}<details><summary>Calculation evidence</summary><p>{event.evidence}</p></details></li>)}</ol>{!visible.length && <p>No calculated events match this filter.</p>}<footer className={styles.evidence}><p>Transit windows exclude the fast-moving Moon and use six-hour samples, not exact entry, peak, or exit times. Slower contacts can span beyond this range. Lunar phases, lunar ingresses, and stations are numerically solved. Dates use your saved birth timezone; snapshots are not cached across accounts.</p></footer></article>;
}