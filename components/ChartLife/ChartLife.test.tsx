import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateNatal } from '@/lib/astrology/engine';
import { placementReading } from '@/lib/astrology/natal-reading';
import ChartLife from './ChartLife';

it('connects everyday readings to the person’s calculated placements and Explore', () => {
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
  const before = JSON.stringify(chart);
  render(<ChartLife chart={chart} />);
  for (const id of ['Mercury', 'Venus', 'Mars']) {
    const body = chart.placements.find((body) => body.id === id)!;
    expect(screen.getByText(placementReading(body).expression)).toBeInTheDocument();
    expect(screen.getByText(placementReading(body).area)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: `Explore ${id}` })).toHaveAttribute(
      'href',
      `/explore?entry=${id.toLowerCase()}`
    );
  }
  expect(JSON.stringify(chart)).toBe(before);
});
