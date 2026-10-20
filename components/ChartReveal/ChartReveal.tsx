'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { placementReading } from '@/lib/astrology/natal-reading';
import type { NatalChart } from '@/types/chart';
import styles from './ChartReveal.module.css';

export default function ChartReveal({ chart }: { chart: NatalChart }) {
  const [stage, setStage] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const sun = chart.placements.find((body) => body.id === 'Sun')!;
  const moon = chart.placements.find((body) => body.id === 'Moon')!;
  const rising = chart.angles.ascendant;
  const body = [sun, moon, rising][stage];
  const reading = body ? placementReading(body) : null;
  const labels = ['The Sun', 'The Moon', 'The Rising', 'Your cosmic signature'];
  return (
    <section id="core-chart" className={styles.reveal} aria-label="Your Sun, Moon, and rising">
      <fieldset className={styles.tabs} aria-label="Chart reveal">
        {labels.map((label, index) => (
          <button
            type="button"
            key={label}
            aria-pressed={stage === index}
            onClick={() => setStage(index)}
          >
            {label}
          </button>
        ))}
      </fieldset>
      <p className={styles.eyebrow}>
        {stage === 0
          ? 'Identity / Expression'
          : stage === 1
            ? 'Emotion / Inner rhythm'
            : stage === 2
              ? 'Presence / First approach'
              : 'Three coordinates of your sky'}
      </p>
      <h2 ref={heading} tabIndex={-1}>
        {body ? body.sign : `${sun.sign} / ${moon.sign} / ${rising.sign}`}
      </h2>
      {body ? (
        <>
          <p className={styles.degree}>
            {body.id === 'Ascendant' ? 'Rising' : body.id} at {body.degree.toFixed(2)}° {body.sign}
            {body.house !== null && ` · House ${body.house}`}
          </p>
          <p className={styles.prose}>{reading!.description}</p>
          <div className={styles.context}>
            <section>
              <h3>Your style of expression</h3>
              <p>{reading!.expression}</p>
            </section>
            <section>
              <h3>
                {reading!.house
                  ? `House ${body.house} / ${reading!.house.name}`
                  : 'How this fits your chart'}
              </h3>
              <p>{reading!.area}</p>
            </section>
          </div>
          <blockquote>{reading!.prompt}</blockquote>
        </>
      ) : (
        <>
          <p className={styles.prose}>
            Your Sun describes conscious direction, your Moon describes familiar needs, and your
            rising sign describes your first approach. Reading them together makes room for
            different parts of your experience.
          </p>
          <div className={styles.signature}>
            {[sun, moon, rising].map((placement) => (
              <section key={placement.id}>
                <h3>
                  {placement.id === 'Ascendant' ? 'Rising' : placement.id} / {placement.sign}
                </h3>
                <p>{placementReading(placement).expression}</p>
              </section>
            ))}
          </div>
          <blockquote>
            Where do your intentions, needs, and first responses support each other—and where do
            they ask for different things?
          </blockquote>
        </>
      )}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.back}
          aria-label="Previous reveal"
          title="Previous reveal"
          disabled={stage === 0}
          onClick={() => setStage(stage - 1)}
        >
          <ArrowLeft size={18} />
        </button>
        {stage < 3 ? (
          <button
            type="button"
            onClick={() => {
              setStage(stage + 1);
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            {labels[stage + 1]} <ArrowRight size={18} />
          </button>
        ) : (
          <Link href="#dna">
            Your cosmic DNA <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </section>
  );
}
