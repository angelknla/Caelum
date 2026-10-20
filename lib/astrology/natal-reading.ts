import type { Distribution } from '@/types/analysis';
import type { Aspect, Placement } from '@/types/chart';
import { BODY_THEMES } from './symbolism';

export const HOUSE_READINGS: Record<number, { name: string; theme: string; prompt: string }> = {
  1: {
    name: 'Self & beginnings',
    theme: 'your first responses, self-expression, and how you approach new situations',
    prompt: 'How do you want to meet a new beginning?',
  },
  2: {
    name: 'Resources & values',
    theme: 'money, possessions, self-worth, and what helps you feel secure',
    prompt: 'What feels valuable beyond what it costs?',
  },
  3: {
    name: 'Learning & communication',
    theme: 'everyday conversations, learning, and your immediate surroundings',
    prompt: 'What helps you feel heard and understood?',
  },
  4: {
    name: 'Home & belonging',
    theme: 'home, family, privacy, and the foundations that help you feel settled',
    prompt: 'What makes a place or relationship feel like home?',
  },
  5: {
    name: 'Creativity & enjoyment',
    theme: 'creative expression, play, romance, and doing something for its own enjoyment',
    prompt: 'What would you make or enjoy without needing an outcome?',
  },
  6: {
    name: 'Routines & care',
    theme: 'daily work, habits, and practical ways of caring for yourself',
    prompt: 'Which small routine actually supports you?',
  },
  7: {
    name: 'Partnership & exchange',
    theme: 'one-to-one relationships, agreements, and balancing your needs with another person’s',
    prompt: 'What does a fair exchange look like to you?',
  },
  8: {
    name: 'Trust & shared resources',
    theme: 'intimacy, shared resources, and the responsibilities that come with trust',
    prompt: 'What helps you share without losing your boundaries?',
  },
  9: {
    name: 'Perspective & discovery',
    theme: 'beliefs, study, travel, and experiences that broaden your perspective',
    prompt: 'Which experience has changed the way you see things?',
  },
  10: {
    name: 'Direction & contribution',
    theme: 'public roles, work, responsibility, and the contribution you want to make',
    prompt: 'What kind of contribution feels meaningful to you?',
  },
  11: {
    name: 'Community & possibility',
    theme: 'friendships, groups, shared projects, and hopes for the future',
    prompt: 'Which people or shared ideas help you feel part of something?',
  },
  12: {
    name: 'Solitude & reflection',
    theme: 'rest, retreat, private reflection, and what needs time away from an audience',
    prompt: 'What becomes clearer when you have quiet space?',
  },
};

const signReadings: Record<string, { style: string; balance: string }> = {
  Aries: {
    style: 'a direct, active style that values initiative and a fresh start',
    balance:
      'Give yourself room to begin, while checking whether speed is helping or simply creating pressure.',
  },
  Taurus: {
    style: 'a steady, tangible style that values consistency and time to settle',
    balance:
      'Notice what sustains you, and where a familiar approach could benefit from a small adjustment.',
  },
  Gemini: {
    style: 'a curious, flexible style that makes room for questions and different perspectives',
    balance:
      'Explore more than one possibility, then give yourself enough time to follow an idea through.',
  },
  Cancer: {
    style: 'a caring, protective style that pays attention to belonging and emotional context',
    balance: 'Make room for closeness without taking responsibility for everyone else’s feelings.',
  },
  Leo: {
    style: 'a warm, expressive style that values creativity and personal involvement',
    balance: 'Let yourself be seen, while noticing what you enjoy even when nobody is watching.',
  },
  Virgo: {
    style: 'an observant, practical style that values craft, usefulness, and thoughtful details',
    balance: 'Use your attention to make something helpful rather than asking it to be perfect.',
  },
  Libra: {
    style: 'a relational, considered style that makes room for balance and another perspective',
    balance: 'Listen for common ground without putting your own preferences permanently on hold.',
  },
  Scorpio: {
    style: 'a focused, private style that values depth, honesty, and trust',
    balance:
      'Give deeper questions time, while leaving room for uncertainty instead of assuming the worst.',
  },
  Sagittarius: {
    style: 'an exploratory style that values meaning, possibility, and a wider perspective',
    balance: 'Let a bigger idea inspire you, then check which practical step would make it useful.',
  },
  Capricorn: {
    style: 'a patient, structured style that values responsibility and progress over time',
    balance: 'Build toward something worthwhile, while treating rest as part of the process.',
  },
  Aquarius: {
    style: 'an independent, inventive style that values fresh ideas and shared possibilities',
    balance:
      'Make room for a different approach without losing touch with your immediate feelings and needs.',
  },
  Pisces: {
    style: 'an imaginative, receptive style that notices atmosphere and subtle connections',
    balance:
      'Give sensitivity and creativity space, with clear boundaries around what you can take on.',
  },
};

const roles: Record<string, { title: string; description: string; theme: string }> = {
  Sun: {
    title: 'Identity & direction',
    description:
      'The Sun represents conscious expression: what you want to stand for and where you choose to put your attention.',
    theme: BODY_THEMES.Sun,
  },
  Moon: {
    title: 'Needs & inner rhythm',
    description:
      'The Moon represents emotional needs, familiar reactions, and the conditions that help you feel settled.',
    theme: BODY_THEMES.Moon,
  },
  Ascendant: {
    title: 'Presence & first responses',
    description:
      'The ascendant describes an approach to new situations and the way you make initial contact with the world.',
    theme: BODY_THEMES.Ascendant,
  },
  Midheaven: {
    title: 'Work & contribution',
    description:
      'The midheaven describes themes around public direction and contribution. It offers questions about work and visibility rather than assigning you a career.',
    theme: BODY_THEMES.Midheaven,
  },
  Mercury: {
    title: 'How you think & communicate',
    description:
      'Mercury represents how you explore ideas, make sense of information, and put thoughts into words.',
    theme: BODY_THEMES.Mercury,
  },
  Venus: {
    title: 'How you connect & choose',
    description:
      'Venus represents what you appreciate, the kinds of exchange you value, and how you approach connection and enjoyment.',
    theme: BODY_THEMES.Venus,
  },
  Mars: {
    title: 'How you act & assert yourself',
    description:
      'Mars represents initiative, desire, and the way you put energy behind a choice or establish a boundary.',
    theme: BODY_THEMES.Mars,
  },
  Jupiter: {
    title: 'Growth & perspective',
    description:
      'Jupiter represents exploration, learning, and the ideas that help you imagine a wider range of possibilities.',
    theme: BODY_THEMES.Jupiter,
  },
  Saturn: {
    title: 'Structure & commitment',
    description:
      'Saturn represents responsibility, limits, and what you build through practice and a sustainable commitment.',
    theme: BODY_THEMES.Saturn,
  },
  Uranus: {
    title: 'Freedom & change',
    description:
      'Uranus represents independence, experimentation, and the questions that encourage a different approach.',
    theme: BODY_THEMES.Uranus,
  },
  Neptune: {
    title: 'Imagination & sensitivity',
    description:
      'Neptune represents imagination, ideals, and the places where inspiration benefits from clearer boundaries.',
    theme: BODY_THEMES.Neptune,
  },
  Pluto: {
    title: 'Power & renewal',
    description:
      'Pluto represents themes of influence, change, and examining what you can release or approach differently.',
    theme: BODY_THEMES.Pluto,
  },
  'North node': {
    title: 'Exploring an unfamiliar approach',
    description:
      'The true north node is a calculated lunar orbital point. In astrology it offers a theme for exploring an unfamiliar approach.',
    theme: 'growth and unfamiliar possibilities',
  },
  'South node': {
    title: 'Recognizing familiar patterns',
    description:
      'The south node is opposite the true north node. In astrology it offers a theme for noticing familiar approaches and deciding when they still serve you.',
    theme: 'familiarity and practiced responses',
  },
  Chiron: {
    title: 'Vulnerability & learning',
    description:
      'Chiron is a minor body used in modern astrology to reflect on vulnerability and learning through experience.',
    theme: 'vulnerability and learning',
  },
  Lilith: {
    title: 'Autonomy & boundaries',
    description:
      'Caelum’s Lilith is the mean lunar apogee, a calculated point used in astrology to explore autonomy and boundaries.',
    theme: 'autonomy and boundaries',
  },
};

export function placementReading(body: Placement, subject?: string) {
  const role = roles[body.id];
  const sign = signReadings[body.sign];
  const house = body.house === null ? null : HOUSE_READINGS[body.house];
  return {
    title: role.title,
    description: role.description,
    expression: `${body.id === 'Ascendant' ? `${subject ? `${subject}’s` : 'Your'} rising sign` : `${body.id} in ${body.sign}`} suggests ${sign.style}. ${sign.balance}`,
    area: house
      ? `In House ${body.house}, themes of ${role.theme} are explored through ${house.theme}.`
      : body.id === 'Ascendant'
        ? 'The ascendant is the eastern horizon at your birth. It anchors the house system and describes an approach, rather than another planet placement.'
        : body.id === 'Midheaven'
          ? 'The midheaven is an angle associated with public direction. Its sign adds a style to the way you approach visibility and contribution.'
          : 'A house area is not assigned to this placement.',
    prompt:
      house?.prompt ?? 'When does this approach feel useful, and when would you choose another?',
    house,
  };
}

export function aspectReading(aspect: Aspect) {
  const first = roles[aspect.from].theme;
  const second = roles[aspect.to].theme;
  const descriptions: Record<number, string> = {
    0: 'A conjunction brings these themes together. They can reinforce one another, but it may take a deliberate pause to distinguish what each needs.',
    60: 'A sextile describes potential cooperation. Look for a small action that gives both themes room to participate.',
    90: 'A square describes different demands or approaches. Naming both needs can help you adjust rather than treating one as the problem.',
    120: 'A trine describes a familiar flow between these themes. Notice how you could use that ease deliberately instead of taking it for granted.',
    180: 'An opposition describes contrasting perspectives. The useful question is how to make room for both rather than asking one to win.',
  };
  return `${aspect.from} represents ${first}; ${aspect.to} represents ${second}. ${descriptions[aspect.angle]}`;
}

export const ELEMENT_READINGS: Record<string, string> = {
  Fire: 'Initiative, enthusiasm, and expression. Consider what gives an idea enough energy to become a first step.',
  Earth:
    'Practical care, consistency, and tangible results. Consider which routines help you turn an intention into something sustainable.',
  Air: 'Ideas, conversation, and perspective. Consider how asking a question or comparing viewpoints helps you understand an experience.',
  Water:
    'Feeling, connection, and emotional context. Consider what helps you recognize a need without letting it decide everything.',
};

export const MODE_READINGS: Record<string, string> = {
  Cardinal:
    'Beginning and setting direction. Notice how you start something and what helps you continue after the first push.',
  Fixed:
    'Sustaining and deepening. Notice what helps you stay with a commitment and when changing course would serve it better.',
  Mutable:
    'Adapting and making transitions. Notice how you respond to new information and what helps you choose among possibilities.',
};

export const PATTERN_READINGS: Record<string, string> = {
  'Grand trine':
    'Three planets linked by trines form a circuit of familiar cooperation. Explore how their themes support one another, and where a conscious choice could make that ease useful.',
  'T-square':
    'An opposition meets two squares at a third planet. Explore the contrasting needs of the opposing pair and the role of the third planet in finding an adjustment.',
  'Grand cross':
    'Two oppositions linked by four squares bring several competing themes into one pattern. Consider which needs deserve attention first and how you can avoid demanding everything at once.',
  Stellium:
    'Three or more planets share a sign under this definition. Their different roles return to a similar style of expression; this does not mean every planet is tightly conjunct.',
};

export function distributionSummary(items: Distribution[]) {
  const highest = Math.max(...items.map((item) => item.score));
  const leaders = items.filter((item) => item.score === highest && item.score > 0);
  if (!leaders.length) return 'No weighted emphasis is available.';
  return `${leaders.map((item) => item.label).join(' and ')} ${leaders.length === 1 ? 'has' : 'share'} the highest weighted emphasis in this chart. These proportions describe the selected placements, rather than how much of a quality you have.`;
}
