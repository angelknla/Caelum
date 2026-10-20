'use client';

import { useEffect, useRef, useState } from 'react';
import { aspectReading, HOUSE_READINGS, placementReading } from '@/lib/astrology/natal-reading';
import type { NatalChart } from '@/types/chart';
import styles from './ChartWheel.module.css';
import { layoutBodies } from './layout';

const signs = [
  'ARIES',
  'TAURUS',
  'GEMINI',
  'CANCER',
  'LEO',
  'VIRGO',
  'LIBRA',
  'SCORPIO',
  'SAGITTARIUS',
  'CAPRICORN',
  'AQUARIUS',
  'PISCES',
];
const glyphs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const bodyGlyphs: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  'North node': '☊',
  'South node': '☋',
  Chiron: '⚷',
  Lilith: '⚸',
};

export default function ChartWheel({
  chart,
  compact = false,
  subject,
}: {
  chart: NatalChart;
  compact?: boolean;
  subject?: string;
}) {
  const artwork = useRef<HTMLDivElement>(null);
  const inspector = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState('Sun');
  const [showAspects, setShowAspects] = useState(true);
  const [house, setHouse] = useState<number | null>(null);
  useEffect(() => {
    const panel = inspector.current;
    if (!panel) return;
    const resize = () => {
      artwork.current?.style.setProperty(
        '--controls-height',
        `${panel.getBoundingClientRect().height}px`
      );
      if (compact && artwork.current) {
        panel.style.setProperty(
          '--wheel-height',
          `${artwork.current.getBoundingClientRect().width}px`
        );
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(panel);
    if (compact && artwork.current) observer.observe(artwork.current);
    resize();
    return () => observer.disconnect();
  }, [compact]);
  const positions = [...chart.placements, chart.angles.ascendant, chart.angles.midheaven];
  const active = positions.find((body) => body.id === selected)!;
  const activeReading = placementReading(active, subject);
  const connections = chart.aspects.filter(
    (aspect) => aspect.from === selected || aspect.to === selected
  );
  const rotation = chart.angles.ascendant.longitude;
  const point = (longitude: number, radius: number) => {
    const radians = ((180 + longitude - rotation) * Math.PI) / 180;
    return { x: 300 + radius * Math.cos(radians), y: 300 - radius * Math.sin(radians) };
  };
  const marks = layoutBodies(chart.placements, rotation);
  const positionDetails = (
    <dl>
      <dt>House</dt>
      <dd>{active.house ?? 'Angle'}</dd>
      <dt>Longitude</dt>
      <dd>{active.longitude.toFixed(4)}°</dd>
      {active.house !== null && (
        <>
          <dt>Daily motion</dt>
          <dd>{active.speed.toFixed(4)}° / day</dd>
          <dt>Direction</dt>
          <dd>{active.retrograde ? 'Retrograde' : 'Direct'}</dd>
        </>
      )}
    </dl>
  );
  const connectionList = connections.length ? (
    <ul>
      {connections.map((aspect) => (
        <li key={`${aspect.from}-${aspect.to}-${aspect.name}`}>
          <button
            type="button"
            onClick={() => setSelected(aspect.from === selected ? aspect.to : aspect.from)}
          >
            {aspect.name} {aspect.from === selected ? aspect.to : aspect.from}
            <small>
              {aspect.orb.toFixed(2)}° orb · {aspect.motion}
            </small>
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p className={styles.note}>No major aspects within the selected natal orbs.</p>
  );
  return (
    <section
      className={styles.explorer}
      data-compact={compact || undefined}
      aria-label="Natal chart explorer"
    >
      <div ref={artwork} className={styles.artwork}>
        <svg
          className={styles.wheel}
          viewBox="0 0 600 600"
          role="img"
          aria-labelledby="wheel-title wheel-description"
        >
          <title id="wheel-title">{subject ? `${subject}’s natal sky` : 'Your natal sky'}</title>
          <desc id="wheel-description">
            Tropical natal chart with Placidus houses. Exact placements and aspects are listed
            below.
          </desc>
          {[276, 232, 213, 102].map((radius) => (
            <circle key={radius} cx="300" cy="300" r={radius} className={styles.ring} />
          ))}
          {Array.from({ length: 360 }, (_, degree) => {
            const start = point(degree, degree % 30 === 0 ? 232 : degree % 5 === 0 ? 265 : 271);
            const end = point(degree, 276);
            return (
              <line
                key={degree}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className={degree % 30 === 0 ? styles.major : styles.tick}
              />
            );
          })}
          {signs.map((sign, index) => {
            const center = point(index * 30 + 15, 252);
            return (
              <text
                key={sign}
                x={center.x}
                y={center.y}
                className={styles.sign}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {`${glyphs[index]}\uFE0E`}
                <title>{sign}</title>
              </text>
            );
          })}
          {chart.houses.map((longitude, index) => {
            const start = point(longitude, 102);
            const end = point(longitude, 232);
            const next = chart.houses[(index + 1) % 12];
            const center = point(longitude + ((next - longitude + 360) % 360) / 2, 111);
            return (
              <g key={`house-${index + 1}`}>
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} className={styles.house} />
                <text x={center.x} y={center.y} textAnchor="middle" className={styles.houseNumber}>
                  {index + 1}
                </text>
              </g>
            );
          })}
          {showAspects &&
            chart.aspects.map((aspect) => {
              const from = chart.placements.find((body) => body.id === aspect.from)!;
              const to = chart.placements.find((body) => body.id === aspect.to)!;
              const first = point(from.longitude, 100);
              const second = point(to.longitude, 100);
              const highlighted = aspect.from === selected || aspect.to === selected;
              return (
                <line
                  key={`${aspect.from}-${aspect.to}-${aspect.name}`}
                  x1={first.x}
                  y1={first.y}
                  x2={second.x}
                  y2={second.y}
                  style={{
                    opacity: highlighted ? 0.95 : 0.1,
                    strokeWidth: highlighted ? 1.5 : 0.6,
                  }}
                  className={
                    aspect.angle === 90 || aspect.angle === 180 ? styles.tension : styles.harmony
                  }
                />
              );
            })}
          {marks.map(({ body, exact, label }) => (
            <g key={body.id}>
              <line x1={exact.x} y1={exact.y} x2={label.x} y2={label.y} className={styles.house} />
              <circle
                cx={exact.x}
                cy={exact.y}
                r={selected === body.id ? 3.5 : 2}
                className={styles.dot}
              />
            </g>
          ))}
          <text x="51" y="305" className={styles.angle}>
            AC
          </text>
          <text x="527" y="305" className={styles.angle}>
            DC
          </text>
          <circle cx="300" cy="300" r="3" className={styles.dot} />
        </svg>
        {marks.map(({ body, label }) => (
          <button
            type="button"
            key={body.id}
            className={styles.bodyControl}
            style={{ left: `${label.x / 6}%`, top: `${label.y / 6}%` }}
            title={`${body.id}: ${body.degree.toFixed(2)}° ${body.sign}`}
            aria-label={`Inspect ${body.id}`}
            aria-pressed={selected === body.id && house === null}
            onClick={() => {
              setSelected(body.id);
              setHouse(null);
            }}
          >
            <span aria-hidden="true">{bodyGlyphs[body.id]}</span>
          </button>
        ))}
      </div>
      <div ref={inspector} className={styles.inspector}>
        <p className={styles.eyebrow}>A closer look</p>
        <label htmlFor="chart-body" className={styles.label}>
          Body or angle
        </label>
        <select
          id="chart-body"
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value);
            setHouse(null);
          }}
        >
          {positions.map((body) => (
            <option key={body.id} value={body.id}>
              {body.id}
            </option>
          ))}
        </select>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={showAspects}
            onChange={(event) => setShowAspects(event.target.checked)}
          />{' '}
          Aspect lines
        </label>
        <div className={styles.readout} aria-live="polite" aria-atomic="true">
          {house === null ? (
            <>
              <h2>{active.id}</h2>
              <p className={styles.position}>
                {active.degree.toFixed(2)}° {active.sign}
              </p>
              <details className={styles.meaning}>
                <summary>What this placement means</summary>
                <p>{activeReading.description}</p>
                <p>{activeReading.expression}</p>
                <p>{activeReading.area}</p>
              </details>
              {compact ? (
                <>
                  <details className={styles.meaning}>
                    <summary>Position details</summary>
                    {positionDetails}
                  </details>
                  <details className={styles.meaning} key={`connections-${selected}`}>
                    <summary>Connections ({connections.length})</summary>
                    {connectionList}
                  </details>
                </>
              ) : (
                <>
                  {positionDetails}
                  <h3>Connections</h3>
                  {connectionList}
                </>
              )}
            </>
          ) : (
            <>
              <h2>House {house}</h2>
              <p className={styles.houseName}>{HOUSE_READINGS[house].name}</p>
              <p className={styles.position}>
                Cusp at {chart.houses[house - 1].toFixed(2)}° longitude
              </p>
              <p className={styles.note}>This house explores {HOUSE_READINGS[house].theme}.</p>
              <ul>
                {chart.placements
                  .filter((body) => body.house === house)
                  .map((body) => (
                    <li key={body.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(body.id);
                          setHouse(null);
                        }}
                      >
                        {body.id}
                        <small>
                          {body.degree.toFixed(2)}° {body.sign}
                        </small>
                      </button>
                    </li>
                  ))}
              </ul>
              {!chart.placements.some((body) => body.house === house) && (
                <p className={styles.note}>
                  No calculated bodies occupy this house. Its themes can still be part of your life;
                  an empty house does not mean an absent experience.
                </p>
              )}
            </>
          )}
        </div>
        {house === null && connections.length > 0 && (
          <details className={styles.meaning}>
            <summary>Understanding these connections</summary>
            {[...connections]
              .sort((first, second) => first.orb - second.orb)
              .slice(0, 3)
              .map((aspect) => (
                <section key={`${aspect.from}-${aspect.to}-${aspect.name}`}>
                  <h3>
                    {aspect.from} {aspect.name.toLowerCase()} {aspect.to}
                  </h3>
                  <p>{aspectReading(aspect)}</p>
                </section>
              ))}
          </details>
        )}
        <fieldset className={styles.houseControls}>
          <legend>Houses</legend>
          {chart.houses.map((_, index) => (
            <button
              type="button"
              key={`select-house-${index + 1}`}
              aria-label={`Inspect house ${index + 1}`}
              aria-pressed={house === index + 1}
              onClick={() => setHouse(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </fieldset>
      </div>
    </section>
  );
}
