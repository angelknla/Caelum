import Link from 'next/link';
import {
  distributionSummary,
  ELEMENT_READINGS,
  HOUSE_READINGS,
  MODE_READINGS,
  PATTERN_READINGS,
} from '@/lib/astrology/natal-reading';
import { SIGN_THEMES } from '@/lib/astrology/symbolism';
import type { ChartDNA as ChartDNAType, Distribution } from '@/types/analysis';
import styles from './ChartDNA.module.css';

function DistributionRows({
  title,
  items,
  meanings,
}: {
  title: string;
  items: Distribution[];
  meanings: Record<string, string>;
}) {
  return (
    <section className={styles.distribution} aria-label={title}>
      <h3>{title}</h3>
      <p className={styles.explanation}>{distributionSummary(items)}</p>
      {items.map((item) => (
        <div key={item.label} className={styles.row}>
          <div className={styles.rowHeading}>
            <span>{item.label}</span>
            <span>{Math.round(item.percentage)}%</span>
          </div>
          <meter
            min={0}
            max={100}
            value={item.percentage}
            aria-label={`${item.label} weighted emphasis`}
          />
          <p>{item.bodies.join(', ') || 'No weighted placements'}</p>
          <p className={styles.explanation}>{meanings[item.label]}</p>
        </div>
      ))}
    </section>
  );
}

export default function ChartDNA({ dna }: { dna: ChartDNAType }) {
  return (
    <>
      <section id="dna" className={styles.dna} aria-labelledby="dna-title">
        <p className={styles.eyebrow}>Your chart / Its underlying rhythm</p>
        <h2 id="dna-title">Your cosmic DNA.</h2>
        <p className={styles.intro}>
          These patterns show which styles and areas repeat across your placements. Read the
          percentages alongside the planets behind them: a lower score does not mean a quality is
          missing from your life.
        </p>
        <div className={styles.distributions}>
          <DistributionRows title="Elements" items={dna.elements} meanings={ELEMENT_READINGS} />
          <DistributionRows title="Modes" items={dna.modalities} meanings={MODE_READINGS} />
        </div>
        <div className={styles.emphasis}>
          <section>
            <h3>Sign emphasis</h3>
            <ol>
              {dna.dominantSigns.slice(0, 3).map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.score} weighted points</span>
                  <small>{item.bodies.join(', ')}</small>
                  <p className={styles.houseTheme}>
                    A recurring style around {SIGN_THEMES[item.label]}.
                  </p>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h3>House emphasis</h3>
            <ol>
              {dna.emphasis.slice(0, 3).map((item) => (
                <li key={item.house}>
                  <strong>House {item.house}</strong>
                  <span>{item.bodies.length} planets</span>
                  <small>{item.bodies.join(', ')}</small>
                  <p className={styles.houseTheme}>
                    {HOUSE_READINGS[item.house].name} · {HOUSE_READINGS[item.house].theme}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <p className={styles.intro}>
          House emphasis counts the ten planets. Houses with no planets still describe areas of
          life; an empty house does not make its theme absent.
        </p>
        <section className={styles.patterns}>
          <h3>Patterns in the geometry</h3>
          {dna.configurations.length ? (
            dna.configurations.map((pattern) => (
              <details key={`${pattern.name}-${pattern.bodies.join('-')}`}>
                <summary>
                  {pattern.name}
                  <span>{pattern.bodies.join(' · ')}</span>
                </summary>
                <p>{PATTERN_READINGS[pattern.name]}</p>
                <ul>
                  {pattern.evidence.map((evidence) => (
                    <li key={evidence}>{evidence}</li>
                  ))}
                </ul>
              </details>
            ))
          ) : (
            <p>
              No grand trine, T-square, grand cross, or sign-based stellium meets the selected
              definitions.
            </p>
          )}
        </section>
        <details className={styles.method}>
          <summary>Scoring &amp; definitions</summary>
          <p>{dna.method}</p>
          <p>
            Tied weights indicate shared emphasis; list order does not break a tie. Orb thresholds
            are recorded in the chart evidence below.
          </p>
        </details>
      </section>
      <section id="first-insight" className={styles.insight} aria-labelledby="insight-title">
        <p className={styles.eyebrow}>Your first reflection</p>
        <h2 id="insight-title">{dna.insight.title}</h2>
        <p className={styles.prose}>{dna.insight.reflection}</p>
        <blockquote>{dna.insight.prompt}</blockquote>
        <details>
          <summary>Why this reflection?</summary>
          <ul>
            {dna.insight.evidence.map((evidence) => (
              <li key={evidence}>{evidence}</li>
            ))}
          </ul>
        </details>
        <Link href="/today">Meet today&apos;s sky</Link>
      </section>
    </>
  );
}
