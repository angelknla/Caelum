import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { buildToday } from '@/lib/astrology/today';
import overview from '@/styles/sky-overview.module.css';
import styles from './TodayView.module.css';

type TodayData = ReturnType<typeof buildToday>;

function MoonPhase({ elongation, phase }: { elongation: number; phase: string }) {
  const waxing = elongation <= 180;
  const side = waxing ? 1 : -1;
  const cosine = Math.cos((elongation * Math.PI) / 180);
  const limb = Array.from({ length: 81 }, (_, index) => {
    const vertical = -1 + index / 40;
    return `${100 + side * 90 * Math.sqrt(Math.max(0, 1 - vertical * vertical))},${100 + vertical * 90}`;
  });
  const terminator = Array.from({ length: 81 }, (_, index) => {
    const vertical = 1 - index / 40;
    return `${100 + side * cosine * 90 * Math.sqrt(Math.max(0, 1 - vertical * vertical))},${100 + vertical * 90}`;
  });
  return (
    <svg
      viewBox="0 0 200 200"
      className={styles.moon}
      role="img"
      aria-label={`${phase}; schematic illuminated hemisphere, not an observer-oriented photograph`}
    >
      <defs>
        <clipPath id="today-moon-lit">
          <path d={`M${limb.join(' L')} L${terminator.join(' L')} Z`} />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="90" fill="#090909" stroke="#45433f" />
      <image
        href="/images/moon.jpg"
        x="5"
        y="5"
        width="190"
        height="190"
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#today-moon-lit)"
      />
    </svg>
  );
}

export default function TodayView({ today, timeZone }: { today: TodayData; timeZone: string }) {
  const date = new Intl.DateTimeFormat('en', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const time = new Intl.DateTimeFormat('en', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const eventTime = (value: string) =>
    `${date.format(new Date(value))} · ${time.format(new Date(value))}`;
  return (
    <article className={styles.today} data-today-view>
      <div className={`${overview.surface} ${styles.observatory}`} data-sky-overview>
        <header className={styles.heading}>
          <p className={overview.eyebrow}>{date.format(new Date(today.sky.at))}</p>
          <h1 className={overview.title}>
            Your sky,
            <br />
            <span>today.</span>
          </h1>
          <p className={styles.dailySummary}>{today.summary.text}</p>
          <details className={styles.summaryEvidence}>
            <summary>Behind your daily reading</summary>
            <ul>
              {today.summary.evidence.map((evidence) => (
                <li key={evidence}>{evidence}</li>
              ))}
            </ul>
            <p>Astrological themes to reflect on, rather than a fixed prediction of your day.</p>
          </details>
          <nav className={overview.links} aria-label="Sky views">
            <Link href="/chart">
              Your natal chart <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/calendar">
              The days ahead <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </nav>
        </header>
        <section className={styles.lunar} aria-labelledby="moon-title">
          <p className={styles.eyebrow}>The Moon / Now</p>
          <div className={styles.moonArtwork}>
            <MoonPhase elongation={today.sky.elongation} phase={today.phase} />
            <span className={styles.illumination}>
              {(today.sky.illumination * 100).toFixed(0)}
              <small>% lit</small>
            </span>
          </div>
          <div className={styles.lunarInfo}>
            <h2 id="moon-title">{today.phase}</h2>
            <p className={styles.moonPosition}>
              {today.moon.degree.toFixed(2)}° {today.moon.sign} ·{' '}
              {(today.sky.illumination * 100).toFixed(1)}% illuminated
            </p>
            <details className={styles.lunarEvents}>
              <summary>Next in the sky</summary>
              <dl>
                <dt>Next exact phase</dt>
                <dd>
                  {today.events.nextPhase.name}
                  <small>{eventTime(today.events.nextPhase.at)}</small>
                </dd>
                <dt>Next sign ingress</dt>
                <dd>
                  Moon enters {today.events.ingress.sign}
                  <small>{eventTime(today.events.ingress.at)}</small>
                </dd>
              </dl>
            </details>
          </div>
        </section>
      </div>
      <div className={styles.focuses}>
        {today.focus.map((focus, index) => {
          const reading = (
            <section key={focus.id} className={styles.focus} aria-labelledby={`focus-${focus.id}`}>
              <div className={styles.focusLabel}>
                <span aria-hidden="true">0{index + 1}</span>
                <p>{focus.label}</p>
              </div>
              <div className={styles.focusContent}>
                <h2 id={`focus-${focus.id}`}>{focus.title}</h2>
                <p className={styles.reflection}>{focus.reflection}</p>
                <p className={styles.reflection}>{focus.explanation}</p>
                <blockquote>{focus.prompt}</blockquote>
                <Link href={`/journal/new?prompt=${encodeURIComponent(focus.prompt)}`}>
                  Write a reflection
                </Link>
                <details>
                  <summary>Why this reflection?</summary>
                  <ul>
                    {focus.evidence.map((evidence) => (
                      <li key={evidence}>{evidence}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </section>
          );
          return index < 2 ? (
            reading
          ) : (
            <details key={focus.id} className={styles.secondary}>
              <summary>{focus.label}</summary>
              {reading}
            </details>
          );
        })}
      </div>
      <footer className={styles.record}>
        <p className={styles.snapshot}>
          Updated at {time.format(new Date(today.sky.at))} · {timeZone}
        </p>
        <details>
          <summary>Calculation &amp; interpretation record</summary>
          <p>
            Geocentric tropical positions from {today.sky.engine}. Data revision:{' '}
            {today.sky.dataRevision}. Snapshot: {today.sky.at}. Transit targets remain fixed at
            birth; applying or separating is determined by a one-minute speed projection. Contacts
            are sampled now, not all-day events or transit windows.
          </p>
          <p>
            Dates use your saved birth timezone, not a detected current location. Exact phase events
            solve Moon–Sun elongation at 0°, 90°, 180°, and 270°. Ingress solves the next 30° lunar
            longitude boundary. Event times are approximate to a second; phase labels use eight
            equal sectors. Illumination comes from Swiss Ephemeris; artwork is a schematic phase
            mask, not a view from your location.
          </p>
          <p>
            Reflections use transparent symbolic rules, not scientifically validated personality
            assessments. No journal entry or daily record is stored automatically.
          </p>
          <p>
            Moon image:{' '}
            <a href="https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg">Gregory H. Revera</a>
            , <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>; displayed
            with a schematic illumination mask.
          </p>
        </details>
        <Link href="/profile">Personal details</Link>
        <span> · </span>
        <Link href="/begin">Birth details</Link>
      </footer>
    </article>
  );
}
