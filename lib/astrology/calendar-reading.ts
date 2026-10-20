import { lunarReadings } from './daily-reading';
import { BODY_THEMES } from './symbolism';

export type CalendarReading = {
  title: string;
  reflection: string;
  explanation: string;
  prompt: string;
};

const phases: Record<string, CalendarReading> = {
  'New Moon': {
    title: 'Choose a small beginning',
    reflection:
      'In astrology, the New Moon is a moment to set an intention and consider what you want to make room for.',
    explanation:
      'Start with a manageable change: a habit, a conversation, or an idea you would like to explore. You can give it time to take shape without needing a complete plan today.',
    prompt: 'What would you like to begin, and what is the smallest first step?',
  },
  'First quarter': {
    title: 'Give an intention a next step',
    reflection:
      'The First quarter is associated with taking action and adjusting an idea to the demands of everyday life.',
    explanation:
      'Look at what you started and identify one practical choice that would move it forward. If something feels awkward, try changing the approach before deciding the whole idea is wrong.',
    prompt: 'What needs a decision or a practical adjustment?',
  },
  'Full Moon': {
    title: 'Notice what has come into view',
    reflection:
      'The Full Moon offers a symbolic checkpoint for noticing what has developed and where different needs meet.',
    explanation:
      'Review a project, a conversation, or a commitment with a little distance. Acknowledge what is working, and name anything that needs more space, attention, or a clearer boundary.',
    prompt: 'What can you see more clearly now than when you began?',
  },
  'Last quarter': {
    title: 'Review what is worth carrying forward',
    reflection:
      'The Last quarter is associated with reflection, simplification, and making room before another beginning.',
    explanation:
      'Consider finishing a small loose end or letting go of a task that no longer serves its purpose. Keep what supports you, and leave room to rest before choosing what comes next.',
    prompt: 'What would you like to keep, change, or put down?',
  },
};

export function phaseReading(phase: string): CalendarReading {
  return phases[phase];
}

export function ingressReading(sign: string): CalendarReading {
  const reading = lunarReadings[sign];
  return {
    title: reading.title,
    reflection: `As the Moon enters ${sign}, ${reading.summary}`,
    explanation: reading.explanation,
    prompt: reading.prompt,
  };
}

const reviewActions: Record<string, string> = {
  Mercury:
    'Revisit a conversation, check a detail, or give an unfinished idea another look. Clear questions and written notes can help you work through what needs attention.',
  Venus:
    'Reflect on what you value in a connection or commitment. Consider whether the time, attention, and care you give leave room for your own needs as well.',
  Mars: 'Review where your effort is going and whether the pace is sustainable. You might change the approach to a task or make room to recover before another push.',
  Jupiter:
    'Look again at a goal, a belief, or an opportunity you have been exploring. Ask whether it still fits your circumstances before expanding your commitment.',
  Saturn:
    'Revisit responsibilities and the limits around them. An honest deadline, a smaller scope, or a clearer boundary can make a commitment easier to maintain.',
  Uranus:
    'Consider which changes have given you useful freedom and which need more support. A small, reversible adjustment can help you explore what fits now.',
  Neptune:
    'Return to an inspiration and check the assumptions around it. Give creative ideas some room while clarifying the practical details of a plan.',
  Pluto:
    'Reflect on where you have influence and where you are trying to control an outcome. A choice about your own next step can be more useful than managing someone else’s response.',
};

export function retrogradeReading(body: string) {
  return reviewActions[body];
}

export function stationReading(body: string, retrograde: boolean): CalendarReading {
  return {
    title: retrograde ? `Revisit ${BODY_THEMES[body]}` : `Move forward with ${BODY_THEMES[body]}`,
    reflection: retrograde
      ? `${body} turning retrograde is used in astrology as a cue to review themes of ${BODY_THEMES[body]}.`
      : `${body} turning direct is used in astrology as a cue to put reflection on ${BODY_THEMES[body]} into practice.`,
    explanation: retrograde
      ? reviewActions[body]
      : 'Choose a small next step using what you have learned from recent reflection. Let your actual circumstances set the pace; a change in apparent planetary motion does not require an immediate decision.',
    prompt: retrograde
      ? 'What would benefit from another look before you commit?'
      : 'What is ready for a small, considered next step?',
  };
}
