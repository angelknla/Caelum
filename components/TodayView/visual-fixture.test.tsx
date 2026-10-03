import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import ChartDNA from '@components/ChartDNA/ChartDNA';
import dnaStyles from '@components/ChartDNA/ChartDNA.module.css';
import ChartReveal from '@components/ChartReveal/ChartReveal';
import revealStyles from '@components/ChartReveal/ChartReveal.module.css';
import ChartWheel from '@components/ChartWheel/ChartWheel';
import wheelStyles from '@components/ChartWheel/ChartWheel.module.css';
import headerStyles from '@components/Header/Header.module.css';
import chartStyles from '@/app/(pages)/chart/page.module.css';
import { analyzeChart } from '@/lib/astrology/analysis';
import { calculateNatal } from '@/lib/astrology/engine';
import { buildToday } from '@/lib/astrology/today';
import editorialStyles from '@/styles/editorial.module.css';
import TodayView from './TodayView';
import todayStyles from './TodayView.module.css';

it('keeps two primary readings visible and can generate private synthetic visual fixtures', () => {
  const output = process.env.CAELUM_VISUAL_FIXTURES;
  const chart = calculateNatal({
    date: '2000-01-01',
    time: '12:00',
    timeZone: 'UTC',
    disambiguation: 'reject',
    place: 'Greenwich',
    latitude: 51.4779,
    longitude: 0,
    placeSource: 'test',
  });
  const css = (path: string, classes: Record<string, string>) =>
    readFileSync(path, 'utf8').replace(/\.([a-zA-Z_][\w-]*)/g, (match, name: string) =>
      classes[name] ? `.${classes[name]}` : match
    );
  const styles = [
    '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Manrope:wght@400;500;600&display=swap"); :root { --font-display: "Cormorant Garamond"; --font-ui: "Manrope"; }',
    readFileSync('styles/globals.css', 'utf8'),
    css('components/Header/Header.module.css', headerStyles),
    css('app/(pages)/chart/page.module.css', chartStyles),
    css('styles/editorial.module.css', editorialStyles),
    css('components/ChartReveal/ChartReveal.module.css', revealStyles),
    css('components/ChartWheel/ChartWheel.module.css', wheelStyles),
    css('components/ChartDNA/ChartDNA.module.css', dnaStyles),
    css('components/TodayView/TodayView.module.css', todayStyles),
  ].join('\n');
  const documents = {
    chart: (
      <article className={chartStyles.chart}>
        <header className={chartStyles.heading}>
          <div>
            <p className={chartStyles.eyebrow}>Your natal chart</p>
            <h1>Your sky, at the beginning.</h1>
            <p>January 1, 2000 · 12:00 · Greenwich</p>
          </div>
          <a href="/begin" aria-label="Edit birth details">
            &#9998;
          </a>
        </header>
        <ChartWheel chart={chart} />
        <ChartReveal chart={chart} />
        <ChartDNA dna={analyzeChart(chart)} />
      </article>
    ),
    forms: (
      <section className={editorialStyles.page}>
        <header className={editorialStyles.heading}>
          <p className={editorialStyles.eyebrow}>Your journal</p>
          <h1>A moment, kept.</h1>
        </header>
        <form className={editorialStyles.form}>
          <div className={editorialStyles.grid}>
            <label className={editorialStyles.field}>
              Date
              <input type="date" defaultValue="2026-10-03" />
            </label>
            <label className={editorialStyles.field}>
              Title
              <input defaultValue="Your sky, remembered" />
            </label>
          </div>
          <label className={editorialStyles.field}>
            Reflection
            <textarea defaultValue="A little space to notice what matters." />
          </label>
          <label className={editorialStyles.field}>
            Tags
            <input defaultValue="reflection, moon" />
          </label>
          <label>
            <input type="checkbox" /> Keep a sky snapshot
          </label>
          <div className={editorialStyles.actions}>
            <button type="button">Save reflection</button>
            <a href="/journal">Cancel</a>
          </div>
        </form>
      </section>
    ),
    today: (
      <TodayView
        today={buildToday(chart, new Date('2026-10-03T12:00:00Z'))}
        timeZone="Europe/London"
      />
    ),
  };
  const todayDocument = new DOMParser().parseFromString(
    renderToStaticMarkup(documents.today),
    'text/html'
  );
  const secondary = todayDocument.querySelectorAll(`details.${todayStyles.secondary}`);
  expect(secondary).toHaveLength(2);
  expect([...secondary].every((reading) => !reading.hasAttribute('open'))).toBe(true);
  expect(todayDocument.querySelectorAll(`.${todayStyles.focuses} > section`)).toHaveLength(2);
  expect(todayDocument.querySelectorAll(`.${todayStyles.focus}`)).toHaveLength(4);
  if (!output) return;
  mkdirSync(output, { recursive: true });
  const header = renderToStaticMarkup(
    <header className={headerStyles.header}>
      <a className={headerStyles.brand} href="/">
        Caelum
      </a>
      <nav className={headerStyles.primary} aria-label="Your universe">
        {['Today', 'Chart', 'Explore', 'People', 'Journal'].map((label) => (
          <a key={label} href={`/${label.toLowerCase()}`}>
            {label}
          </a>
        ))}
      </nav>
      <nav aria-label="Account">
        <button type="button" aria-label="Sign out">
          &#8594;
        </button>
      </nav>
    </header>
  );
  for (const [name, content] of Object.entries(documents)) {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Caelum synthetic ${name} review</title><style>${styles}</style></head><body>${header}<main>${renderToStaticMarkup(content)}</main></body></html>`;
    writeFileSync(
      join(output, `${name}.html`),
      html.replace('href="/images/moon.jpg"', 'href="http://localhost:3002/images/moon.jpg"')
    );
    expect(html).toContain('Your sky');
  }
});
