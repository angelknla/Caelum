import { BODY_THEMES, SIGN_THEMES } from './symbolism';

export type ReferenceEntry = {
  id: string;
  name: string;
  category: 'Planets' | 'Signs' | 'Houses' | 'Aspects';
  summary: string;
  reflection: string;
  prompt: string;
};
const signs = Object.keys(SIGN_THEMES);
const elements = ['Fire', 'Earth', 'Air', 'Water'];
const modes = ['Cardinal', 'Fixed', 'Mutable'];
const houses = [
  ['Self & beginnings', 'how you approach new situations and make yourself known'],
  ['Resources & values', 'what sustains you, what you value, and how you define enough'],
  ['Language & nearby life', 'learning, everyday conversations, and your immediate surroundings'],
  ['Roots & belonging', 'home, family histories, and the private foundations of your life'],
  ['Expression & delight', 'creativity, play, and the pleasure of making something your own'],
  ['Practice & care', 'daily work, routines, and the practical ways you care for yourself'],
  ['Partnership & encounter', 'one-to-one relationships and the balance between self and other'],
  ['Trust & shared resources', 'intimacy, shared obligations, and what asks for trust'],
  [
    'Perspective & discovery',
    'wider learning, travel, beliefs, and the stories that give life meaning',
  ],
  [
    'Direction & contribution',
    'public roles, responsibility, and the contribution you want to make',
  ],
  [
    'Community & possibility',
    'friendship, collective efforts, and hopes that extend beyond yourself',
  ],
  [
    'Solitude & unseen life',
    'rest, retreat, private reflection, and experiences that resist easy labels',
  ],
];
const aspects = [
  [
    'Conjunction',
    0,
    'Themes meet in the same part of the sky. Their closeness can describe concentration, but not whether that concentration will be easy or difficult.',
  ],
  [
    'Sextile',
    60,
    'A symbol of potential cooperation. It can be useful to ask what becomes possible through participation rather than assume an opportunity will arrive on its own.',
  ],
  [
    'Square',
    90,
    'A symbol of differing needs or approaches. Tension can invite adjustment; it does not predict conflict or failure.',
  ],
  [
    'Trine',
    120,
    'A symbol of continuity and cooperation. What feels familiar may be supportive, or may benefit from being used more deliberately.',
  ],
  [
    'Opposition',
    180,
    'A symbol of contrast across a shared axis. Reflection can make room for both perspectives without requiring one to defeat the other.',
  ],
] as const;
const slug = (name: string) => name.toLowerCase().replaceAll(' ', '-');

export const REFERENCE: ReferenceEntry[] = [
  ...Object.entries(BODY_THEMES).map(([name, theme]) => ({
    id: slug(name),
    name,
    category: 'Planets' as const,
    summary: theme,
    reflection: `${name} is used in symbolic astrology to explore ${theme}. Its sign describes an interpretive style, its house an area of life, and its aspects relationships with other chart symbols. None of these determines your personality or future.`,
    prompt: `Where do themes of ${theme} feel relevant, and where do they not fit?`,
  })),
  ...['North node', 'South node', 'Chiron', 'Lilith'].map((name) => ({
    id: slug(name),
    name,
    category: 'Planets' as const,
    summary: name.includes('node')
      ? 'A calculated lunar orbital point'
      : name === 'Chiron'
        ? 'A minor body used in modern symbolic astrology'
        : 'The mean lunar apogee, not a planet',
    reflection: name.includes('node')
      ? 'Caelum uses the true north node and its opposite south node. These points mark where the lunar orbit meets the ecliptic. Symbolic narratives about growth and familiarity are interpretations, not claims about destiny or past lives.'
      : name === 'Chiron'
        ? 'Chiron is a minor body. Modern astrology sometimes associates it with vulnerability and learning through experience. A placement cannot diagnose trauma, illness, or a need for treatment.'
        : 'Caelum uses mean lunar apogee Lilith. It is a calculated point in the lunar orbit, distinct from the asteroid Lilith. Themes of autonomy are symbolic readings, not astronomical properties.',
    prompt: 'What is useful in this symbol, without turning it into a fixed story about yourself?',
  })),
  ...signs.map((name, index) => ({
    id: slug(name),
    name,
    category: 'Signs' as const,
    summary: `${elements[index % 4]} / ${modes[index % 3]}`,
    reflection: `${name} offers a symbolic language for ${SIGN_THEMES[name]}. A tropical sign is a 30-degree sector measured from the March equinox, not the same as the visible constellation. A sign is one part of a chart, not a complete identity.`,
    prompt: `How might ${SIGN_THEMES[name]} become a useful question rather than a label?`,
  })),
  ...houses.map(([name, theme], index) => ({
    id: `house-${index + 1}`,
    name: `House ${index + 1}`,
    category: 'Houses' as const,
    summary: name,
    reflection: `This house is traditionally used to reflect on ${theme}. Caelum calculates Placidus houses from an exact birth time and location. An empty house does not mean an area of life is absent or unimportant.`,
    prompt: `What would thoughtful attention to ${theme} look like for you?`,
  })),
  ...aspects.map(([name, angle, reflection]) => ({
    id: slug(name),
    name,
    category: 'Aspects' as const,
    summary: `${angle}° angular relationship`,
    reflection,
    prompt:
      'What does this relationship between symbols help you notice without predicting an outcome?',
  })),
];

export function referenceForChart(id: string, chart: import('@/types/chart').NatalChart): string[] {
  const entry = REFERENCE.find((item) => item.id === id);
  if (!entry) return [];
  const placements = [...chart.placements, chart.angles.ascendant, chart.angles.midheaven];
  if (entry.category === 'Aspects')
    return chart.aspects
      .filter((item) => item.name === entry.name)
      .map(
        (item) =>
          `${item.from} ${item.name.toLowerCase()} ${item.to}: ${item.orb.toFixed(2)}° orb, ${item.motion}.`
      );
  if (entry.category === 'Houses')
    return chart.placements
      .filter((item) => item.house === Number(id.split('-')[1]))
      .map((item) => `${item.id}: ${item.degree.toFixed(2)}° ${item.sign}.`);
  return placements
    .filter((item) =>
      entry.category === 'Signs' ? item.sign === entry.name : item.id === entry.name
    )
    .map(
      (item) =>
        `${item.id}: ${item.degree.toFixed(2)}° ${item.sign}${item.house ? `, house ${item.house}` : ''}.`
    );
}
