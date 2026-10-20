import 'server-only';
import { unstable_cache, updateTag } from 'next/cache';
import { DATA_REVISION, ENGINE_VERSION } from '@/lib/astrology/provenance';
import { BoundedCache } from '@/lib/cache';

type Scope = 'birth-profile' | 'people' | 'journal';
const inFlight = new BoundedCache<unknown>(128, 0);
const tagFor = (scope: Scope, memberId: string) => `caelum:${scope}:${memberId}`;

// Call only after verifying the session. The owner and every query argument are
// part of the key; cookies and service credentials never enter the cached loader.
export async function cachedOwnedRead<Value>(
  scope: Scope,
  memberId: string,
  args: string[],
  load: () => Promise<Value>
): Promise<Value> {
  const tag = tagFor(scope, memberId);
  const key = ['caelum-owned-v1', tag, ...args, ENGINE_VERSION, DATA_REVISION];
  const value = await inFlight.getOrLoad(`${tag}:${JSON.stringify(args)}`, () =>
    unstable_cache(load, key, { tags: [tag], revalidate: 15 * 60 })()
  );
  return structuredClone(value) as Value;
}

// Writes use immediate expiration so the next navigation reads the saved data.
export function invalidateOwnedReads(scope: Scope, memberId: string) {
  const tag = tagFor(scope, memberId);
  inFlight.invalidate(`${tag}:`);
  updateTag(tag);
}
