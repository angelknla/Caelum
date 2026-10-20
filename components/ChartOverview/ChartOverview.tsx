import ChartWheel from '@components/ChartWheel/ChartWheel';
import { ArrowDown, Pencil } from 'lucide-react';
import Link from 'next/link';
import overview from '@/styles/sky-overview.module.css';
import type { BirthInput, NatalChart } from '@/types/chart';
import styles from './ChartOverview.module.css';

export default function ChartOverview({ chart, birth }: { chart: NatalChart; birth: BirthInput }) {
  return (
    <section className={overview.surface} data-sky-overview aria-labelledby="chart-overview-title">
      <header className={styles.heading}>
        <div>
          <p className={overview.eyebrow}>The sky / Your chart</p>
          <h1 id="chart-overview-title" className={overview.title}>
            Your sky,
            <br />
            <span>at the beginning.</span>
          </h1>
          <p className={styles.birth}>
            {birth.date} · {birth.time} · {birth.place}
          </p>
        </div>
        <Link
          className={styles.edit}
          href="/begin"
          title="Edit birth details"
          aria-label="Edit birth details"
        >
          <Pencil size={18} aria-hidden="true" />
        </Link>
      </header>
      <nav className={overview.links} aria-label="Chart sections">
        <a href="#chart-wheel">
          Explore the wheel <ArrowDown size={16} aria-hidden="true" />
        </a>
        <a href="#core-chart">
          Sun, Moon &amp; rising <ArrowDown size={16} aria-hidden="true" />
        </a>
        <a href="#everyday-chart">
          Everyday life <ArrowDown size={16} aria-hidden="true" />
        </a>
        <a href="#dna">
          Chart patterns <ArrowDown size={16} aria-hidden="true" />
        </a>
        <a href="#positions">
          Exact placements <ArrowDown size={16} aria-hidden="true" />
        </a>
      </nav>
      <div id="chart-wheel" className={styles.wheel}>
        <ChartWheel chart={chart} />
      </div>
    </section>
  );
}
