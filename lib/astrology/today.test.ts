import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateNatal, calculateSky, placement } from './engine';
import { buildToday, calculateLunarEvents, lunarPhase, transitContacts } from './today';

const natal = () =>
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
describe('calculated Today sky', () => {
  it('matches natal planet positions at the same UTC instant', () => {
    const chart = natal();
    const sky = calculateSky(new Date(chart.utc));
    for (const body of sky.positions)
      expect(body.longitude).toBeCloseTo(
        chart.placements.find((item) => item.id === body.id)!.longitude,
        7
      );
    expect(sky.illumination).toBeGreaterThanOrEqual(0);
    expect(sky.illumination).toBeLessThanOrEqual(1);
  });
  it('classifies phase boundaries without sign-wrap errors', () => {
    expect(lunarPhase(0)).toBe('New Moon');
    expect(lunarPhase(90)).toBe('First quarter');
    expect(lunarPhase(180)).toBe('Full Moon');
    expect(lunarPhase(270)).toBe('Last quarter');
    expect(lunarPhase(359)).toBe('New Moon');
  });
  it('uses a fixed natal target for transit motion', () => {
    const chart = natal();
    chart.placements = [placement('Sun', 1, 0, 100)];
    const contact = transitContacts([placement('Mars', 359, 0, 1)], chart).find(
      (item) => item.natal === 'Sun'
    )!;
    expect(contact).toMatchObject({ name: 'Conjunction', orb: 2, motion: 'applying' });
    expect(
      transitContacts([placement('Mars', 358.9, 0, 1)], chart).some((item) => item.natal === 'Sun')
    ).toBe(false);
  });
  it('solves the next lunar phase and ingress from calculated positions', () => {
    const at = new Date('2024-04-07T12:00:00Z');
    const events = calculateLunarEvents(at);
    expect(events.nextPhase.name).toBe('New Moon');
    expect(events.nextPhase.at.startsWith('2024-04-08T18:')).toBe(true);
    const sky = calculateSky(new Date(events.nextPhase.at));
    expect(Math.min(sky.elongation, 360 - sky.elongation)).toBeLessThan(0.001);
    const ingress = calculateSky(new Date(events.ingress.at)).positions.find(
      (body) => body.id === 'Moon'
    )!;
    expect(ingress.degree).toBeLessThan(0.001);
    expect(ingress.sign).toBe(events.ingress.sign);
  });
  it('returns four grounded focal items without mutating the birth chart', () => {
    const chart = natal();
    const before = JSON.stringify(chart);
    const today = buildToday(chart, new Date('2026-10-03T12:00:00Z'));
    expect(today.focus).toHaveLength(4);
    expect(new Set(today.focus.map((item) => item.id)).size).toBe(4);
    expect(today.focus.every((item) => item.evidence.length > 0)).toBe(true);
    expect(today.contacts.every((contact) => contact.orb <= 2)).toBe(true);
    expect(JSON.stringify(chart)).toBe(before);
  });
});
