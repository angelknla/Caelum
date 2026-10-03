import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateNatal } from '@/lib/astrology/engine';
import ChartWheel from './ChartWheel';
import { layoutBodies } from './layout';

const chart = () =>
  calculateNatal({
    date: '2000-01-01',
    time: '12:00',
    timeZone: 'UTC',
    disambiguation: 'reject',
    place: 'Greenwich',
    latitude: 51.4779,
    longitude: 0,
    placeSource: 'test',
  });
it('selects bodies, angles, and houses without changing chart data', () => {
  const natal = chart();
  const original = JSON.stringify(natal);
  render(<ChartWheel chart={natal} />);
  fireEvent.click(screen.getByRole('button', { name: 'Inspect Moon' }));
  expect(screen.getByRole('heading', { name: 'Moon' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Inspect Moon' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  fireEvent.change(screen.getByLabelText('Body or angle'), { target: { value: 'Ascendant' } });
  expect(screen.getByRole('heading', { name: 'Ascendant' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Inspect house 12' }));
  expect(screen.getByRole('heading', { name: 'House 12' })).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Aspect lines'));
  expect(screen.getByLabelText('Aspect lines')).not.toBeChecked();
  expect(JSON.stringify(natal)).toBe(original);
});
it('supports keyboard activation of wheel controls', async () => {
  render(<ChartWheel chart={chart()} />);
  const moon = screen.getByRole('button', { name: 'Inspect Moon' });
  moon.focus();
  await userEvent.keyboard('{Enter}');
  expect(screen.getByRole('heading', { name: 'Moon' })).toBeInTheDocument();
});
it('separates crowded controls while preserving exact longitude marks', () => {
  const natal = chart();
  const bodies = natal.placements.map((body) => ({ ...body, longitude: 359.5 }));
  const marks = layoutBodies(bodies, natal.angles.ascendant.longitude);
  for (const [index, mark] of marks.entries()) {
    for (const other of marks.slice(index + 1))
      expect(
        Math.abs(mark.label.x - other.label.x) >= 64 || Math.abs(mark.label.y - other.label.y) >= 64
      ).toBe(true);
    expect(Math.hypot(mark.exact.x - 300, mark.exact.y - 300)).toBeCloseTo(215);
  }
  expect(marks.every((mark) => mark.body.longitude === 359.5)).toBe(true);
});
