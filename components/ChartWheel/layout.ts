import type { Placement } from '@/types/chart';

export function layoutBodies(bodies: Placement[], rotation: number) {
  const point = (longitude: number, radius: number) => {
    const radians = ((180 + longitude - rotation) * Math.PI) / 180;
    return { x: 300 + radius * Math.cos(radians), y: 300 - radius * Math.sin(radians) };
  };
  const occupied: { x: number; y: number }[] = [];
  return [...bodies]
    .sort((first, second) => first.longitude - second.longitude)
    .map((body) => {
      const preferred = point(body.longitude, 199);
      const candidates = [199, 143, 87].flatMap((radius) =>
        Array.from({ length: 31 }, (_, index) =>
          point(
            body.longitude + (index === 0 ? 0 : Math.ceil(index / 2) * 12 * (index % 2 ? 1 : -1)),
            radius
          )
        )
      );
      candidates.sort(
        (first, second) =>
          (first.x - preferred.x) ** 2 +
          (first.y - preferred.y) ** 2 -
          ((second.x - preferred.x) ** 2 + (second.y - preferred.y) ** 2)
      );
      const label = candidates.find((candidate) =>
        occupied.every(
          (mark) => Math.abs(mark.x - candidate.x) >= 64 || Math.abs(mark.y - candidate.y) >= 64
        )
      );
      if (!label) throw new Error('Could not arrange natal chart controls.');
      occupied.push(label);
      return { body, label, exact: point(body.longitude, 215) };
    });
}
