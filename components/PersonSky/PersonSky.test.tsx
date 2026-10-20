import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateNatal } from '@/lib/astrology/engine';
import { compareCharts } from '@/lib/astrology/synastry';
import { buildToday } from '@/lib/astrology/today';
import type { Person } from '@/types/personal';
import PersonSky from './PersonSky';

const birth = {
  date: '2000-01-01',
  time: '12:00',
  timeZone: 'UTC',
  disambiguation: 'reject' as const,
  place: 'Greenwich',
  latitude: 51.4779,
  longitude: 0,
  placeSource: 'test',
};
const chart = calculateNatal(birth);
const person: Person = {
  id: 'test',
  name: 'Alex',
  relationship: 'Friend',
  birth,
  chart,
  updated_at: '2026-10-20',
};
const today = buildToday(chart, new Date('2026-10-20T12:00:00Z'));

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
});

it('shows a named daily reading, Moon illumination, compact chart, and natal interpretations', () => {
  render(<PersonSky person={person} today={today} contacts={[]} comparisonAvailable={false} />);
  const daily = screen.getByRole('region', { name: 'Alex’s sky, today.' });
  expect(within(daily).getByText(today.summary.text)).toBeInTheDocument();
  expect(within(daily).getByText('Tuesday, October 20 / Today')).toBeInTheDocument();
  expect(within(daily).getByLabelText('Current Moon')).toHaveTextContent(
    `${(today.sky.illumination * 100).toFixed(0)}% lit`
  );
  expect(screen.getByRole('region', { name: 'Natal chart explorer' })).toHaveAttribute(
    'data-compact',
    'true'
  );
  expect(screen.getByRole('img', { name: /Alex’s natal sky/ })).toBeInTheDocument();
  const core = screen.getByRole('region', { name: 'Identity, needs, first impressions.' });
  expect(core.querySelectorAll('article')).toHaveLength(3);
  expect(core).toHaveTextContent('Alex’s rising sign');
  for (const id of ['Mercury', 'Venus', 'Mars'])
    expect(core).toHaveTextContent(
      `${id} in ${chart.placements.find((body) => body.id === id)!.sign}`
    );
  fireEvent.change(screen.getByLabelText('Body or angle'), { target: { value: 'Ascendant' } });
  expect(screen.getByRole('region', { name: 'Natal chart explorer' })).toHaveTextContent(
    'Alex’s rising sign'
  );
});

it('retains a working natal chart if today is unavailable and skips it for drafts', () => {
  const { rerender } = render(
    <PersonSky person={person} today={null} contacts={[]} comparisonAvailable={false} />
  );
  expect(screen.getByText(/Today’s sky could not be calculated/)).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Natal chart explorer' })).toBeInTheDocument();
  rerender(
    <PersonSky
      person={{ ...person, chart: null }}
      today={null}
      contacts={[]}
      comparisonAvailable={false}
    />
  );
  expect(screen.getByRole('heading', { name: 'A sky still taking shape.' })).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Natal chart explorer' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Alex’s sky, today.' })).not.toBeInTheDocument();
});

it('highlights three closest comparisons and keeps the full calculated list accessible', () => {
  const contacts = compareCharts(chart, chart);
  render(<PersonSky person={person} today={today} contacts={contacts} comparisonAvailable />);
  const comparison = screen.getByRole('region', { name: 'Between your skies.' });
  const cards = comparison.querySelectorAll('article');
  expect(cards).toHaveLength(3);
  for (const [index, card] of [...cards].entries()) {
    expect(card).toHaveTextContent(`Your ${contacts[index].from} & Alex’s ${contacts[index].to}`);
    expect(card).toHaveTextContent(contacts[index].reflection);
  }
  expect(comparison).toHaveTextContent(`All chart connections (${contacts.length})`);
});

it('distinguishes a complete comparison with no close contacts from unavailable charts', () => {
  const { rerender } = render(
    <PersonSky person={person} today={today} contacts={[]} comparisonAvailable />
  );
  expect(screen.getByText(/No major planet-to-planet aspects/)).toBeInTheDocument();
  rerender(<PersonSky person={person} today={today} contacts={[]} comparisonAvailable={false} />);
  expect(screen.getByText(/Both saved charts need to be complete/)).toBeInTheDocument();
  expect(screen.queryByText(/No major planet-to-planet aspects/)).not.toBeInTheDocument();
});
