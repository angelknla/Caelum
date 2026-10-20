import 'server-only';
import { createHash } from 'node:crypto';
import { PLANETS } from '@/lib/astrology/analysis';
import { calculateSky, normalize, SIGNS } from '@/lib/astrology/engine';
import { BoundedCache } from '@/lib/cache';
import type { TodayFocus, TransitContact } from '@/types/analysis';
import type { NatalChart, Placement } from '@/types/chart';
import { dailyContactReading, lunarReadings, selectDailyContact } from './daily-reading';

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

const lunarCache = new BoundedCache<ReturnType<typeof computeLunarEvents>>(256, 60 * 60 * 1000);
export function calculateLunarEvents(
  at: Date,
  sky = calculateSky(at)
): ReturnType<typeof computeLunarEvents> {
  const key = JSON.stringify([
    at.getTime(),
    sky.elongation,
    sky.positions.find((body) => body.id === 'Moon')?.longitude,
  ]);
  return structuredClone(lunarCache.getOrCreate(key, () => computeLunarEvents(at, sky)));
}

function computeLunarEvents(at: Date, sky: ReturnType<typeof calculateSky>) {
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

const todayCache = new BoundedCache<ReturnType<typeof computeToday>>(128, 60 * 1000);
export function buildToday(natal: NatalChart, at?: Date): ReturnType<typeof computeToday> {
  // Live readings share a minute snapshot; explicit dates are never rounded.
  const snapshot = at ?? new Date(Math.floor(Date.now() / 60000) * 60000);
  const key = createHash('sha256')
    .update(JSON.stringify([natal, snapshot.getTime()]))
    .digest('hex');
  return structuredClone(todayCache.getOrCreate(key, () => computeToday(natal, snapshot)));
}

function computeToday(natal: NatalChart, at: Date) {
  const sky = calculateSky(at);
  const moon = sky.positions.find((body) => body.id === 'Moon')!;
  const contacts = transitContacts(sky.positions, natal);
  const main = selectDailyContact(contacts);
  const mainReading = main ? dailyContactReading(main) : null;
  const emotionalReading = lunarReadings[moon.sign];
  const moonContact = contacts.find((contact) => contact.transiting === 'Moon');
  const opportunity = contacts.find(
    (contact) => contact !== main && (contact.angle === 60 || contact.angle === 120)
  );
  const caution = contacts.find(
    (contact) => contact !== main && (contact.angle === 90 || contact.angle === 180)
  );
  const phase = lunarPhase(sky.elongation);
  const lunarSummary = `With the Moon in ${moon.sign}, ${emotionalReading.summary}`;
  const summary = {
    text: `${lunarSummary} ${mainReading?.reflection ?? 'Keep your plans flexible and let your actual priorities set the pace.'}`,
    evidence: [
      `Moon: ${moon.degree.toFixed(2)}° ${moon.sign}. The Moon-sign theme is shared; the transit reading uses your birth chart.`,
      ...(main
        ? [contactEvidence(main)]
        : ['No major transit to your natal planets or angles is within 2° at this moment.']),
    ],
  };
  const focus: TodayFocus[] = [
    {
      id: 'focus',
      label: 'Main focus',
      title: mainReading?.title ?? 'Room for your own rhythm',
      reflection:
        mainReading?.reflection ??
        'Keep your plans flexible and choose a priority that matters to you. A little space between commitments can help you notice what you need.',
      explanation:
        mainReading?.explanation ??
        'Start with what is already in front of you: your energy, your commitments, and the time you have. Choose one thing to give proper attention, then leave enough room to adjust if the day asks for something different.',
      prompt: mainReading?.prompt ?? 'What deserves your deliberate attention today?',
      evidence: main
        ? [
            contactEvidence(main),
            'Closest Sun–Mars contact to a natal personal planet or angle, then other Sun–Mars contacts, then the closest longer-running contact. Each group is ranked by orb.',
          ]
        : [
            'Sun through Pluto to natal planets, ascendant, and midheaven; five major aspects; 2° maximum orb.',
          ],
    },
    {
      id: 'emotions',
      label: 'Emotional weather',
      title: emotionalReading.title,
      reflection: lunarSummary,
      explanation: emotionalReading.explanation,
      prompt: emotionalReading.prompt,
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
      title: opportunity ? dailyContactReading(opportunity).title : 'Make space for possibility',
      reflection: opportunity
        ? dailyContactReading(opportunity).reflection
        : 'Give a small idea a little room: ask a question, try a different approach, or make time for something you enjoy.',
      explanation: opportunity
        ? dailyContactReading(opportunity).explanation
        : 'Look for something you can explore without needing a particular result: a conversation, a first attempt, or a change to your routine. Notice what gives you energy, and let that help you decide whether to take another step.',
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
      title: caution ? dailyContactReading(caution).title : 'Leave a little breathing room',
      reflection: caution
        ? dailyContactReading(caution).reflection
        : 'Leave a little space between commitments. A pause can help you respond with more care when something needs your attention.',
      explanation: caution
        ? dailyContactReading(caution).explanation
        : 'Check where a small adjustment could make the day more manageable: allow extra time, say what you need, or take a break before responding. You can revise a plan without treating the change as a failure.',
      prompt: 'Where would a pause or a clearer boundary be helpful?',
      evidence: caution
        ? [contactEvidence(caution)]
        : [
            'No additional sampled square or opposition within 2°; the main-focus contact is not repeated here.',
          ],
    },
  ];
  return { sky, moon, phase, contacts, summary, focus, events: calculateLunarEvents(at, sky) };
}
