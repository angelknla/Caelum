import type { TransitContact } from '@/types/analysis';
import { BODY_THEMES } from './symbolism';

const personalBodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const personalTargets = [...personalBodies, 'Ascendant', 'Midheaven'];

const dailyThemes: Record<
  string,
  { title: string; action: string; explanation: string; prompt: string }
> = {
  Sun: {
    title: 'Choose what matters to you',
    action: 'Give one priority your full attention instead of trying to prove yourself everywhere.',
    explanation:
      'You might start by choosing a task that reflects what you care about, even if it is small. Let that choice guide where you put your attention when other demands arrive.',
    prompt: 'What would make today feel like your own?',
  },
  Moon: {
    title: 'Make room for your needs',
    action: 'Check in with what you need before saying yes to another commitment.',
    explanation:
      'Notice whether you need rest, reassurance, company, or a little privacy. Naming the need can make it easier to ask for support or adjust a plan before you feel stretched.',
    prompt: 'What would help you feel more settled today?',
  },
  Mercury: {
    title: 'Give your thoughts some space',
    action: 'Ask a clear question or write your thoughts down before responding.',
    explanation:
      'A conversation may benefit from separating what you know from what you are assuming. Give an important message a second read, and leave room for the other person to clarify their meaning.',
    prompt: 'What needs to be said or understood more clearly?',
  },
  Venus: {
    title: 'Connect with intention',
    action: 'Make time for a conversation or a small gesture that reflects what you value.',
    explanation:
      'Think about what makes a connection feel reciprocal: attention, honesty, shared enjoyment, or practical care. A specific invitation or a thoughtful check-in can express more than trying to please everyone.',
    prompt: 'Which connection would you like to give a little care?',
  },
  Mars: {
    title: 'Put your energy where it counts',
    action: 'Take one manageable step and leave room to pause before pushing further.',
    explanation:
      'Choose something with a clear next action, such as making the call or starting the first draft. Check your energy after that step so that momentum stays useful rather than becoming pressure.',
    prompt: 'Where could you put your energy to good use?',
  },
  Jupiter: {
    title: 'Leave room for a new perspective',
    action: 'Explore one possibility without committing to more than you can manage.',
    explanation:
      'Read a little further, ask someone with a different perspective, or try a small version of an idea. Give yourself enough information to distinguish an exciting possibility from an obligation you do not want.',
    prompt: 'What possibility feels worth exploring?',
  },
  Saturn: {
    title: 'Build at a sustainable pace',
    action: 'Set one realistic boundary and focus on the next achievable step.',
    explanation:
      'Look for a commitment that could use a clearer limit, deadline, or definition of enough. A plan that includes breaks and honest expectations is easier to keep than one that depends on constant effort.',
    prompt: 'What can you make simpler or more sustainable?',
  },
  Uranus: {
    title: 'Try a different approach',
    action: 'Experiment with one small change while keeping what already supports you.',
    explanation:
      'Try changing the order of a routine, the setting for a task, or the way you ask for help. A reversible experiment lets you discover what works without needing to change everything at once.',
    prompt: 'Where would a small change give you more room?',
  },
  Neptune: {
    title: 'Give inspiration a little structure',
    action: 'Make room for a creative idea, then check the practical details before acting.',
    explanation:
      'Capture the image, thought, or possibility that interests you, then look for one concrete way to explore it. If a situation feels unclear, ask a direct question before building a story around it.',
    prompt: 'What would help you separate an inspiration from an assumption?',
  },
  Pluto: {
    title: 'Notice what you can influence',
    action:
      'Put your attention on a choice you can make rather than an outcome you cannot control.',
    explanation:
      'Notice where you are spending energy trying to manage another person’s response. A clear boundary, an honest conversation, or a decision about your own next step can give that energy a more useful place to go.',
    prompt: 'What is within your influence today?',
  },
  Ascendant: {
    title: 'Meet the day on your own terms',
    action:
      'Give yourself a moment to choose how you want to respond rather than reacting immediately.',
    explanation:
      'Before a meeting or a new situation, decide what you want to bring: warmth, curiosity, directness, or patience. You can adjust your approach as you go without letting the first interaction set the tone for everything.',
    prompt: 'How would you like to show up today?',
  },
  Midheaven: {
    title: 'Take one step toward your direction',
    action: 'Choose one useful task that supports your work or a longer-term goal.',
    explanation:
      'Look for a piece of progress you can recognize by the end of the day, such as finishing a draft or asking for feedback. Keep the task connected to your direction rather than to the pressure to appear busy.',
    prompt: 'What small step would support the direction you want to take?',
  },
};

export const lunarReadings: Record<
  string,
  { title: string; summary: string; explanation: string; prompt: string }
> = {
  Aries: {
    title: 'Begin without rushing',
    summary:
      'a fresh start may appeal; choose one thing to begin and give yourself room to find your pace.',
    explanation:
      'Try giving an impulse a small, clear outlet: a walk, a first draft, or a task you can begin now. If impatience shows up, pause long enough to decide what actually needs your attention.',
    prompt: 'What would you like to begin without rushing yourself?',
  },
  Taurus: {
    title: 'Return to what steadies you',
    summary: 'a steady pace and familiar comforts may help you settle into the day.',
    explanation:
      'A regular meal, time outdoors, or a comfortable space can offer a useful anchor. Notice which routines restore you and which ones you are keeping simply because they are familiar.',
    prompt: 'What simple comfort would help you feel grounded?',
  },
  Gemini: {
    title: 'Follow a little curiosity',
    summary:
      'conversation and curiosity offer a useful focus; leave space to listen as well as share.',
    explanation:
      'Put a feeling into words, talk it through, or follow a question that interests you. If your attention starts moving in too many directions, choose one conversation or idea to stay with for a little longer.',
    prompt: 'What question would you like to explore?',
  },
  Cancer: {
    title: 'Care for your sense of belonging',
    summary:
      'care and familiar connections offer a useful focus; check in with your own needs, too.',
    explanation:
      'Reach toward a person or place where you can be at ease, and be specific about the support you would welcome. Caring for someone else can sit alongside a boundary around your own time and energy.',
    prompt: 'What would help you feel cared for without overextending yourself?',
  },
  Leo: {
    title: 'Let yourself be seen',
    summary:
      'warmth and creative expression offer a useful focus; make something or share a little of yourself.',
    explanation:
      'Choose an activity that lets you participate rather than watch from the sidelines. Sharing an idea, making something, or enjoying a moment of play can be worthwhile without needing an audience’s approval.',
    prompt: 'What would you enjoy expressing just for yourself?',
  },
  Virgo: {
    title: 'Make one small thing easier',
    summary:
      'small, practical acts of care offer a useful focus; aim for helpful rather than perfect.',
    explanation:
      'Tidy one corner, simplify a task, or take care of something you have been putting off. Stop when the change has made life easier, so a useful adjustment does not turn into another standard to meet.',
    prompt: 'What small adjustment would make your day easier?',
  },
  Libra: {
    title: 'Find room for both perspectives',
    summary:
      'connection and balance offer a useful focus; listen to others without losing sight of your own needs.',
    explanation:
      'In a decision or conversation, name what matters to you before looking for common ground. A fair compromise gives both people a voice and leaves room to say when something does not fit.',
    prompt: 'Where could a conversation make room for both of you?',
  },
  Scorpio: {
    title: 'Give deeper feelings some room',
    summary:
      'private reflection may feel useful; give a deeper feeling some space before drawing conclusions.',
    explanation:
      'Writing privately or talking with someone you trust can help you distinguish a feeling from the story around it. You can acknowledge what is present without deciding immediately what it means or what to do.',
    prompt: 'What feeling could you acknowledge without needing to solve it?',
  },
  Sagittarius: {
    title: 'Look beyond the usual routine',
    summary:
      'a change of perspective may be useful; explore something new without overlooking how you feel.',
    explanation:
      'Step outside a familiar routine through a different route, a new subject, or an open conversation. Let the wider view add perspective while still giving your immediate needs a place in the day.',
    prompt: 'What could help you see today from a different angle?',
  },
  Capricorn: {
    title: 'Make progress without skipping rest',
    summary: 'a little structure may help; choose a realistic priority and leave room for rest.',
    explanation:
      'Give the day a manageable shape with one priority and a clear stopping point. If you catch yourself measuring your worth through output, include a break or a simple act of care in the plan.',
    prompt: 'What is enough for today?',
  },
  Aquarius: {
    title: 'Balance space with connection',
    summary:
      'fresh ideas and community offer a useful focus; balance time with others with space of your own.',
    explanation:
      'You could share an idea with someone who sees things differently, then take a little time to notice your own response. Connection can feel easier when you have room to participate in a way that suits you.',
    prompt: 'Where would you like more space, and where more connection?',
  },
  Pisces: {
    title: 'Keep a little space for yourself',
    summary:
      'a gentler pace may be useful; make room for imagination without taking on everything around you.',
    explanation:
      'Music, quiet time, or a creative activity can give a feeling somewhere to go. If you find yourself absorbing other people’s concerns, check what you can offer comfortably before taking on more.',
    prompt: 'What would help you protect a little quiet space?',
  },
};

export function selectDailyContact(contacts: TransitContact[]) {
  return (
    contacts.find(
      (contact) =>
        personalBodies.includes(contact.transiting) && personalTargets.includes(contact.natal)
    ) ??
    contacts.find((contact) => personalBodies.includes(contact.transiting)) ??
    contacts[0]
  );
}

export function dailyContactReading(contact: TransitContact) {
  const target = dailyThemes[contact.natal];
  const movingTheme = BODY_THEMES[contact.transiting];
  const natalTheme = BODY_THEMES[contact.natal];
  const timing = personalBodies.includes(contact.transiting)
    ? "Today's astrology"
    : 'A longer-running astrological theme';
  const connection =
    movingTheme === natalTheme
      ? `${timing} brings ${natalTheme} into focus.`
      : contact.angle === 90 || contact.angle === 180
        ? `${timing} suggests a pull between ${movingTheme} and ${natalTheme}.`
        : contact.angle === 0
          ? `${timing} brings ${movingTheme} together with ${natalTheme}.`
          : `${timing} suggests that ${movingTheme} can support ${natalTheme}.`;
  return {
    title: target.title,
    reflection: `${connection} ${target.action}`,
    explanation: target.explanation,
    prompt: target.prompt,
  };
}
