# Caelum

An astrology prototype combining calculated birth charts, interactive visualisations, a personal calendar, and journaling. The engineering focus is handling sensitive records, historical timezones, and reproducible calculations.

## Tech stack

Next.js 16 · React 19 · TypeScript · Supabase/PostgreSQL · Swiss Ephemeris · CSS Modules · Vitest · Biome

## What it does

- Builds and explores birth charts with placement and aspect details.
- Shows current sky information, lunar events, and personal transit windows.
- Supports saved people, chart comparisons, and a tagged journal.

## Engineering decisions

- **Timezones are domain logic.** [Birth-time handling](lib/astrology/birth.ts) accounts for historical daylight saving, repeated hours, and nonexistent local times. Incomplete birth details remain drafts.
- **Traceable calculations.** [Engine and data versions](lib/astrology/provenance.ts) invalidate outdated charts. Reference fixtures from standalone `swetest` check the integration.
- **Ownership before data access.** Custom sessions establish the owner for every private query and cache entry. Privileged Supabase requests bypass RLS, so the server explicitly enforces ownership.
- **Bounded computation.** Calculation caches reuse expensive work with complete input keys and limited memory. Sampled transit windows are labelled as approximate.

## Run locally

Use Node 26 and Yarn Classic. Configure the database migrations and server-only environment variables through the [development guide](docs/DEVELOPMENT.md#local-setup). Place-data setup requires `unzip`.

```sh
nvm use
yarn install --frozen-lockfile
yarn setup:ephemeris
yarn setup:places
yarn dev --port 3001
```

## Checks

```sh
yarn test
yarn typecheck
yarn lint
yarn build
yarn check:runtime
```

Tests cover calculation fixtures, timezone edge cases, ownership, and birth-flow interactions. Runtime checks verify native binaries and generated assets.

## Status and license

This is a prototype. A hosted launch still requires authentication, live database permissions, native runtime, and source-access validation.

Application code uses [AGPL-3.0-only](LICENSE). Swiss Ephemeris uses the free AGPL option. Moon artwork by Gregory H. Revera and GeoNames place data retain their respective licences; see [third-party notices](docs/DEVELOPMENT.md#third-party-licenses).

## Documentation

[Development guide](docs/DEVELOPMENT.md) — setup, calculation scope, caching, deployment, verification, and source-sharing requirements.
