import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { calculateCalendar, SkyEvent } from '@/lib/astrology/calendar';
import { retrogradeReading } from '@/lib/astrology/calendar-reading';
import editorial from '@/styles/editorial.module.css';
import overview from '@/styles/sky-overview.module.css';
import styles from './CalendarView.module.css';

export const CALENDAR_KINDS = ['All', 'Lunar phase', 'Moon ingress', 'Station', 'Transit'] as const;
type CalendarData = ReturnType<typeof calculateCalendar>;

function EventReading({ event, timeZone }: { event: SkyEvent; timeZone: string }) {
  const format = (value: string) =>
    new Intl.DateTimeFormat('en', {
      timeZone,
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  return (
    <>
      <p className={styles.eventLabel}>
        {event.kind === 'Transit' ? 'Your chart / Sampled window' : 'Shared sky'} ·{' '}
        {format(event.at)}
        {event.until && ` – ${format(event.until)}`}
      </p>
      <h3>{event.reading.title}</h3>
      <p className={styles.position}>{event.title}</p>
      <p>{event.reading.reflection}</p>
      <p>{event.reading.explanation}</p>
      <details>
        <summary>A reflection to take with you</summary>
        <blockquote>{event.reading.prompt}</blockquote>
        <Link
          prefetch={false}
          href={`/journal/new?prompt=${encodeURIComponent(event.reading.prompt)}`}
        >
          Write a reflection <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </details>
      <details>
        <summary>Behind this event</summary>
        <p>{event.evidence}</p>
      </details>
    </>
  );
}

export default function CalendarView({
  calendar,
  timeZone,
  startDate,
  previousHref,
  nextHref,
  kind,
}: {
  calendar: CalendarData;
  timeZone: string;
  startDate: string;
  previousHref: string;
  nextHref: string;
  kind: string;
}) {
  const visible = calendar.events.filter((event) => kind === 'All' || kind === event.kind);
  const localDate = (at: string) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(at));
  const groups = new Map<string, SkyEvent[]>();
  for (const event of visible) {
    const key = localDate(event.at);
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  const dateLabel = (at: string) =>
    new Intl.DateTimeFormat('en', {
      timeZone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date(at));
  const rangeLabel = new Intl.DateTimeFormat('en', {
    timeZone,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).formatRange(new Date(calendar.start), new Date(new Date(calendar.end).getTime() - 1));
  const nearestLunar = calendar.events.find((event) => event.kind === 'Lunar phase');
  const nextStation = calendar.events.find((event) => event.kind === 'Station');
  const highlights = [
    calendar.forecast[0],
    nearestLunar,
    nextStation ?? calendar.forecast[1],
  ].filter((event): event is SkyEvent => Boolean(event));
  return (
    <article className={editorial.page}>
      <section className={overview.surface} data-sky-overview aria-labelledby="calendar-title">
        <p className={overview.eyebrow}>Your chart / The days ahead</p>
        <h1 id="calendar-title" className={overview.title}>
          Your sky,
          <br />
          <span>unfolding.</span>
        </h1>
        <p className={styles.range}>
          {rangeLabel} · {timeZone}
        </p>
        <p className={styles.intro}>
          A little context for the next {calendar.days} days. Personal transits connect the moving
          planets to your birth chart; Moon phases and sign changes describe the sky everyone
          shares. Use the themes to make room for reflection, conversations, and manageable next
          steps.
        </p>
        <nav className={overview.links} aria-label="Calendar sections">
          <a href="#calendar-highlights">
            Worth noticing <ArrowDown size={16} aria-hidden="true" />
          </a>
          <a href="#calendar-timeline">
            Day by day <ArrowDown size={16} aria-hidden="true" />
          </a>
          <Link href="/today">
            Today’s reading <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </nav>
        <form className={`${editorial.toolbar} ${styles.filters}`} action="/calendar">
          <label className={editorial.field}>
            From
            <input type="date" name="start" defaultValue={startDate} />
          </label>
          <label className={editorial.field}>
            Look ahead
            <select name="days" defaultValue={calendar.days}>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
            </select>
          </label>
          <label className={editorial.field}>
            Show
            <select name="kind" defaultValue={kind}>
              {CALENDAR_KINDS.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <button type="submit">View calendar</button>
        </form>
        <nav className={styles.rangeNavigation} aria-label="Calendar range">
          <Link prefetch={false} href={previousHref}>
            <ArrowLeft size={16} aria-hidden="true" /> Previous {calendar.days} days
          </Link>
          <Link
            prefetch={false}
            href={`/calendar?days=${calendar.days}&kind=${encodeURIComponent(kind)}`}
          >
            Current dates
          </Link>
          <Link prefetch={false} href={nextHref}>
            Next {calendar.days} days <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      </section>
      <section
        id="calendar-highlights"
        className={styles.section}
        aria-labelledby="highlights-title"
      >
        <p className={styles.eyebrow}>A few starting points</p>
        <h2 id="highlights-title">Worth noticing.</h2>
        <p className={styles.intro}>
          A close personal contact, a lunar checkpoint, and a change of pace to consider across the
          full range. The dates offer context; your plans and experience still set the direction.
        </p>
        <div className={styles.highlights}>
          {highlights.map((event) => (
            <article className={styles.card} key={event.id}>
              <EventReading event={event} timeZone={timeZone} />
            </article>
          ))}
        </div>
        {!highlights.length && (
          <p>
            No close personal contacts or lunar checkpoints were calculated for this range. Let your
            actual priorities guide your plans.
          </p>
        )}
      </section>
      <section className={styles.section} aria-labelledby="retrogrades-title">
        <p className={styles.eyebrow}>A slower perspective</p>
        <h2 id="retrogrades-title">Room to revisit.</h2>
        <p className={styles.intro}>
          At the start of this range,{' '}
          {calendar.retrogrades.length
            ? `${calendar.retrogrades.join(', ')} ${calendar.retrogrades.length === 1 ? 'is' : 'are'} retrograde.`
            : 'none of the ten planets is retrograde.'}{' '}
          In astrology, apparent backward motion is a cue to review a theme. It does not mean you
          need to postpone your plans.
        </p>
        <div className={styles.retrogrades}>
          {calendar.retrogrades.map((body) => (
            <details key={body}>
              <summary>{body} / What to revisit</summary>
              <p>{retrogradeReading(body)}</p>
            </details>
          ))}
        </div>
      </section>
      <section id="calendar-timeline" className={styles.section} aria-labelledby="timeline-title">
        <p className={styles.eyebrow}>The selected events</p>
        <h2 id="timeline-title">Day by day.</h2>
        <p className={styles.intro}>
          Personal transit windows are grouped by their first sampled date and may continue for
          several days. Lunar events and stations mark a moment. Dates without an entry have no
          events matching this filter.
        </p>
        {[...groups].map(([date, events]) => (
          <section className={styles.day} key={date} aria-labelledby={`day-${date}`}>
            <h3 id={`day-${date}`} className={styles.dayTitle}>
              {dateLabel(events[0].at)}
            </h3>
            <ol className={styles.events}>
              {events.map((event) => (
                <li className={styles.event} key={event.id}>
                  <span className={styles.eyebrow}>{event.kind}</span>
                  <EventReading event={event} timeZone={timeZone} />
                </li>
              ))}
            </ol>
          </section>
        ))}
        {!visible.length && (
          <p className={styles.empty}>
            No calculated events match this filter. Choose “All” above to see the full timeline.
          </p>
        )}
      </section>
      <footer className={styles.record}>
        <details>
          <summary>How to read these dates</summary>
          <p>
            Transit windows exclude the fast-moving Moon and use six-hour samples. Their start and
            end are approximate and clipped to this range; they do not give exact peaks or complete
            transit durations. The highlighted personal contacts are ranked by their smallest
            sampled orb.
          </p>
          <p>
            Lunar phases, lunar ingresses, and stations are numerically solved. Dates use your saved
            birth timezone. These are symbolic astrological reflections, rather than predictions of
            what will happen.
          </p>
        </details>
      </footer>
    </article>
  );
}
