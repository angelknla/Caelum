import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateNatal } from '@/lib/astrology/engine';
import { placementReading } from '@/lib/astrology/natal-reading';
import ChartReveal from './ChartReveal';

it('reveals each core placement with its own sign, house, and reflection', () => {
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
  render(<ChartReveal chart={chart} />);
  const tabs = within(screen.getByRole('group', { name: 'Chart reveal' }));
  for (const [index, id] of ['Sun', 'Moon', 'Ascendant'].entries()) {
    fireEvent.click(
      tabs.getByRole('button', {
        name: ['The Sun', 'The Moon', 'The Rising'][index],
      })
    );
    const body =
      id === 'Ascendant'
        ? chart.angles.ascendant
        : chart.placements.find((body) => body.id === id)!;
    const reading = placementReading(body);
    expect(screen.getByText(reading.expression)).toBeInTheDocument();
    expect(screen.getByText(reading.area)).toBeInTheDocument();
    expect(screen.getByText(reading.prompt)).toBeInTheDocument();
  }
  fireEvent.click(tabs.getByRole('button', { name: 'Your cosmic signature' }));
  for (const body of [
    chart.placements.find((body) => body.id === 'Sun')!,
    chart.placements.find((body) => body.id === 'Moon')!,
    chart.angles.ascendant,
  ]) {
    expect(screen.getByText(placementReading(body).expression)).toBeInTheDocument();
  }
});
