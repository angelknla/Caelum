import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/app/auth-actions', () => ({ lock: vi.fn() }));
vi.mock('@/app/birth-actions', () => ({ submitDetails: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/today' }));

import CalendarView from '@components/CalendarView/CalendarView';
import calendarStyles from '@components/CalendarView/CalendarView.module.css';
import ChartDNA from '@components/ChartDNA/ChartDNA';
import dnaStyles from '@components/ChartDNA/ChartDNA.module.css';
import ChartLife from '@components/ChartLife/ChartLife';
import lifeStyles from '@components/ChartLife/ChartLife.module.css';
import ChartOverview from '@components/ChartOverview/ChartOverview';
import chartOverviewStyles from '@components/ChartOverview/ChartOverview.module.css';
import ChartReveal from '@components/ChartReveal/ChartReveal';
import revealStyles from '@components/ChartReveal/ChartReveal.module.css';
import wheelStyles from '@components/ChartWheel/ChartWheel.module.css';
import Header from '@components/Header/Header';
import headerStyles from '@components/Header/Header.module.css';
import PersonSky from '@components/PersonSky/PersonSky';
import personStyles from '@components/PersonSky/PersonSky.module.css';
import ProfileDetails from '@components/ProfileDetails/ProfileDetails';
import profileStyles from '@components/ProfileDetails/ProfileDetails.module.css';
import chartStyles from '@/app/(pages)/chart/page.module.css';
import { analyzeChart } from '@/lib/astrology/analysis';
import { calculateCalendar } from '@/lib/astrology/calendar';
import { calculateNatal } from '@/lib/astrology/engine';
import { compareCharts } from '@/lib/astrology/synastry';
import { buildToday } from '@/lib/astrology/today';
import editorialStyles from '@/styles/editorial.module.css';
import overviewStyles from '@/styles/sky-overview.module.css';
import type { BirthInput } from '@/types/chart';
import type { Person } from '@/types/personal';
import TodayView from './TodayView';
import todayStyles from './TodayView.module.css';

it('keeps two primary readings visible and can generate private synthetic visual fixtures', () => {
  const output = process.env.CAELUM_VISUAL_FIXTURES;
  const birth: BirthInput = {
    date: '2000-01-01',
    time: '12:00',
    timeZone: 'UTC',
    disambiguation: 'reject',
    place: 'Greenwich',
    latitude: 51.4779,
    longitude: 0,
    placeSource: 'test',
  };
  const chart = calculateNatal(birth);
  const person: Person = {
    id: 'synthetic-person',
    name: 'Alex',
    relationship: 'Friend',
    birth,
    chart,
    updated_at: '2026-10-20T12:00:00Z',
  };
  const personProps = {
    person,
    today: buildToday(chart, new Date('2026-10-20T12:00:00Z')),
    contacts: compareCharts(chart, chart),
    comparisonAvailable: true,
  };
  const css = (path: string, classes: Record<string, string>) =>
    readFileSync(path, 'utf8').replace(/\.([a-zA-Z_][\w-]*)/g, (match, name: string) =>
      classes[name] ? `.${classes[name]}` : match
    );
  const styles = [
    '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Space+Grotesk:wght@400;500;600&family=Manrope:wght@400;500;600&display=swap"); :root { --font-display: "Space Grotesk"; --font-serif: "Cormorant Garamond"; --font-ui: "Manrope"; }',
    readFileSync('styles/globals.css', 'utf8'),
    css('components/Header/Header.module.css', headerStyles),
    css('components/ProfileDetails/ProfileDetails.module.css', profileStyles),
    css('app/(pages)/chart/page.module.css', chartStyles),
    css('styles/editorial.module.css', editorialStyles),
    css('styles/sky-overview.module.css', overviewStyles),
    css('components/CalendarView/CalendarView.module.css', calendarStyles),
    css('components/ChartOverview/ChartOverview.module.css', chartOverviewStyles),
    css('components/ChartReveal/ChartReveal.module.css', revealStyles),
    css('components/ChartWheel/ChartWheel.module.css', wheelStyles),
    css('components/ChartDNA/ChartDNA.module.css', dnaStyles),
    css('components/ChartLife/ChartLife.module.css', lifeStyles),
    css('components/TodayView/TodayView.module.css', todayStyles),
    css('components/PersonSky/PersonSky.module.css', personStyles),
  ].join('\n');
  const documents = {
    calendar: (
      <CalendarView
        calendar={calculateCalendar(chart, new Date('2026-10-20T23:00:00Z'), 7, 'Europe/London')}
        timeZone="Europe/London"
        startDate="2026-10-21"
        previousHref="/calendar?start=2026-10-14&days=7"
        nextHref="/calendar?start=2026-10-28&days=7"
        kind="All"
      />
    ),
    person: (
      <article className={editorialStyles.page}>
        <header className={editorialStyles.heading}>
          <a href="/people">People</a>
          <p className={editorialStyles.eyebrow}>Friend</p>
          <h1>Alex</h1>
          <p>2000-01-01 · 12:00 · Greenwich</p>
        </header>
        <div id="person-sky">
          <PersonSky {...personProps} />
        </div>
      </article>
    ),
    profile: (
      <ProfileDetails
        initial={{
          nickname: 'Sky',
          currentLocation: 'London',
          pronouns: 'they/them',
          experience: 'familiar',
          interests: ['Career'],
        }}
      />
    ),
    chart: (
      <article className={chartStyles.chart}>
        <ChartOverview chart={chart} birth={birth} />
        <ChartReveal chart={chart} />
        <ChartLife chart={chart} />
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
  writeFileSync(join(output, 'person.json'), JSON.stringify(personProps));
  const header = renderToStaticMarkup(<Header signedIn chartReady />);
  for (const [name, content] of Object.entries(documents)) {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Caelum synthetic ${name} review</title><style>${styles}</style></head><body>${header}<main>${renderToStaticMarkup(content)}</main></body></html>`;
    writeFileSync(
      join(output, `${name}.html`),
      html.replace('href="/images/moon.jpg"', 'href="http://localhost:3002/images/moon.jpg"')
    );
    expect(html).toContain('Caelum');
  }
});
