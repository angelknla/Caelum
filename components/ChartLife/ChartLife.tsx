import Link from 'next/link';
import { aspectReading, placementReading } from '@/lib/astrology/natal-reading';
import type { NatalChart } from '@/types/chart';
import styles from './ChartLife.module.css';

const personalBodies = ['Mercury', 'Venus', 'Mars'];

export default function ChartLife({ chart }: { chart: NatalChart }) {
  return (
    <section id="everyday-chart" className={styles.section} aria-labelledby="everyday-title">
      <p className={styles.eyebrow}>Your chart / In everyday life</p>
      <h2 id="everyday-title">Thinking, connecting, taking action.</h2>
      <p className={styles.intro}>
        Mercury, Venus, and Mars add detail to the Sun, Moon, and rising: how you work with ideas,
        what you value in connection, and how you put energy behind a choice.
      </p>
      <div className={styles.grid}>
        {personalBodies.map((id) => {
          const body = chart.placements.find((placement) => placement.id === id);
          if (!body) return null;
          const reading = placementReading(body);
          const contact = [...chart.aspects]
            .filter((aspect) => aspect.from === id || aspect.to === id)
            .sort((first, second) => first.orb - second.orb)[0];
          return (
            <article className={styles.card} key={id}>
              <p className={styles.placement}>
                {id} in {body.sign} · {body.degree.toFixed(2)}°
                {body.house !== null && ` · House ${body.house}`}
              </p>
              <h3>{reading.title}</h3>
              <p>{reading.description}</p>
              <p>{reading.expression}</p>
              <details>
                <summary>
                  {reading.house
                    ? `In House ${body.house} / ${reading.house.name}`
                    : 'In your chart'}
                </summary>
                <p>{reading.area}</p>
                {contact && (
                  <>
                    <h4>
                      {contact.from} {contact.name.toLowerCase()} {contact.to}
                    </h4>
                    <p>{aspectReading(contact)}</p>
                    <p className={styles.evidence}>
                      Closest calculated aspect for this planet · {contact.orb.toFixed(2)}° orb
                    </p>
                  </>
                )}
              </details>
              <Link href={`/explore?entry=${id.toLowerCase()}`}>Explore {id}</Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
