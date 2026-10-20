import { describe, expect, it } from 'vitest';
import type { TransitContact } from '@/types/analysis';
import { dailyContactReading, lunarReadings, selectDailyContact } from './daily-reading';

const contact = (transiting: string, natal: string, angle = 90, orb = 0.5): TransitContact => ({
  transiting,
  natal,
  angle,
  orb,
  name: angle === 90 ? 'Square' : 'Trine',
  motion: 'applying',
});

describe('personal daily readings', () => {
  it('prioritizes a daily personal contact over a closer slow transit', () => {
    const slow = contact('Pluto', 'Saturn', 90, 0.01);
    const daily = contact('Moon', 'Venus', 120, 0.8);
    const contacts = [slow, daily];
    expect(selectDailyContact(contacts)).toBe(daily);
    expect(contacts).toEqual([slow, daily]);
  });

  it('prefers personal targets and falls back without inventing a contact', () => {
    const other = contact('Mercury', 'Uranus', 90, 0.1);
    const personal = contact('Sun', 'Midheaven', 120, 1.2);
    expect(selectDailyContact([other, personal])).toBe(personal);
    expect(selectDailyContact([other])).toBe(other);
    const slow = contact('Saturn', 'Moon');
    expect(selectDailyContact([slow])).toBe(slow);
    expect(selectDailyContact([])).toBeUndefined();
  });

  it('distinguishes supportive and tense contacts and labels longer themes', () => {
    const supportive = dailyContactReading(contact('Moon', 'Mercury', 120));
    const tense = dailyContactReading(contact('Moon', 'Mercury'));
    expect(supportive.reflection).toContain('can support language and understanding');
    expect(tense.reflection).toContain('a pull between');
    expect(tense.prompt).toBe('What needs to be said or understood more clearly?');
    expect(dailyContactReading(contact('Saturn', 'Moon')).reflection).toContain(
      'A longer-running astrological theme'
    );
    expect(dailyContactReading(contact('Venus', 'Venus')).reflection).toContain(
      'brings values and connection into focus'
    );
  });

  it('provides a different lunar reflection for each sign', () => {
    expect(Object.keys(lunarReadings)).toHaveLength(12);
    expect(new Set(Object.values(lunarReadings).map((reading) => reading.summary)).size).toBe(12);
  });
});
