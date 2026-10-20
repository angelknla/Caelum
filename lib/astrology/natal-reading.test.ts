import { expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateNatal, placement, SIGNS } from './engine';
import {
  aspectReading,
  distributionSummary,
  HOUSE_READINGS,
  placementReading,
} from './natal-reading';

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

it('supports every calculated body and sign with the assigned house', () => {
  const natal = chart();
  for (const body of [...natal.placements, natal.angles.ascendant, natal.angles.midheaven]) {
    const reading = placementReading(body);
    expect(reading.description).toBeTruthy();
    expect(reading.expression).not.toContain('undefined');
    expect(reading.area).not.toContain('undefined');
    if (body.house !== null) expect(reading.area).toContain(`In House ${body.house}`);
  }
  for (const [index, sign] of SIGNS.entries()) {
    expect(placementReading(placement('Sun', index * 30, 0, 1, 1)).expression).toContain(
      `Sun in ${sign}`
    );
  }
  expect(Object.keys(HOUSE_READINGS)).toHaveLength(12);
});

it('does not assign a planet house to an angle', () => {
  const rising = placementReading(placement('Ascendant', 30));
  expect(rising.house).toBeNull();
  expect(rising.area).toContain('eastern horizon');
  expect(placementReading(placement('Midheaven', 270)).area).toContain('public direction');
});

it('explains the calculated aspect type and both participating bodies', () => {
  const natal = chart();
  for (const aspect of natal.aspects) {
    const reading = aspectReading(aspect);
    expect(reading).toContain(aspect.from);
    expect(reading).toContain(aspect.to);
    expect(reading.toLowerCase()).toContain(aspect.name.toLowerCase());
    expect(reading).not.toContain('undefined');
  }
});

it('keeps tied emphasis explicit and handles an empty distribution', () => {
  const items = ['Fire', 'Earth', 'Air'].map((label) => ({
    label,
    score: 3,
    percentage: 100 / 3,
    bodies: [],
  }));
  expect(distributionSummary(items)).toContain('Fire and Earth and Air share');
  expect(distributionSummary([])).toBe('No weighted emphasis is available.');
});
