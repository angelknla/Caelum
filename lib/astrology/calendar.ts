import 'server-only';
import type { TransitContact } from '@/types/analysis';
import type { NatalChart } from '@/types/chart';
import { PLANETS } from './analysis';
import { calculateSky } from './engine';
import { symbolicConnection } from './symbolism';
import { calculateLunarEvents, transitContacts } from './today';

export type SkyEvent = {
  id: string;
  kind: 'Lunar phase' | 'Moon ingress' | 'Station' | 'Transit';
  at: string;
  until?: string;
  title: string;
  evidence: string;
  reflection?: string;
  orb?: number;
};
const hour = 3600000;
const step = 6 * hour;

function stationTime(body: string, lower: number, upper: number, negative: boolean) {
  for (let iteration = 0; iteration < 25 && upper - lower > 1000; iteration++) {
    const middle = (lower + upper) / 2;
    const speed = calculateSky(new Date(middle)).positions.find((item) => item.id === body)!.speed;
    if (speed < 0 === negative) lower = middle;
    else upper = middle;
  }
  return new Date(upper).toISOString();
}

export function calculateCalendar(chart: NatalChart, start: Date, days: 7 | 30) {
  if (!Number.isFinite(start.getTime()) || ![7, 30].includes(days))
    throw new Error('Invalid calendar range.');
  const end = start.getTime() + days * 24 * hour;
  const events: SkyEvent[] = [];
  const initial = calculateSky(start);
  let previous = initial;
  const active = new Map<
    string,
    { contact: TransitContact; start: number; last: number; best: number }
  >();
  const finish = (key: string) => {
    const window = active.get(key)!;
    const contact = window.contact;
    events.push({
      id: `transit-${key}-${window.start}`,
      kind: 'Transit',
      at: new Date(window.start).toISOString(),
      until: new Date(Math.min(end, window.last + step)).toISOString(),
      title: `${contact.transiting} ${contact.name.toLowerCase()} natal ${contact.natal}`,
      orb: contact.orb,
      reflection: symbolicConnection(contact.transiting, contact.natal, contact.angle),
      evidence: `6-hour samples; ${contact.orb.toFixed(3)}° smallest sampled orb at ${new Date(window.best).toISOString()}. 2° contact threshold; window edges approximate within one sample and clipped to this date range. Natal targets are fixed. Not an exact peak time.`,
    });
    active.delete(key);
  };
  for (let at = start.getTime(); at <= end; at += step) {
    const sky = at === start.getTime() ? initial : calculateSky(new Date(at));
    const present = new Set<string>();
    for (const contact of transitContacts(
      sky.positions.filter((body) => body.id !== 'Moon'),
      chart
    )) {
      if (at === end) continue;
      const key = `${contact.transiting}-${contact.natal}-${contact.name}`;
      present.add(key);
      const window = active.get(key);
      if (!window) active.set(key, { contact, start: at, last: at, best: at });
      else {
        window.last = at;
        if (contact.orb < window.contact.orb) {
          window.contact = contact;
          window.best = at;
        }
      }
    }
    for (const key of [...active.keys()]) if (!present.has(key)) finish(key);
    if (at > start.getTime()) {
      for (const body of sky.positions.filter(
        (item) => PLANETS.includes(item.id) && !['Sun', 'Moon'].includes(item.id)
      )) {
        const before = previous.positions.find((item) => item.id === body.id)!;
        if (before.speed < 0 !== body.speed < 0) {
          const time = stationTime(body.id, at - step, at, before.speed < 0);
          events.push({
            id: `station-${body.id}-${time}`,
            kind: 'Station',
            at: time,
            title: `${body.id} stations ${body.speed < 0 ? 'retrograde' : 'direct'}`,
            evidence:
              'Geocentric tropical longitude speed crosses zero; numerical solution to approximately one second. Retrograde is apparent motion, not physical reversal.',
          });
        }
      }
    }
    previous = sky;
  }
  for (const key of [...active.keys()]) finish(key);
  const seen = new Set<string>();
  let cursor = start;
  for (let iteration = 0; iteration < days; iteration++) {
    const lunar = calculateLunarEvents(cursor);
    const next = [
      {
        kind: 'Lunar phase' as const,
        at: lunar.nextPhase.at,
        title: lunar.nextPhase.name,
        evidence:
          'Exact geocentric Moon–Sun elongation at a quarter-cycle boundary; numerical solution to approximately one second.',
      },
      {
        kind: 'Moon ingress' as const,
        at: lunar.ingress.at,
        title: `Moon enters ${lunar.ingress.sign}`,
        evidence:
          'Geocentric tropical Moon longitude crosses a 30° sign boundary; numerical solution to approximately one second.',
      },
    ];
    for (const event of next) {
      const key = `${event.kind}-${event.title}-${event.at.slice(0, 16)}`;
      if (new Date(event.at).getTime() < end && !seen.has(key)) {
        seen.add(key);
        events.push({ ...event, id: key });
      }
    }
    const soonest = Math.min(...next.map((event) => new Date(event.at).getTime()));
    if (soonest >= end) break;
    cursor = new Date(soonest + 2000);
  }
  events.sort(
    (first, second) => first.at.localeCompare(second.at) || first.title.localeCompare(second.title)
  );
  const forecast = events
    .filter((event) => event.kind === 'Transit')
    .sort((first, second) => (first.orb ?? 99) - (second.orb ?? 99))
    .slice(0, 5);
  return {
    start: start.toISOString(),
    end: new Date(end).toISOString(),
    days,
    events,
    forecast,
    retrogrades: initial.positions
      .filter((body) => PLANETS.includes(body.id) && body.retrograde)
      .map((body) => body.id),
  };
}
