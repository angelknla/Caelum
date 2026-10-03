# Caelum

Local Phase 1 astrology prototype. Next.js App Router, TypeScript, CSS Modules, Yarn Classic, custom account login, Supabase database, and server-only Swiss Ephemeris.

## Local Setup

Use Node 26 (`nvm use`) and Yarn, not pnpm. Keep existing private environment values in `.env.local`; never commit them. This phase does not use Supabase Auth or the publishable key. The existing server secret and app passcode remain required.

```sh
yarn install --frozen-lockfile
yarn setup:ephemeris
yarn setup:places
yarn dev --port 3001
```

The GeoNames setup script requires `unzip` (available on macOS). It downloads a local city dataset; birthplace searches do not send personal birth information to external APIs. Both downloaded calculation files and place data are generated assets, not browser-accessible records.

## Supabase: One Additional Query

In the existing Caelum project, open SQL Editor > New query. Name it `caelum_phase1`, paste `supabase/phase1.sql`, and Run once. Keep the original `caelum` query. The migration creates `birth_profiles` and does not modify existing accounts or credential tables. No Auth settings need changing.

Birth records and charts are stored together in an atomic upsert. Ownership is derived exclusively from the verified server session. RLS is enabled and public/anon/authenticated access is revoked. Custom login is **not** Supabase Auth: service-role requests bypass RLS, so per-user isolation is enforced by the server ownership boundary, not by `auth.uid()` policies. Do not expose the service-role key or publish this prototype without reviewing authentication and authorization.

The app runs locally, but the existing Supabase project stores records in the cloud. Birth records are not written to the repository, application logs, or browser localStorage. User routes are dynamically rendered; there is no shared chart cache.

## Phase 1

- Arrival and existing account access.
- Date, time, birthplace, and confirmation with Back/edit navigation.
- Local GeoNames city search; manual coordinates and IANA timezone for smaller places.
- Historical timezone/DST conversion with explicit repeated-hour selection. Nonexistent clock times are rejected.
- Server-calculated Sun through Pluto, true north/south nodes, Chiron, mean Lilith, ascendant, midheaven, Placidus cusps and house positions, speeds/retrogrades, and five major aspects with motion and documented orbs.
- SVG wheel, sequential Sun/Moon/rising reveal, symbolic cosmic signature, exact placement/aspect tables, and calculation provenance.
- Optional nickname, current location, pronouns, interests, and experience.
- Returning accounts open their saved chart. Birth edits recalculate; old engine/data revisions invalidate stored charts. Unknown birth times remain drafts without invented positions, rising signs, or houses. Polar Placidus errors can be saved as drafts.

Supported birth dates: 1900 through today, up to 2099. Tropical/geocentric/Placidus only in this phase. City-centre coordinates and historical timezone records are not universally exact; manual correction is available.

Today, an interactive wheel inspector, deeper chart DNA, live transits, People, Journal, and AI are later phases. They are not shown as working features or backed by fabricated data.

## Verification

```sh
yarn test
yarn typecheck
yarn lint
yarn build
```

Calculation fixtures come from standalone Astrodienst `swetest` compiled against the binding's C sources, with pinned data and UTC conversion. Planet longitudes, houses, ascendant and midheaven are checked to 0.000001 degrees for Greenwich and Sydney. This validates the integration, not an independent astronomical algorithm. DST, ambiguous/missing clock times, polar failure, anonymous access rejection, two-account query ownership, and birth-flow interactions are covered.

Live database grants and account separation must also be checked against the Supabase project after applying the migration. Unit query mocks are not proof of deployed RLS. No automatic migration or live account changes are made by the tests.

## Third-Party Licenses

Swiss Ephemeris and `sweph@2.10.3-8` are used under their free AGPL option for this private local prototype. Data is pinned to upstream revision `aacf962d19d79f8bc921dbcdaacf306d85be1917`; `ephemeris/manifest.json` records checksums, and `ephemeris/LICENSE` retains upstream terms. Before distribution or opening a public service, review and satisfy the applicable AGPL source obligations or obtain appropriate professional licensing / replace the engine. Running it server-side does not waive these obligations. Never publish secrets or personal records with source code.

Moon photograph: Gregory H. Revera, [FullMoon2010](https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Original image retained, displayed responsively. Attribution appears on the arrival screen.

Place data: [GeoNames](https://www.geonames.org/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution appears beside birthplace search.

Fonts: Cormorant Garamond and Manrope via `next/font/google`, under the SIL Open Font License. Netlify setup and deployment-runtime verification are deferred.