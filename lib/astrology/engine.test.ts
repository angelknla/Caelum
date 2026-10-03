import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import type { BirthInput } from '@/types/chart';
import { resolveBirthTime } from './birth';
import { calculateAspects, calculateNatal, placement } from './engine';
import references from './reference-fixtures.json';

const birth: BirthInput = {
  date: '2000-01-01',
  time: '12:00',
  timeZone: 'UTC',
  disambiguation: 'reject',
  place: 'Greenwich',
  latitude: 51.4779,
  longitude: 0,
  placeSource: 'manual',
};

describe('Swiss Ephemeris chart', () => {
  for (const fixture of references.fixtures) {
    it(`matches standalone swetest: ${fixture.name}`, () => {
      const chart = calculateNatal({
        ...fixture,
        place: fixture.name,
        placeSource: 'reference',
        disambiguation: 'reject',
      });
      for (const [id, expected] of Object.entries(fixture.positions)) {
        expect(
          Math.abs(chart.placements.find((body) => body.id === id)!.longitude - expected)
        ).toBeLessThan(references.toleranceDegrees);
      }
      expect(Math.abs(chart.angles.ascendant.longitude - fixture.ascendant)).toBeLessThan(
        references.toleranceDegrees
      );
      expect(Math.abs(chart.angles.midheaven.longitude - fixture.midheaven)).toBeLessThan(
        references.toleranceDegrees
      );
      for (const [index, expected] of fixture.houses.entries()) {
        expect(Math.abs(chart.houses[index] - expected)).toBeLessThan(references.toleranceDegrees);
      }
    });
  }
  it('calculates the J2000 Sun and complete chart without fallback', () => {
    const chart = calculateNatal(birth);
    expect(chart.placements).toHaveLength(14);
    expect(chart.placements[0].longitude).toBeCloseTo(280.3689, 3);
    expect(chart.placements[1].longitude).toBeCloseTo(223.3238, 2);
    expect(chart.houses).toHaveLength(12);
    expect(chart.angles.ascendant.longitude).toBeGreaterThanOrEqual(0);
    expect(
      chart.placements.every((body) => body.house !== null && body.house >= 1 && body.house <= 12)
    ).toBe(true);
    expect(chart.provenance.engine).toBe('sweph@2.10.3-8');
  });
  it('refuses unknown times and polar Placidus fallback', () => {
    expect(() => calculateNatal({ ...birth, time: null })).toThrow('known birth time');
    expect(() => calculateNatal({ ...birth, latitude: 89 })).toThrow('Placidus');
  });
  it('handles wrapped aspects and motion', () => {
    const aspects = calculateAspects([placement('Sun', 359, 0, 1), placement('Moon', 1, 0, 0)]);
    expect(aspects[0]).toMatchObject({ name: 'Conjunction', orb: 2, motion: 'applying' });
  });
});

describe('historical local birth time', () => {
  it("uses historical DST rather than today's offset", () => {
    expect(resolveBirthTime({ ...birth, date: '1990-07-01', timeZone: 'Europe/London' }).utc).toBe(
      '1990-07-01T11:00:00Z'
    );
    expect(resolveBirthTime({ ...birth, date: '1990-01-01', timeZone: 'Europe/London' }).utc).toBe(
      '1990-01-01T12:00:00Z'
    );
  });
  it('rejects nonexistent and unresolved repeated times', () => {
    const repeated = { ...birth, date: '2020-11-01', time: '01:30', timeZone: 'America/New_York' };
    expect(() => resolveBirthTime(repeated)).toThrow('ambiguous');
    expect(resolveBirthTime({ ...repeated, disambiguation: 'earlier' }).utc).toBe(
      '2020-11-01T05:30:00Z'
    );
    expect(resolveBirthTime({ ...repeated, disambiguation: 'later' }).utc).toBe(
      '2020-11-01T06:30:00Z'
    );
    expect(() =>
      resolveBirthTime({ ...repeated, date: '2020-03-08', time: '02:30', disambiguation: 'later' })
    ).toThrow('did not exist');
  });
});
