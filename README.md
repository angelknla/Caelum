# Caelum

Local astrology prototype with core workflows for Phases 1 through 5. Next.js App Router, TypeScript, CSS Modules, Yarn Classic, custom account login, Supabase database, and server-only Swiss Ephemeris. People/Journal require the additional migration below.

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

## Phase 2

- Keyboard-accessible wheel body controls, body/angle selector, house inspector, aspect visibility, and selected-body connections. Exact calculated longitudes remain unchanged.
- Chart DNA: weighted elements, modalities, sign emphasis, planet counts by house, major geometric configurations, and sign-based stelliums. The scoring method and supporting placements are visible; these are interpretive conventions, not scientific personality measures.
- First reflection grounded in the tightest major planet-to-planet natal aspect, with an explicit fallback when none exists.
- Today: four evidence-backed focal sections, real current-sky positions and lunar illumination, and numerically solved next exact lunar phase and sign ingress. Sampled transits use a maximum 2-degree orb and fixed natal targets; quiet states do not invent contacts.
- Today and Chart navigation appears only for complete charts. Returning users open Today; drafts return to Chart. Birth edits invalidate the current route data. No additional SQL migration is required.

Today is a snapshot calculated at page request, not an automatically updating all-day forecast. Dates are displayed in the saved birth timezone, not a detected current location. Moon artwork is a schematic illumination mask over the credited photograph, not an observer-oriented sky image. Interpretations use transparent deterministic rules. No daily logs or extra personal records are stored automatically.

## Phase 3: Explore

Searchable authored reference entries for signs, planets/points, houses, and major aspects. Each entry shows matching evidence from the verified user's saved chart, with explicit empty states. No remote content service is used.

## Phase 4: Calendar & Outlook

`/calendar` provides 7/30-day date ranges, previous/next navigation, event filters, exact lunar phases and ingresses, solved apparent-motion stations, initial retrograde state, and closest-contact reflections. Non-lunar personal transit windows use six-hour samples and a two-degree threshold. Their edges and closest sampled times are explicitly approximate, not exact transit peaks. Windows are clipped to the selected range. No deterministic event predictions, invented dates, or shared personal forecast cache.

## Phase 5: People & Journal

In the existing Supabase SQL editor, create one more query named `caelum_phase5`, paste `supabase/phase5.sql`, and Run. Keep the original queries. This adds only `people` and `journal_entries`; no account/Auth changes are needed. Until applied, the list screens report unavailable storage instead of showing fake records.

People: consent-confirmed birth details, city search/manual coordinates, draft handling, calculated charts, edit/delete, and evidence-based chart comparisons. Comparisons use five major planet-to-planet aspects within three degrees, without compatibility scores or applying/separating claims between birth moments. Stored charts are invalidated when engine/data provenance changes.

Journal: create/read/edit/delete, dated entries, comma-separated tags, tag filtering and pagination, links from Today prompts, and optional original save-time Moon snapshots. Editing preserves the original snapshot. A snapshot is not retroactively calculated for an entry's date. Records remain in the existing cloud Supabase project, not browser localStorage. Each read/update/delete filters by the verified member ID; browser record IDs never establish ownership. Service-role access still requires this server authorization boundary.

The AGPL source-offer, authentication/security review, generated-asset packaging, native runtime support, database grants, and deployment validation remain launch prerequisites. This implementation does not deploy the app or change repository visibility.

## Netlify Runtime

The Netlify build generates the pinned ephemeris files and GeoNames city data before building Next.js. Native `sweph` binaries and generated data are explicitly included in the server traces; `yarn check:runtime` fails the build if the target platform's native binary or required data is absent. Do not upload a local macOS build as a Linux function bundle.

Netlify chooses the function Node version separately from the build version. A Node 26 build currently falls back to Node 24 functions unless a supported runtime is selected in the Netlify UI. The `sweph` package uses Node-API prebuilds; verify the deployed function log if native loading still fails. `AWS_LAMBDA_JS_RUNTIME`, if used, must be configured in Netlify's UI, not in the TOML file.

Keep `APP_PASSCODE`, `SUPABASE_URL`, and `SUPABASE_SECRET_KEY` available to the Functions environment without committing them. After changing bundle settings, clear the Netlify build cache and redeploy. Deployment is not verified merely by a successful local build; inspect the SSR function log and test the deployed homepage, login, and calculation routes. The AGPL source-access obligation above remains a launch prerequisite.

## App Installation

The web manifest at `/manifest.webmanifest` enables standalone installation. Supporting browsers show an install button in the footer once a native installation prompt is available. On iPhone/iPad, the same control shows Safari's Share > Add to Home Screen steps. Installed apps hide the control. Installation requires HTTPS or localhost; browser support and install availability vary.

The favicon, Apple touch icon, and 192/512px install icons share the custom Caelum orbit mark used in the header. Icons are generated by Next.js image routes, including a maskable variant for home-screen cropping. The service worker uses network-only navigation with a generic offline message; it does not cache private pages, charts, or journal entries. A connection is required for normal app use.

## Verification

```sh
yarn test
yarn typecheck
yarn lint
yarn build
yarn check:runtime
```

Calculation fixtures come from standalone Astrodienst `swetest` compiled against the binding's C sources, with pinned data and UTC conversion. Planet longitudes, houses, ascendant and midheaven are checked to 0.000001 degrees for Greenwich and Sydney. This validates the integration, not an independent astronomical algorithm. DST, ambiguous/missing clock times, polar failure, anonymous access rejection, two-account query ownership, and birth-flow interactions are covered.

Live database grants and account separation must also be checked against the Supabase project after applying the migration. Unit query mocks are not proof of deployed RLS. No automatic migration or live account changes are made by the tests.

## Project License

Caelum's original application code is licensed under the GNU Affero General Public License, version 3 only (`AGPL-3.0-only`). See `LICENSE` for the complete terms. Third-party dependencies, data, and artwork retain their respective licenses below.

The free AGPL path has been selected for Swiss Ephemeris. Before activating a hosted service, provide a prominent source-access offer to users interacting with it and make the corresponding source for the deployed version available under the applicable terms, including build instructions and required license notices. A link to an inaccessible private repository is not sufficient. Repository visibility has not been changed; source delivery must be resolved before launch. Never include environment secrets, production databases, or personal records in the source distribution.

## Third-Party Licenses

Swiss Ephemeris and `sweph@2.10.3-8` are used under their free AGPL option. Data is pinned to upstream revision `aacf962d19d79f8bc921dbcdaacf306d85be1917`; `ephemeris/manifest.json` records checksums, and `ephemeris/LICENSE` retains upstream terms. Running calculations server-side does not waive source-sharing obligations.

Moon photograph: Gregory H. Revera, [FullMoon2010](https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Original image retained, displayed responsively. Attribution appears on the arrival screen.

Place data: [GeoNames](https://www.geonames.org/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution appears beside birthplace search.

Fonts: Cormorant Garamond and Manrope via `next/font/google`, under the SIL Open Font License. Netlify runtime verification must be performed after redeployment.