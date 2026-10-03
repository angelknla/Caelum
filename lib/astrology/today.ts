import 'server-only';
import { PLANETS } from '@/lib/astrology/analysis';
import { calculateSky, normalize, SIGNS } from '@/lib/astrology/engine';
import type { TodayFocus, TransitContact } from '@/types/analysis';
import type { NatalChart, Placement } from '@/types/chart';
import { SIGN_THEMES, symbolicConnection } from './symbolism';

const hour = 3600000;
const aspects = [
  { name: 'Conjunction', angle: 0 },
  { name: 'Sextile', angle: 60 },
  { name: 'Square', angle: 90 },
  { name: 'Trine', angle: 120 },
  { name: 'Opposition', angle: 180 },
];
const distance = (first: number, second: number) => Math.abs(((first - second + 540) % 360) - 180);
const phaseNames = [
  'New Moon',
  'Waxing crescent',
  'First quarter',
  'Waxing gibbous',
  'Full Moon',
  'Waning gibbous',
  'Last quarter',
  'Waning crescent',
];
const exactPhaseNames = ['New Moon', 'First quarter', 'Full Moon', 'Last quarter'];

export function lunarPhase(elongation: number) {
  return phaseNames[Math.floor((normalize(elongation) + 22.5) / 45) % 8];
}

export function transitContacts(sky: Placement[], natal: NatalChart): TransitContact[] {
  const contacts: TransitContact[] = [];
  const targets = [
    ...natal.placements.filter((body) => PLANETS.includes(body.id)),
    natal.angles.ascendant,
    natal.angles.midheaven,
  ];
  for (const moving of sky.filter((body) => PLANETS.includes(body.id))) {
    for (const target of targets) {
      for (const aspect of aspects) {
        const orb = Math.abs(distance(moving.longitude, target.longitude) - aspect.angle);
        if (orb > 2) continue;
        const later = Math.abs(
          distance(normalize(moving.longitude + moving.speed / 1440), target.longitude) -
            aspect.angle
        );
        contacts.push({
          transiting: moving.id,
          natal: target.id,
          name: aspect.name,
          angle: aspect.angle,
          orb,
          motion: orb < 0.00001 ? 'exact' : later < orb ? 'applying' : 'separating',
        });
      }
    }
  }
  return contacts.sort(
    (first, second) =>
      first.orb - second.orb ||
      first.transiting.localeCompare(second.transiting) ||
      first.natal.localeCompare(second.natal)
  );
}

function nextCrossing(
  at: Date,
  start: number,
  target: number,
  value: (date: Date) => number,
  maximumHours: number
) {
  const progress = (date: Date) => normalize(value(date) - start);
  const needed = normalize(target - start) || 360;
  let lower = at.getTime();
  for (let index = 1; index <= maximumHours; index++) {
    const upper = at.getTime() + index * hour;
    if (progress(new Date(upper)) >= needed) {
      let high = upper;
      for (let iteration = 0; iteration < 24 && high - lower > 1000; iteration++) {
        const middle = (lower + high) / 2;
        if (progress(new Date(middle)) >= needed) high = middle;
        else lower = middle;
      }
      return new Date(high).toISOString();
    }
    lower = upper;
  }
  throw new Error('Could not resolve the next lunar event within the search interval.');
}

export function calculateLunarEvents(at: Date, sky = calculateSky(at)) {
  const quarter = (Math.floor(sky.elongation / 90) + 1) % 4;
  const nextPhase = {
    name: exactPhaseNames[quarter],
    at: nextCrossing(
      at,
      sky.elongation,
      quarter * 90,
      (date) => calculateSky(date).elongation,
      24 * 10
    ),
  };
  const moon = sky.positions.find((body) => body.id === 'Moon')!;
  const nextSign = (Math.floor(moon.longitude / 30) + 1) % 12;
  const ingress = {
    sign: SIGNS[nextSign],
    at: nextCrossing(
      at,
      moon.longitude,
      nextSign * 30,
      (date) => calculateSky(date).positions.find((body) => body.id === 'Moon')!.longitude,
      24 * 4
    ),
  };
  return { nextPhase, ingress };
}

const contactEvidence = (contact: TransitContact) =>
  `Transiting ${contact.transiting} ${contact.name.toLowerCase()} natal ${contact.natal}: ${contact.orb.toFixed(2)}° orb, ${contact.motion}.`;

export function buildToday(natal: NatalChart, at = new Date()) {
  const sky = calculateSky(at);
  const moon = sky.positions.find((body) => body.id === 'Moon')!;
  const contacts = transitContacts(sky.positions, natal);
  const main = contacts.find((contact) => contact.transiting !== 'Moon') ?? contacts[0];
  const moonContact = contacts.find((contact) => contact.transiting === 'Moon');
  const opportunity = contacts.find(
    (contact) => contact !== main && (contact.angle === 60 || contact.angle === 120)
  );
  const caution = contacts.find(
    (contact) => contact !== main && (contact.angle === 90 || contact.angle === 180)
  );
  const phase = lunarPhase(sky.elongation);
  const focus: TodayFocus[] = [
    {
      id: 'focus',
      label: 'Main focus',
      title: main
        ? `${main.transiting} ${main.name.toLowerCase()} natal ${main.natal}`
        : 'Room for your own rhythm',
      reflection: main
        ? symbolicConnection(main.transiting, main.natal, main.angle)
        : 'No calculated major transit contact meets the 2° threshold at this moment. Let your own priorities, rather than an invented cosmic instruction, set the rhythm.',
      prompt: 'What deserves your deliberate attention today?',
      evidence: main
        ? [
            contactEvidence(main),
            'Closest non-lunar contact; closest lunar contact only if no non-lunar contact qualifies.',
          ]
        : [
            'Sun through Pluto to natal planets, ascendant, and midheaven; five major aspects; 2° maximum orb.',
          ],
    },
    {
      id: 'emotions',
      label: 'Emotional weather',
      title: `Moon in ${moon.sign}`,
      reflection: `The Moon in ${moon.sign} offers a reflection on ${SIGN_THEMES[moon.sign]}. Let this be a question to sit with, not a feeling you are required to have.`,
      prompt: 'What feeling needs acknowledgement without becoming a verdict?',
      evidence: [
        `Moon: ${moon.degree.toFixed(2)}° ${moon.sign}; ${(sky.illumination * 100).toFixed(1)}% illuminated; ${sky.elongation.toFixed(2)}° Moon–Sun elongation.`,
        ...(moonContact
          ? [contactEvidence(moonContact)]
          : ['No lunar major contact is within 2° at this moment.']),
      ],
    },
    {
      id: 'opportunity',
      label: 'Opportunity',
      title: opportunity
        ? `${opportunity.transiting} ${opportunity.name.toLowerCase()} natal ${opportunity.natal}`
        : 'Make space for possibility',
      reflection: opportunity
        ? symbolicConnection(opportunity.transiting, opportunity.natal, opportunity.angle)
        : 'No additional sextile or trine qualifies at this moment. Possibility does not depend on a transit being present.',
      prompt: 'What small experiment could be worthwhile on its own terms?',
      evidence: opportunity
        ? [contactEvidence(opportunity)]
        : [
            'No additional sampled sextile or trine within 2°; the main-focus contact is not repeated here.',
          ],
    },
    {
      id: 'care',
      label: 'A little care',
      title: caution
        ? `${caution.transiting} ${caution.name.toLowerCase()} natal ${caution.natal}`
        : 'Leave a little breathing room',
      reflection: caution
        ? symbolicConnection(caution.transiting, caution.natal, caution.angle)
        : 'No additional square or opposition qualifies at this moment. This is not a guarantee of an easy day or a reason to overlook real concerns.',
      prompt: 'Where would a pause or a clearer boundary be helpful?',
      evidence: caution
        ? [contactEvidence(caution)]
        : [
            'No additional sampled square or opposition within 2°; the main-focus contact is not repeated here.',
          ],
    },
  ];
  return { sky, moon, phase, contacts, focus, events: calculateLunarEvents(at, sky) };
}
