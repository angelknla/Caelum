export const BODY_THEMES: Record<string, string> = {
  Sun: 'identity and intention',
  Moon: 'feeling and familiar needs',
  Mercury: 'language and understanding',
  Venus: 'values and connection',
  Mars: 'initiative and assertion',
  Jupiter: 'growth and perspective',
  Saturn: 'responsibility and limits',
  Uranus: 'freedom and change',
  Neptune: 'imagination and uncertainty',
  Pluto: 'power and renewal',
  Ascendant: 'self-expression and first responses',
  Midheaven: 'public direction and contribution',
};

export const SIGN_THEMES: Record<string, string> = {
  Aries: 'initiative without rushing past your needs',
  Taurus: 'steadiness and the comforts that genuinely sustain you',
  Gemini: 'curiosity and naming what is on your mind',
  Cancer: 'care, belonging, and the boundaries around both',
  Leo: 'warmth and expression without needing approval',
  Virgo: 'small acts of care without demanding perfection',
  Libra: 'connection without losing your own perspective',
  Scorpio: 'depth and privacy without assuming the worst',
  Sagittarius: 'perspective without explaining your feelings away',
  Capricorn: 'responsibility without treating rest as something to earn',
  Aquarius: 'space and community without detaching from your feelings',
  Pisces: 'sensitivity without carrying everything at once',
};

export function symbolicConnection(first: string, second: string, angle: number) {
  const relationship =
    angle === 90 || angle === 180
      ? 'Consider where these needs pull in different directions, and what would give both a little space.'
      : angle === 0
        ? 'Consider where these themes become intertwined, and whether each has enough room of its own.'
        : 'Consider how these themes could support one another through a small, deliberate choice.';
  return `In symbolic astrology, ${first} brings themes of ${BODY_THEMES[first]}, while ${second} brings ${BODY_THEMES[second]}. ${relationship}`;
}
