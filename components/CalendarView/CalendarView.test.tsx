import { render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateCalendar } from '@/lib/astrology/calendar';
import { calculateNatal } from '@/lib/astrology/engine';
import CalendarView from './CalendarView';

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
const calendar = calculateCalendar(chart, new Date('2024-03-30T00:00:00Z'), 7);
const props = {
  calendar,
  timeZone: 'Europe/London',
  startDate: '2024-03-30',
  previousHref: '/calendar?start=2024-03-23&days=7&kind=Station',
  nextHref: '/calendar?start=2024-04-06&days=7&kind=Station',
  kind: 'Station',
};

it('explains the whole range and filters the daily timeline without hiding the overview', () => {
  render(<CalendarView {...props} />);
  expect(screen.getByRole('heading', { name: 'Your sky, unfolding.' })).toBeInTheDocument();
  const timeline = screen.getByRole('region', { name: 'Day by day.' });
  const stations = calendar.events.filter((event) => event.kind === 'Station');
  expect(timeline.querySelectorAll('li')).toHaveLength(stations.length);
  expect(within(timeline).getByText('Mercury stations retrograde')).toBeInTheDocument();
  expect(within(timeline).getByText(stations[0].reading.explanation)).toBeInTheDocument();
  expect(
    screen.getByRole('region', { name: 'Worth noticing.' }).querySelectorAll('article')
  ).toHaveLength(3);
  expect(screen.getByRole('link', { name: 'Current dates' })).toHaveAttribute(
    'href',
    '/calendar?days=7&kind=Station'
  );
  expect(screen.getByRole('link', { name: 'Next 7 days' })).toHaveAttribute('href', props.nextHref);
  expect(screen.getByLabelText('Show')).toHaveValue('Station');
});

it('groups events by the saved timezone and provides useful empty states', () => {
  const event = {
    ...calendar.events.find((event) => event.kind === 'Station')!,
    at: '2024-04-01T23:30:00Z',
  };
  const { rerender } = render(
    <CalendarView {...props} calendar={{ ...calendar, events: [event] }} />
  );
  expect(screen.getByRole('heading', { name: 'Tuesday, April 2' })).toBeInTheDocument();
  expect(
    within(screen.getByRole('region', { name: 'Day by day.' })).getByRole('link', {
      name: 'Write a reflection',
    })
  ).toHaveAttribute('href', `/journal/new?prompt=${encodeURIComponent(event.reading.prompt)}`);
  rerender(
    <CalendarView
      {...props}
      calendar={{ ...calendar, events: [], forecast: [], retrogrades: [] }}
    />
  );
  expect(screen.getByText(/No calculated events match this filter/)).toBeInTheDocument();
  expect(screen.getByText(/No close personal contacts or lunar checkpoints/)).toBeInTheDocument();
});
