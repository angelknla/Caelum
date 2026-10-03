import Link from 'next/link';
import type { ChartDNA as ChartDNAType, Distribution } from '@/types/analysis';
import styles from './ChartDNA.module.css';

function DistributionRows({ title, items }: { title: string; items: Distribution[] }) {
  return (
    <section className={styles.distribution} aria-label={title}>
      <h3>{title}</h3>
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
        <div className={styles.distributions}>
          <DistributionRows title="Elements" items={dna.elements} />
          <DistributionRows title="Modes" items={dna.modalities} />
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
                </li>
              ))}
            </ol>
          </section>
        </div>
        <section className={styles.patterns}>
          <h3>Patterns in the geometry</h3>
          {dna.configurations.length ? (
            dna.configurations.map((pattern) => (
              <details key={`${pattern.name}-${pattern.bodies.join('-')}`}>
                <summary>
                  {pattern.name}
                  <span>{pattern.bodies.join(' · ')}</span>
                </summary>
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
