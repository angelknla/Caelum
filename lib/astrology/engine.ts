import 'server-only';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sweph from 'sweph';
import { resolveBirthTime } from '@/lib/astrology/birth';
import type { Aspect, BirthInput, NatalChart, Placement } from '@/types/chart';

export const DATA_REVISION = 'aacf962d19d79f8bc921dbcdaacf306d85be1917';
export const ENGINE_VERSION = 'sweph@2.10.3-8';
export const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];
const constants = sweph.constants;
const bodies = [
  ['Sun', constants.SE_SUN],
  ['Moon', constants.SE_MOON],
  ['Mercury', constants.SE_MERCURY],
  ['Venus', constants.SE_VENUS],
  ['Mars', constants.SE_MARS],
  ['Jupiter', constants.SE_JUPITER],
  ['Saturn', constants.SE_SATURN],
  ['Uranus', constants.SE_URANUS],
  ['Neptune', constants.SE_NEPTUNE],
  ['Pluto', constants.SE_PLUTO],
  ['North node', constants.SE_TRUE_NODE],
  ['Chiron', constants.SE_CHIRON],
  ['Lilith', constants.SE_MEAN_APOG],
] as const;
const aspectSettings = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Sextile', angle: 60, orb: 4 },
  { name: 'Square', angle: 90, orb: 6 },
  { name: 'Trine', angle: 120, orb: 6 },
  { name: 'Opposition', angle: 180, orb: 8 },
];
export const normalize = (value: number) => ((value % 360) + 360) % 360;
const separation = (first: number, second: number) =>
  Math.abs(((first - second + 540) % 360) - 180);

export function placement(
  id: string,
  longitude: number,
  latitude = 0,
  speed = 0,
  house: number | null = null
): Placement {
  const normalized = normalize(longitude);
  return {
    id,
    longitude: normalized,
    latitude,
    speed,
    sign: SIGNS[Math.floor(normalized / 30)],
    degree: normalized % 30,
    retrograde: speed < 0,
    house,
  };
}

export function calculateAspects(positions: Placement[]): Aspect[] {
  const aspects: Aspect[] = [];
  for (let first = 0; first < positions.length; first++) {
    for (let second = first + 1; second < positions.length; second++) {
      const from = positions[first];
      const to = positions[second];
      if (from.id.includes('node') && to.id.includes('node')) continue;
      const distance = separation(from.longitude, to.longitude);
      for (const setting of aspectSettings) {
        const orb = Math.abs(distance - setting.angle);
        const limit = ['North node', 'South node', 'Chiron', 'Lilith'].some(
          (id) => id === from.id || id === to.id
        )
          ? Math.min(setting.orb, 3)
          : setting.orb;
        if (orb > limit) continue;
        const later = Math.abs(
          separation(
            normalize(from.longitude + from.speed / 1440),
            normalize(to.longitude + to.speed / 1440)
          ) - setting.angle
        );
        aspects.push({
          from: from.id,
          to: to.id,
          name: setting.name,
          angle: setting.angle,
          orb,
          motion: orb < 0.00001 ? 'exact' : later < orb ? 'applying' : 'separating',
        });
      }
    }
  }
  return aspects.sort((first, second) => first.orb - second.orb);
}

export function calculateNatal(input: BirthInput): NatalChart {
  const resolved = resolveBirthTime(input);
  const directory = path.join(process.cwd(), 'ephemeris');
  for (const file of ['sepl_18.se1', 'semo_18.se1', 'seas_18.se1']) {
    if (!existsSync(path.join(directory, file)))
      throw new Error('Ephemeris data is missing. Run yarn setup:ephemeris.');
  }
  sweph.set_ephe_path(directory);
  const date = new Date(resolved.utc);
  const dates = sweph.utc_to_jd(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    constants.SE_GREG_CAL
  );
  if (dates.flag < 0)
    throw new Error('The birth date could not be converted to astronomical time.');
  const [et, ut] = dates.data;
  const houses = sweph.houses_ex2(ut, 0, input.latitude, input.longitude, 'P');
  if (houses.flag < 0)
    throw new Error(
      'Placidus houses are unavailable at this latitude. Your birth details can be saved as a draft.'
    );
  const obliquity = sweph.calc(et, constants.SE_ECL_NUT, 0).data[0];
  const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
  const positions = bodies.map(([id, code]) => {
    const result = sweph.calc(et, code, flags);
    if (
      result.flag < 0 ||
      !result.data.every(Number.isFinite) ||
      !(result.flag & constants.SEFLG_SWIEPH)
    )
      throw new Error(`Swiss Ephemeris could not calculate ${id} from its data files.`);
    const [longitude, latitude, , speed] = result.data;
    const house = sweph.house_pos(houses.data.points[2], input.latitude, obliquity, 'P', [
      longitude,
      latitude,
    ]);
    if (house.error || !Number.isFinite(house.data) || house.data < 1 || house.data >= 13)
      throw new Error(`Could not calculate the house for ${id}.`);
    return placement(id, longitude, latitude, speed, Math.floor(house.data));
  });
  const node = positions.find((body) => body.id === 'North node')!;
  const southLongitude = normalize(node.longitude + 180);
  const southHouse = sweph.house_pos(houses.data.points[2], input.latitude, obliquity, 'P', [
    southLongitude,
    -node.latitude,
  ]);
  positions.push(
    placement('South node', southLongitude, -node.latitude, node.speed, Math.floor(southHouse.data))
  );
  return {
    schemaVersion: 1,
    utc: resolved.utc,
    julianDayUT: ut,
    placements: positions,
    angles: {
      ascendant: placement('Ascendant', houses.data.points[0]),
      midheaven: placement('Midheaven', houses.data.points[1]),
    },
    houses: houses.data.houses,
    aspects: calculateAspects(positions),
    provenance: {
      engine: ENGINE_VERSION,
      dataRevision: DATA_REVISION,
      zodiac: 'tropical',
      frame: 'geocentric',
      houses: 'Placidus',
      node: 'true',
      lilith: 'mean apogee',
      timezone: input.timeZone,
      offset: resolved.offset,
    },
  };
}
