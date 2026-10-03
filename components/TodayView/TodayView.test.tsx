import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateNatal } from '@/lib/astrology/engine';
import { buildToday } from '@/lib/astrology/today';
import TodayView from './TodayView';

it('renders four grounded reflections, lunar events, timezone, and evidence', () => {
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
  const today = buildToday(chart, new Date('2026-10-03T12:00:00Z'));
  render(<TodayView today={today} timeZone="Europe/London" />);
  expect(screen.getByRole('heading', { name: 'Your sky, today.' })).toBeInTheDocument();
  expect(screen.getAllByText('Why this reflection?')).toHaveLength(4);
  expect(screen.getByRole('img', { name: /schematic illuminated hemisphere/ })).toBeInTheDocument();
  expect(screen.getByText(/Europe\/London/)).toBeInTheDocument();
  expect(screen.getByText('Next exact phase')).toBeInTheDocument();
  expect(screen.getByText('Next sign ingress')).toBeInTheDocument();
  for (const focus of today.focus) expect(screen.getByText(focus.prompt)).toBeInTheDocument();
});
