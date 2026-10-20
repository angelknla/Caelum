import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { BoundedCache } from '@/lib/cache';

export type Place = {
  id: string;
  name: string;
  ascii: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
  timeZone: string;
};
let places: Promise<Place[]> | undefined;
const results = new BoundedCache<Place[]>(256, 24 * 60 * 60 * 1000);
export async function searchPlaces(query: string): Promise<Place[]> {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2 || normalized.length > 80) return [];
  return structuredClone(
    await results.getOrLoad(normalized, async () => {
      places ??= readFile(path.join(process.cwd(), 'data/places.json'), 'utf8')
        .then((contents) => JSON.parse(contents) as Place[])
        .catch(() => {
          places = undefined;
          throw new Error('Birthplace search is unavailable. Run yarn setup:places.');
        });
      return (await places)
        .filter(
          (place) =>
            place.name.toLowerCase().includes(normalized) ||
            place.ascii.toLowerCase().includes(normalized)
        )
        .sort(
          (first, second) =>
            Number(second.ascii.toLowerCase().startsWith(normalized)) -
              Number(first.ascii.toLowerCase().startsWith(normalized)) ||
            second.population - first.population
        )
        .slice(0, 8);
    })
  );
}
