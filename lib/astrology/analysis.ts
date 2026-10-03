import type { ChartDNA, Configuration, Distribution } from '@/types/analysis';
import type { NatalChart, Placement } from '@/types/chart';
import { symbolicConnection } from './symbolism';

export const PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];
const signs = [
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
const elements = ['Fire', 'Earth', 'Air', 'Water'];
const modalities = ['Cardinal', 'Fixed', 'Mutable'];
const weights: Record<string, number> = {
  Sun: 3,
  Moon: 3,
  Ascendant: 3,
  Mercury: 2,
  Venus: 2,
  Mars: 2,
  Jupiter: 1,
  Saturn: 1,
  Uranus: 1,
  Neptune: 1,
  Pluto: 1,
};
const themes: Record<string, string> = {
  Fire: 'initiative and expression',
  Earth: 'practical care and steadiness',
  Air: 'ideas and exchange',
  Water: 'feeling and connection',
  Cardinal: 'beginning',
  Fixed: 'sustaining',
  Mutable: 'adapting',
};

function distribution(
  positions: Placement[],
  labels: string[],
  category: (body: Placement) => string
): Distribution[] {
  const total = positions.reduce((score, body) => score + (weights[body.id] ?? 0), 0);
  return labels.map((label) => {
    const matching = positions.filter((body) => category(body) === label);
    const score = matching.reduce((sum, body) => sum + (weights[body.id] ?? 0), 0);
    return {
      label,
      score,
      percentage: total ? (score / total) * 100 : 0,
      bodies: matching.map((body) => body.id),
    };
  });
}

export function detectConfigurations(chart: NatalChart): Configuration[] {
  const planets = chart.placements.filter((body) => PLANETS.includes(body.id));
  const configurations: Configuration[] = [];
  const aspect = (first: string, second: string, name: string) =>
    chart.aspects.find(
      (connection) =>
        connection.name === name &&
        ((connection.from === first && connection.to === second) ||
          (connection.from === second && connection.to === first))
    );
  const evidence = (first: string, second: string, name: string) => {
    const connection = aspect(first, second, name)!;
    return `${first} ${name.toLowerCase()} ${second} (${connection.orb.toFixed(2)}° orb)`;
  };
  for (let first = 0; first < planets.length; first++) {
    for (let second = first + 1; second < planets.length; second++) {
      for (let third = second + 1; third < planets.length; third++) {
        const bodies = [planets[first].id, planets[second].id, planets[third].id];
        const pairs = [
          [bodies[0], bodies[1]],
          [bodies[0], bodies[2]],
          [bodies[1], bodies[2]],
        ];
        if (pairs.every(([from, to]) => aspect(from, to, 'Trine'))) {
          configurations.push({
            name: 'Grand trine',
            bodies,
            evidence: pairs.map(([from, to]) => evidence(from, to, 'Trine')),
          });
        }
        for (const apex of bodies) {
          const base = bodies.filter((id) => id !== apex);
          if (
            aspect(base[0], base[1], 'Opposition') &&
            base.every((id) => aspect(apex, id, 'Square'))
          ) {
            configurations.push({
              name: 'T-square',
              bodies: [apex, ...base],
              evidence: [
                evidence(base[0], base[1], 'Opposition'),
                ...base.map((id) => evidence(apex, id, 'Square')),
              ],
            });
          }
        }
        for (let fourth = third + 1; fourth < planets.length; fourth++) {
          const quartet = [...bodies, planets[fourth].id];
          const edges = quartet.flatMap((from, index) =>
            quartet.slice(index + 1).map((to) => [from, to])
          );
          const oppositions = edges.filter(([from, to]) => aspect(from, to, 'Opposition'));
          const squares = edges.filter(([from, to]) => aspect(from, to, 'Square'));
          if (
            oppositions.length === 2 &&
            new Set(oppositions.flat()).size === 4 &&
            squares.length === 4
          ) {
            configurations.push({
              name: 'Grand cross',
              bodies: quartet,
              evidence: [
                ...oppositions.map(([from, to]) => evidence(from, to, 'Opposition')),
                ...squares.map(([from, to]) => evidence(from, to, 'Square')),
              ],
            });
          }
        }
      }
    }
  }
  for (const sign of signs) {
    const matching = planets.filter((body) => body.sign === sign);
    if (matching.length >= 3)
      configurations.push({
        name: 'Stellium',
        bodies: matching.map((body) => body.id),
        evidence: [
          `${matching.length} planets in ${sign}; sign-based definition, not necessarily a close conjunction.`,
        ],
      });
  }
  return configurations;
}

export function analyzeChart(chart: NatalChart): ChartDNA {
  const positions = [
    ...chart.placements.filter((body) => PLANETS.includes(body.id)),
    chart.angles.ascendant,
  ];
  const elementDistribution = distribution(
    positions,
    elements,
    (body) => elements[signs.indexOf(body.sign) % 4]
  );
  const modalityDistribution = distribution(
    positions,
    modalities,
    (body) => modalities[signs.indexOf(body.sign) % 3]
  );
  const dominantSigns = distribution(positions, signs, (body) => body.sign)
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score);
  const strongestAspect =
    [...chart.aspects]
      .filter((connection) => PLANETS.includes(connection.from) && PLANETS.includes(connection.to))
      .sort((first, second) => first.orb - second.orb)[0] ?? null;
  const top = Math.max(...elementDistribution.map((item) => item.score));
  const dominantElements = elementDistribution.filter((item) => item.score === top);
  const configurations = detectConfigurations(chart);
  const focus = strongestAspect;
  const emphasis = Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    bodies: chart.placements
      .filter((body) => PLANETS.includes(body.id) && body.house === index + 1)
      .map((body) => body.id),
  }))
    .filter((item) => item.bodies.length > 0)
    .sort((first, second) => second.bodies.length - first.bodies.length);
  return {
    elements: elementDistribution,
    modalities: modalityDistribution,
    dominantSigns,
    emphasis,
    configurations,
    strongestAspect,
    method:
      'Weighted planets and ascendant: Sun, Moon, rising 3 each; Mercury, Venus, Mars 2 each; Jupiter through Pluto 1 each. Nodes, Chiron, Lilith, and midheaven excluded. A declared interpretive convention, not a scientific personality score. Configurations use natal aspect orbs; stelliums mean at least three planets in one sign.',
    insight: focus
      ? {
          title: `${focus.from} meets ${focus.to}`,
          reflection: symbolicConnection(focus.from, focus.to, focus.angle),
          prompt:
            focus.angle === 90 || focus.angle === 180
              ? 'Where might two different needs both deserve space, without either needing to win?'
              : 'What feels naturally connected in your life, and how could you use that connection deliberately?',
          evidence: [
            `${focus.from} ${focus.name.toLowerCase()} ${focus.to}: ${focus.orb.toFixed(2)}° orb, ${focus.motion}.`,
            ...[focus.from, focus.to].map((id) => {
              const body = positions.find((position) => position.id === id)!;
              return `${id}: ${body.degree.toFixed(2)}° ${body.sign}, house ${body.house}.`;
            }),
          ],
        }
      : {
          title:
            dominantElements.length === 1
              ? `${dominantElements[0].label}, in emphasis`
              : 'More than one element, in balance',
          reflection: `Under this scoring convention, ${dominantElements.map((item) => item.label).join(' and ')} ${dominantElements.length === 1 ? 'has' : 'share'} the highest weight. These symbols invite reflection on ${dominantElements.map((item) => themes[item.label]).join(' and ')}; they do not define your personality.`,
          prompt:
            'Which of these themes feels useful to explore, and which does not fit your experience?',
          evidence: dominantElements.map(
            (item) => `${item.label}: ${item.score} weighted points; ${item.bodies.join(', ')}.`
          ),
        },
  };
}
