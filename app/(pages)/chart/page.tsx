import ChartDNA from '@components/ChartDNA/ChartDNA';
import ChartReveal from '@components/ChartReveal/ChartReveal';
import ChartWheel from '@components/ChartWheel/ChartWheel';
import { ArrowRight, Pencil } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { analyzeChart } from '@/lib/astrology/analysis';
import { getBirthProfile, ProfileStorageError } from '@/lib/data/birth-profiles';
import { getCurrentAccount } from '@/lib/session';
import type { SavedBirthProfile } from '@/types/chart';
import styles from './page.module.css';

export const metadata = { title: 'Your sky | Caelum' };
export const dynamic = 'force-dynamic';

export default async function ChartPage() {
  if (!(await getCurrentAccount())) redirect('/login');
  let profile: SavedBirthProfile | null;
  try {
    profile = await getBirthProfile();
  } catch (error) {
    if (!(error instanceof ProfileStorageError)) throw error;
    return (
      <section className={styles.empty}>
        <p className={styles.eyebrow}>Your beginning</p>
        <h1>Your sky is waiting.</h1>
        <p>Birth profile storage is not ready yet.</p>
        <Link href="/begin">
          Enter birth details <ArrowRight size={18} />
        </Link>
      </section>
    );
  }
  if (!profile) redirect('/begin');
  if (!profile.chart)
    return (
      <section className={styles.empty}>
        <p className={styles.eyebrow}>Your beginning / Saved</p>
        <h1>A moment still unfolding.</h1>
        <p>
          {profile.birth.date} · {profile.birth.place}
        </p>
        <p>
          {profile.birth.time === null
            ? 'Your birth time is unknown. Your details are saved, with no rising sign or houses assigned.'
            : 'Your details are saved. An exact chart has not been calculated with the current engine.'}
        </p>
        <Link href="/begin">
          Edit birth details <Pencil size={16} />
        </Link>
      </section>
    );
  const { chart, birth } = profile;
  const dna = analyzeChart(chart);
  return (
    <article className={styles.chart}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>The sky / Your chart</p>
          <h1>Your sky, at the beginning.</h1>
          <p>
            {birth.date} · {birth.time} · {birth.place}
          </p>
        </div>
        <Link href="/begin" title="Edit birth details" aria-label="Edit birth details">
          <Pencil size={18} />
        </Link>
      </header>
      <ChartWheel chart={chart} />
      <ChartReveal chart={chart} />
      <ChartDNA dna={dna} />
      <section className={styles.evidence} aria-labelledby="positions-title">
        <p className={styles.eyebrow}>The calculated sky</p>
        <h2 id="positions-title">Positions &amp; connections</h2>
        <div className={styles.tableWrap}>
          <table>
            <caption>Planetary placements · tropical / Placidus</caption>
            <thead>
              <tr>
                <th scope="col">Body</th>
                <th scope="col">Sign</th>
                <th scope="col">Degree</th>
                <th scope="col">House</th>
                <th scope="col">Motion</th>
              </tr>
            </thead>
            <tbody>
              {[...chart.placements, chart.angles.ascendant, chart.angles.midheaven].map((body) => (
                <tr key={body.id}>
                  <th scope="row">{body.id}</th>
                  <td>{body.sign}</td>
                  <td>{body.degree.toFixed(2)}°</td>
                  <td>{body.house ?? '—'}</td>
                  <td>
                    {body.id === 'Ascendant' || body.id === 'Midheaven'
                      ? '—'
                      : body.retrograde
                        ? 'Retrograde'
                        : 'Direct'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details>
          <summary>Major aspects ({chart.aspects.length})</summary>
          <ul className={styles.aspects}>
            {chart.aspects.map((aspect) => (
              <li key={`${aspect.from}-${aspect.to}-${aspect.name}`}>
                <span>
                  {aspect.from} {aspect.name.toLowerCase()} {aspect.to}
                </span>
                <span>
                  {aspect.orb.toFixed(2)}° · {aspect.motion}
                </span>
              </li>
            ))}
          </ul>
        </details>
        <details>
          <summary>Calculation record</summary>
          <dl className={styles.record}>
            <dt>Engine</dt>
            <dd>{chart.provenance.engine}</dd>
            <dt>Ephemeris revision</dt>
            <dd>{chart.provenance.dataRevision}</dd>
            <dt>Universal time</dt>
            <dd>{chart.utc}</dd>
            <dt>Birth timezone</dt>
            <dd>
              {chart.provenance.timezone} / {chart.provenance.offset}
            </dd>
            <dt>Settings</dt>
            <dd>Tropical · Geocentric · Placidus · True node · Mean Lilith</dd>
            <dt>Aspect orbs</dt>
            <dd>
              Conjunction / opposition 8°; square / trine 6°; sextile 4°. Nodes, Chiron, and Lilith
              capped at 3°.
            </dd>
            <dt>House positions</dt>
            <dd>Swiss Ephemeris house position, including ecliptic latitude</dd>
            <dt>Time rules</dt>
            <dd>
              Historical timezone rules from the server ICU database. Early records and city-centre
              coordinates may be approximate.
            </dd>
          </dl>
        </details>
      </section>
    </article>
  );
}
