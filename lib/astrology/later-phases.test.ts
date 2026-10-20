import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateCalendar } from './calendar';
import { calculateNatal, calculateSky } from './engine';
import { REFERENCE, referenceForChart } from './reference';
import { compareCharts } from './synastry';

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
describe('Explore, calendar, and comparisons', () => {
  it('has unique reference entries and matches only real personal placements', () => {
    expect(new Set(REFERENCE.map((entry) => entry.id)).size).toBe(REFERENCE.length);
    expect(REFERENCE.filter((entry) => entry.category === 'Signs')).toHaveLength(12);
    expect(REFERENCE.filter((entry) => entry.category === 'Houses')).toHaveLength(12);
    expect(referenceForChart('sun', chart())[0]).toContain('Capricorn');
    expect(referenceForChart('not-a-symbol', chart())).toEqual([]);
  });
  it('includes solved lunar events, bounded non-lunar windows, and ranked forecasts', () => {
    const natal = chart();
    const original = JSON.stringify(natal);
    const calendar = calculateCalendar(natal, new Date('2024-04-07T00:00:00Z'), 7);
    expect(
      calendar.events.some(
        (event) => event.title === 'New Moon' && event.at.startsWith('2024-04-08T18:')
      )
    ).toBe(true);
    for (const event of calendar.events) {
      expect(event.at >= calendar.start && event.at < calendar.end).toBe(true);
      expect(event.reading.title).toBeTruthy();
      expect(event.reading.explanation).toBeTruthy();
      expect(event.reading.prompt).toBeTruthy();
      if (event.kind === 'Transit') {
        expect(event.title.startsWith('Moon')).toBe(false);
        expect(event.until! > event.at && event.until! <= calendar.end).toBe(true);
        expect(event.orb).toBeLessThanOrEqual(2);
      }
    }
    expect(calendar.forecast.length).toBeLessThanOrEqual(5);
    expect(JSON.stringify(natal)).toBe(original);
  });
  it('solves a real Mercury retrograde station using longitude speed', () => {
    const calendar = calculateCalendar(chart(), new Date('2024-03-30T00:00:00Z'), 7);
    const station = calendar.events.find((event) => event.title === 'Mercury stations retrograde')!;
    expect(station.at.startsWith('2024-04-01T')).toBe(true);
    const mercury = calculateSky(new Date(station.at)).positions.find(
      (body) => body.id === 'Mercury'
    )!;
    expect(Math.abs(mercury.speed)).toBeLessThan(0.00001);
  });
  it('covers complete local days across daylight-saving changes', () => {
    const calendar = calculateCalendar(
      chart(),
      new Date('2026-10-20T23:00:00Z'),
      7,
      'Europe/London'
    );
    expect(calendar.end).toBe('2026-10-28T00:00:00.000Z');
    expect(
      calendar.events.every((event) => event.at >= calendar.start && event.at < calendar.end)
    ).toBe(true);
    expect(
      calendar.events
        .filter((event) => event.kind === 'Transit')
        .every((event) => event.until! <= calendar.end)
    ).toBe(true);
  });
  it('compares chart geometry without compatibility scores or transit motion', () => {
    const natal = chart();
    const original = JSON.stringify(natal);
    const contacts = compareCharts(natal, natal);
    expect(
      contacts.some(
        (contact) =>
          contact.from === 'Sun' &&
          contact.to === 'Sun' &&
          contact.name === 'Conjunction' &&
          contact.orb === 0
      )
    ).toBe(true);
    expect(contacts.every((contact) => contact.orb <= 3 && !('motion' in contact))).toBe(true);
    expect(JSON.stringify(natal)).toBe(original);
  });
});
