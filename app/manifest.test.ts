import { expect, it } from 'vitest';
import manifest from './manifest';

it('offers a standalone app with regular and maskable installation icons', () => {
  const result = manifest();
  expect(result).toMatchObject({
    name: 'Caelum',
    start_url: '/',
    scope: '/',
    display: 'standalone',
  });
  expect(result.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192', purpose: 'any' }),
      expect.objectContaining({ sizes: '512x512', purpose: 'any' }),
      expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
    ])
  );
});
