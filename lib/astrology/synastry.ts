import type { NatalChart } from '@/types/chart';
import { PLANETS } from './analysis';
import { symbolicConnection } from './symbolism';

export function compareCharts(first: NatalChart, second: NatalChart) {
  const aspects = [
    { name: 'Conjunction', angle: 0 },
    { name: 'Sextile', angle: 60 },
    { name: 'Square', angle: 90 },
    { name: 'Trine', angle: 120 },
    { name: 'Opposition', angle: 180 },
  ];
  return first.placements
    .filter((body) => PLANETS.includes(body.id))
    .flatMap((from) =>
      second.placements
        .filter((body) => PLANETS.includes(body.id))
        .flatMap((to) => {
          const distance = Math.abs(((from.longitude - to.longitude + 540) % 360) - 180);
          return aspects
            .filter((aspect) => Math.abs(distance - aspect.angle) <= 3)
            .map((aspect) => ({
              from: from.id,
              to: to.id,
              name: aspect.name,
              orb: Math.abs(distance - aspect.angle),
              reflection: symbolicConnection(from.id, to.id, aspect.angle),
            }));
        })
    )
    .sort((firstContact, secondContact) => firstContact.orb - secondContact.orb);
}
