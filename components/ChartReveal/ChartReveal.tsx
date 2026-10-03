'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { NatalChart } from '@/types/chart';
import styles from './ChartReveal.module.css';

const meanings: Record<string, string> = {
  Aries: 'initiative, courage, and the instinct to begin', Taurus: 'steadiness, embodiment, and what you value', Gemini: 'curiosity, conversation, and changing perspectives', Cancer: 'belonging, memory, and emotional protection', Leo: 'creative expression, warmth, and being seen', Virgo: 'discernment, craft, and thoughtful attention', Libra: 'relationship, balance, and the art of exchange', Scorpio: 'depth, trust, and transformation', Sagittarius: 'exploration, meaning, and a wider horizon', Capricorn: 'responsibility, structure, and patient ambition', Aquarius: 'independence, community, and unconventional thinking', Pisces: 'imagination, compassion, and porous boundaries',
};

export default function ChartReveal({ chart }: { chart: NatalChart }) {
  const [stage, setStage] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const sun = chart.placements.find(body => body.id === 'Sun')!;
  const moon = chart.placements.find(body => body.id === 'Moon')!;
  const rising = chart.angles.ascendant;
  const body = [sun, moon, rising][stage];
  const labels = ['The Sun', 'The Moon', 'The Rising', 'Your cosmic signature'];
  return <section className={styles.reveal}>
    <fieldset className={styles.tabs} aria-label="Chart reveal">{labels.map((label, index) => <button type="button" key={label} aria-pressed={stage === index} onClick={() => setStage(index)}>{label}</button>)}</fieldset>
    <p className={styles.eyebrow}>{stage === 0 ? 'Identity / Expression' : stage === 1 ? 'Emotion / Inner rhythm' : stage === 2 ? 'Presence / First approach' : 'Three coordinates of your sky'}</p>
    <h2 ref={heading} tabIndex={-1}>{body ? body.sign : `${sun.sign} / ${moon.sign} / ${rising.sign}`}</h2>
    {body ? <><p className={styles.degree}>{body.id === 'Ascendant' ? 'Rising' : body.id} at {body.degree.toFixed(2)}° {body.sign}{body.house !== null && ` · House ${body.house}`}</p><p className={styles.prose}>{stage === 0 ? 'In astrology, the Sun is a symbol of identity and conscious expression.' : stage === 1 ? 'In astrology, the Moon is a symbol of emotional needs and familiar rhythms.' : 'In astrology, the rising sign describes an approach to the world, not a fixed personality.'} {body.sign} brings themes of {meanings[body.sign]}.</p></> : <p className={styles.prose}>A {sun.sign} Sun, {moon.sign} Moon, and {rising.sign} rising. These are symbolic starting points for reflection, not a prediction or a complete account of who you are.</p>}
    <div className={styles.actions}><button type="button" className={styles.back} aria-label="Previous reveal" title="Previous reveal" disabled={stage === 0} onClick={() => setStage(stage - 1)}><ArrowLeft size={18} /></button>{stage < 3 ? <button type="button" onClick={() => { setStage(stage + 1); requestAnimationFrame(() => heading.current?.focus()); }}>{labels[stage + 1]} <ArrowRight size={18} /></button> : <Link href="/profile">Make it personal <ArrowRight size={18} /></Link>}</div>
  </section>;
}