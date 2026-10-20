import sweph from 'sweph';
import { afterEach, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { calculateCalendar } from './calendar';
import * as engine from './engine';
import { buildToday } from './today';

const birth = {
  date: '2000-01-01',
  time: '12:00',
  timeZone: 'UTC',
  disambiguation: 'reject' as const,
  place: 'Cache test',
  latitude: 51.4779,
  longitude: 0,
  placeSource: 'test',
};
afterEach(() => vi.restoreAllMocks());

it('reuses exact sky samples without rounding or sharing mutable placements', () => {
  const calc = vi.spyOn(sweph, 'calc');
  const at = new Date('2026-09-17T12:13:14.567Z');
  const first = engine.calculateSky(at);
  expect(calc).toHaveBeenCalled();
  calc.mockClear();
  const second = engine.calculateSky(new Date(at));
  expect(calc).not.toHaveBeenCalled();
  second.positions[0].longitude = -1;
  expect(engine.calculateSky(at)).toEqual(first);
  expect(engine.calculateSky(new Date(at.getTime() + 1)).at).toBe('2026-09-17T12:13:14.568Z');
  expect(calc).toHaveBeenCalled();
});

it('reuses natal work but recomputes changed birth coordinates', () => {
  const first = engine.calculateNatal(birth);
  const calc = vi.spyOn(sweph, 'calc');
  const second = engine.calculateNatal({ ...birth });
  expect(calc).not.toHaveBeenCalled();
  second.houses[0] = -1;
  expect(engine.calculateNatal(birth)).toEqual(first);
  const changed = engine.calculateNatal({ ...birth, longitude: 10 });
  expect(changed.angles.ascendant.longitude).not.toBe(first.angles.ascendant.longitude);
  expect(calc).toHaveBeenCalled();
});

it('shares live minute snapshots, refreshes the next minute and preserves explicit times', () => {
  const chart = engine.calculateNatal(birth);
  const now = vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-18T12:13:14.567Z').getTime());
  const first = buildToday(chart);
  const calculate = vi.spyOn(engine, 'calculateSky');
  now.mockReturnValue(new Date('2026-09-18T12:13:59.999Z').getTime());
  const second = buildToday(chart);
  expect(calculate).not.toHaveBeenCalled();
  expect(second.sky.at).toBe('2026-09-18T12:13:00.000Z');
  second.focus[0].title = 'Changed';
  expect(buildToday(chart)).toEqual(first);
  now.mockReturnValue(new Date('2026-09-18T12:14:00Z').getTime());
  expect(buildToday(chart).sky.at).toBe('2026-09-18T12:14:00.000Z');
  expect(buildToday(chart, new Date('2026-09-18T12:13:14.567Z')).sky.at).toBe(
    '2026-09-18T12:13:14.567Z'
  );
});

it('reuses full calendars while separating chart, range, start and timezone inputs', () => {
  const chart = engine.calculateNatal(birth);
  const start = new Date('2026-10-24T00:00:00Z');
  const first = calculateCalendar(chart, start, 7, 'UTC');
  const calculate = vi.spyOn(engine, 'calculateSky');
  const second = calculateCalendar(structuredClone(chart), new Date(start), 7, 'UTC');
  expect(calculate).not.toHaveBeenCalled();
  second.events.length = 0;
  expect(calculateCalendar(chart, start, 7, 'UTC')).toEqual(first);
  for (const args of [
    [engine.calculateNatal({ ...birth, longitude: 12 }), start, 7, 'UTC'],
    [chart, start, 30, 'UTC'],
    [chart, new Date('2026-10-25T00:00:00Z'), 7, 'UTC'],
    [chart, start, 7, 'Europe/London'],
  ] as const) {
    calculate.mockClear();
    calculateCalendar(args[0], args[1], args[2], args[3]);
    expect(calculate).toHaveBeenCalled();
  }
});
