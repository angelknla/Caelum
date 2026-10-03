import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import type { NatalChart } from '@/types/chart';
import { analyzeChart, detectConfigurations } from './analysis';
import { calculateAspects, calculateNatal, placement } from './engine';

const base = () =>
  calculateNatal({
    date: '2000-01-01',
    time: '12:00',
    timeZone: 'UTC',
    disambiguation: 'reject',
    place: 'Greenwich',
    latitude: 51.4779,
    longitude: 0,
    placeSource: 'test',
  });
function controlled(longitudes: number[]): NatalChart {
  const chart = base();
  const ids = ['Sun', 'Moon', 'Mercury', 'Venus'];
  chart.placements = longitudes.map((longitude, index) =>
    placement(ids[index], longitude, 0, 1, 1)
  );
  chart.aspects = calculateAspects(chart.placements);
  return chart;
}

describe('chart DNA evidence', () => {
  it('counts declared weights and excludes minor points', () => {
    const chart = base();
    const dna = analyzeChart(chart);
    expect(dna.elements.reduce((total, item) => total + item.score, 0)).toBe(20);
    expect(dna.elements.reduce((total, item) => total + item.percentage, 0)).toBeCloseTo(100);
    expect(dna.elements.flatMap((item) => item.bodies)).not.toContain('Chiron');
    expect(dna.emphasis.flatMap((item) => item.bodies)).toHaveLength(10);
    expect(dna.strongestAspect?.orb).toBe(
      Math.min(
        ...chart.aspects
          .filter(
            (item) =>
              [
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
              ].includes(item.from) &&
              [
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
              ].includes(item.to)
          )
          .map((item) => item.orb)
      )
    );
    expect(dna.insight.evidence[0]).toContain(dna.strongestAspect!.orb.toFixed(2));
  });
  it('detects only geometrically supported configurations', () => {
    expect(detectConfigurations(controlled([0, 120, 240])).map((item) => item.name)).toContain(
      'Grand trine'
    );
    expect(detectConfigurations(controlled([0, 90, 180])).map((item) => item.name)).toContain(
      'T-square'
    );
    expect(
      detectConfigurations(controlled([0, 90, 180, 270])).filter(
        (item) => item.name === 'Grand cross'
      )
    ).toHaveLength(1);
    expect(detectConfigurations(controlled([0, 50, 150]))).toEqual([]);
  });
  it('labels a sign-based stellium honestly', () => {
    const pattern = detectConfigurations(controlled([1, 14, 28])).find(
      (item) => item.name === 'Stellium'
    );
    expect(pattern?.bodies).toEqual(['Sun', 'Moon', 'Mercury']);
    expect(pattern?.evidence[0]).toContain('not necessarily a close conjunction');
  });
  it('does not invent an aspect when there are none', () => {
    const chart = controlled([0, 50, 150]);
    chart.aspects = [];
    const insight = analyzeChart(chart).insight;
    expect(insight.evidence.every((line) => line.includes('weighted points'))).toBe(true);
  });
});
