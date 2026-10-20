import ChartWheel from '@components/ChartWheel/ChartWheel';
import { HOUSE_READINGS, placementReading } from '@/lib/astrology/natal-reading';
import type { compareCharts } from '@/lib/astrology/synastry';
import type { buildToday } from '@/lib/astrology/today';
import type { Person } from '@/types/personal';
import styles from './PersonSky.module.css';

type TodayData = ReturnType<typeof buildToday>;
type Contacts = ReturnType<typeof compareCharts>;

function DailySky({ person, today }: { person: Person; today: TodayData | null }) {
  const date = today
    ? new Intl.DateTimeFormat('en', {
        timeZone: person.birth.timeZone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date(today.sky.at))
    : null;
  const time = today
    ? new Intl.DateTimeFormat('en', {
        timeZone: person.birth.timeZone,
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(today.sky.at))
    : null;
  return (
    <section id="person-today" className={styles.section} aria-labelledby="person-today-title">
      <p className={styles.eyebrow}>{date ? `${date} / Today` : 'Today'}</p>
      <h2 id="person-today-title">{person.name}&rsquo;s sky, today.</h2>
      {today ? (
        <>
          <div className={styles.dailyGrid}>
            <div>
              <p className={styles.intro}>
                A reading for {person.name}, based on their saved birth chart. Read it as a
                reflection addressed to them.
              </p>
              <p className={styles.dailySummary}>{today.summary.text}</p>
              <details>
                <summary>Behind this daily reading</summary>
                <ul>
                  {today.summary.evidence.map((evidence) => (
                    <li key={evidence}>
                      {evidence.replace('your birth chart', `${person.name}’s birth chart`)}
                    </li>
                  ))}
                </ul>
                <p>
                  These are astrological themes for reflection. Ask what fits their experience
                  rather than assuming how they feel.
                </p>
              </details>
              <p className={styles.meta}>
                Updated at {time} · {person.birth.timeZone} · Dates use their saved birth timezone.
              </p>
            </div>
            <aside className={styles.moon} aria-label="Current Moon">
              <p className={styles.eyebrow}>The Moon / Now</p>
              <p className={styles.percentage}>
                {(today.sky.illumination * 100).toFixed(0)}
                <small>% lit</small>
              </p>
              <h3>{today.phase}</h3>
              <p>
                {today.moon.degree.toFixed(2)}° {today.moon.sign}
              </p>
            </aside>
          </div>
          <div className={styles.dailyFocus}>
            {today.focus
              .filter((focus) => ['opportunity', 'care'].includes(focus.id))
              .map((focus) => (
                <details key={focus.id}>
                  <summary>
                    {focus.label} / {focus.title}
                  </summary>
                  <p>{focus.reflection}</p>
                  <blockquote>{focus.prompt}</blockquote>
                  <ul>
                    {focus.evidence.map((evidence) => (
                      <li key={evidence}>{evidence}</li>
                    ))}
                  </ul>
                </details>
              ))}
          </div>
        </>
      ) : (
        <p className={styles.intro}>
          Today&rsquo;s sky could not be calculated right now. Their saved natal chart is still
          available.
        </p>
      )}
    </section>
  );
}

export default function PersonSky({
  person,
  today,
  contacts,
  comparisonAvailable,
}: {
  person: Person;
  today: TodayData | null;
  contacts: Contacts;
  comparisonAvailable: boolean;
}) {
  const chart = person.chart;
  const core = chart
    ? [
        chart.placements.find((body) => body.id === 'Sun')!,
        chart.placements.find((body) => body.id === 'Moon')!,
        chart.angles.ascendant,
      ]
    : [];
  const highlights = contacts.slice(0, 3);
  return (
    <>
      {chart ? (
        <>
          <nav className={styles.navigation} aria-label="Person’s sky sections">
            <a href="#person-today">Today&rsquo;s sky</a>
            <a href="#person-chart">Natal chart</a>
            <a href="#person-core">Sun, Moon &amp; rising</a>
            <a href="#person-comparison">Between your skies</a>
          </nav>
          <DailySky person={person} today={today} />
          <section
            id="person-chart"
            className={styles.section}
            aria-labelledby="person-chart-title"
          >
            <p className={styles.eyebrow}>The sky / At their birth</p>
            <h2 id="person-chart-title">{person.name}&rsquo;s natal chart.</h2>
            <p className={styles.intro}>
              Choose a planet or house to explore its placement, meaning, and connections.
            </p>
            <ChartWheel chart={chart} compact subject={person.name} />
          </section>
          <section id="person-core" className={styles.section} aria-labelledby="person-core-title">
            <p className={styles.eyebrow}>Three starting points</p>
            <h2 id="person-core-title">Identity, needs, first impressions.</h2>
            <p className={styles.intro}>
              Their Sun describes conscious direction, their Moon familiar needs, and their rising
              sign an approach to new situations. The reflections below are addressed to{' '}
              {person.name}.
            </p>
            <div className={styles.coreGrid}>
              {core.map((body) => {
                const reading = placementReading(body, person.name);
                return (
                  <article className={styles.card} key={body.id}>
                    <p className={styles.eyebrow}>
                      {body.id === 'Ascendant' ? 'Rising' : body.id} / {body.sign}
                    </p>
                    <h3>{reading.title}</h3>
                    <p className={styles.meta}>
                      {body.degree.toFixed(2)}° {body.sign}
                      {body.house !== null && ` · House ${body.house}`}
                    </p>
                    <p>{reading.description}</p>
                    <p>{reading.expression}</p>
                    <details>
                      <summary>
                        {reading.house
                          ? `House ${body.house} / ${reading.house.name}`
                          : 'How this fits their chart'}
                      </summary>
                      <p>{reading.area}</p>
                      <blockquote>{reading.prompt}</blockquote>
                    </details>
                  </article>
                );
              })}
            </div>
            <div className={styles.dailyFocus}>
              {['Mercury', 'Venus', 'Mars'].map((id) => {
                const body = chart.placements.find((placement) => placement.id === id);
                if (!body) return null;
                const reading = placementReading(body, person.name);
                return (
                  <details key={id}>
                    <summary>
                      {reading.title} / {id} in {body.sign}
                    </summary>
                    <p>{reading.description}</p>
                    <p>{reading.expression}</p>
                    <p>{reading.area}</p>
                    {body.house !== null && (
                      <p className={styles.meta}>
                        House {body.house} · {HOUSE_READINGS[body.house].name}
                      </p>
                    )}
                  </details>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <section className={styles.section}>
          <h2>A sky still taking shape.</h2>
          <p className={styles.intro}>
            Birth details are saved, but a complete chart is needed for a personal daily reading and
            natal interpretation. Edit their details to enter a known time or recalculate.
          </p>
        </section>
      )}
      <section
        id="person-comparison"
        className={styles.section}
        aria-labelledby="person-comparison-title"
      >
        <p className={styles.eyebrow}>Connection / A conversation starter</p>
        <h2 id="person-comparison-title">Between your skies.</h2>
        <p className={styles.intro}>
          Explore how themes in your birth chart meet themes in {person.name}&rsquo;s. The closest
          calculated contacts offer questions about communication, care, and different needs, rather
          than a compatibility score.
        </p>
        {!comparisonAvailable ? (
          <p className={styles.intro}>
            Both saved charts need to be complete and available before a personal comparison can be
            shown.
          </p>
        ) : contacts.length ? (
          <>
            <div className={styles.coreGrid}>
              {highlights.map((contact) => (
                <article
                  className={styles.card}
                  key={`${contact.from}-${contact.to}-${contact.name}`}
                >
                  <p className={styles.eyebrow}>
                    {contact.name === 'Square' || contact.name === 'Opposition'
                      ? 'Making room for different needs'
                      : contact.name === 'Conjunction'
                        ? 'Themes that meet'
                        : 'Potential cooperation'}
                  </p>
                  <h3>
                    Your {contact.from} &amp; {person.name}&rsquo;s {contact.to}
                  </h3>
                  <p className={styles.meta}>
                    {contact.name} · {contact.orb.toFixed(2)}° orb
                  </p>
                  <p>{contact.reflection}</p>
                  <blockquote>
                    {contact.name === 'Square' || contact.name === 'Opposition'
                      ? 'Where could you give each other room for a different approach?'
                      : 'What small choice would help both of you feel supported?'}
                  </blockquote>
                </article>
              ))}
            </div>
            <details className={styles.allContacts}>
              <summary>All chart connections ({contacts.length})</summary>
              {contacts.map((contact) => (
                <details key={`${contact.from}-${contact.to}-${contact.name}`}>
                  <summary>
                    Your {contact.from} {contact.name.toLowerCase()} {person.name}&rsquo;s{' '}
                    {contact.to} · {contact.orb.toFixed(2)}°
                  </summary>
                  <p>{contact.reflection}</p>
                </details>
              ))}
            </details>
          </>
        ) : (
          <p className={styles.intro}>
            No major planet-to-planet aspects fall within the 3° comparison range. This does not
            describe how close or meaningful your relationship is.
          </p>
        )}
        {comparisonAvailable && (
          <p className={styles.meta}>
            The closest connections appear first. Comparisons use the five major planet-to-planet
            aspects within 3°.
          </p>
        )}
      </section>
    </>
  );
}
