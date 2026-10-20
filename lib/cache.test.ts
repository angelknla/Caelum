import { afterEach, expect, it, vi } from 'vitest';
import { BoundedCache } from './cache';

afterEach(() => vi.useRealTimers());

it('reuses values, including null, until their TTL expires', () => {
  vi.useFakeTimers();
  const cache = new BoundedCache<null>(2, 1000);
  const create = vi.fn(() => null);
  cache.getOrCreate('one', create);
  vi.advanceTimersByTime(999);
  cache.getOrCreate('one', create);
  expect(create).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(1);
  cache.getOrCreate('one', create);
  expect(create).toHaveBeenCalledTimes(2);
});

it('evicts the least recently used value and retries failed work', async () => {
  const cache = new BoundedCache<number>(2, 1000);
  cache.getOrCreate('a', () => 1);
  cache.getOrCreate('b', () => 2);
  cache.getOrCreate('a', () => 99);
  cache.getOrCreate('c', () => 3);
  expect(cache.getOrCreate('a', () => 99)).toBe(1);
  expect(cache.getOrCreate('b', () => 22)).toBe(22);
  await expect(
    cache.getOrLoad('failed', async () => {
      throw new Error('offline');
    })
  ).rejects.toThrow('offline');
  await expect(cache.getOrLoad('failed', async () => 4)).resolves.toBe(4);
});

it('coalesces concurrent loads and prevents an invalidated load repopulating the cache', async () => {
  const cache = new BoundedCache<number>(2, 1000);
  let finish!: (value: number) => void;
  const load = vi.fn(
    () =>
      new Promise<number>((resolve) => {
        finish = resolve;
      })
  );
  const old = cache.getOrLoad('owner:record', load);
  expect(cache.getOrLoad('owner:record', load)).toBe(old);
  await Promise.resolve();
  expect(load).toHaveBeenCalledTimes(1);
  cache.invalidate('owner:');
  await expect(cache.getOrLoad('owner:record', async () => 2)).resolves.toBe(2);
  finish(1);
  await old;
  expect(cache.getOrCreate('owner:record', () => 3)).toBe(2);
});

it('does not let pending loads grow without a limit', async () => {
  const cache = new BoundedCache<number>(1, 1000);
  let finish!: (value: number) => void;
  const first = cache.getOrLoad(
    'first',
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  await Promise.resolve();
  const overflow = vi.fn(async () => 2);
  await Promise.all([cache.getOrLoad('second', overflow), cache.getOrLoad('second', overflow)]);
  expect(overflow).toHaveBeenCalledTimes(2);
  finish(1);
  await first;
});
