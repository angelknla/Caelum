import type { NatalChart } from '@/types/chart';
import styles from './ChartWheel.module.css';

const signs = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'];
const glyphs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const bodyGlyphs: Record<string, string> = { Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', 'North node': '☊', 'South node': '☋', Chiron: '⚷', Lilith: '⚸' };

export default function ChartWheel({ chart }: { chart: NatalChart }) {
  const rotation = chart.angles.ascendant.longitude;
  const point = (longitude: number, radius: number) => {
    const radians = (180 + longitude - rotation) * Math.PI / 180;
    return { x: 300 + radius * Math.cos(radians), y: 300 - radius * Math.sin(radians) };
  };
  const lanes: { longitude: number; lane: number }[] = [];
  const marks = [...chart.placements].sort((first, second) => first.longitude - second.longitude).map(body => {
    let lane = 0;
    while (lanes.some(mark => mark.lane === lane && Math.min(Math.abs(mark.longitude - body.longitude), 360 - Math.abs(mark.longitude - body.longitude)) < 10)) lane++;
    lanes.push({ longitude: body.longitude, lane });
    return { body, radius: Math.max(116, 199 - lane * 22) };
  });
  return <svg className={styles.wheel} viewBox="0 0 600 600" role="img" aria-labelledby="wheel-title wheel-description">
    <title id="wheel-title">Your natal sky</title><desc id="wheel-description">Tropical natal chart with Placidus houses. Exact placements and aspects are listed below.</desc>
    {[276, 232, 213, 102].map(radius => <circle key={radius} cx="300" cy="300" r={radius} className={styles.ring} />)}
    {Array.from({ length: 360 }, (_, degree) => { const start = point(degree, degree % 30 === 0 ? 232 : degree % 5 === 0 ? 265 : 271); const end = point(degree, 276); return <line key={degree} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className={degree % 30 === 0 ? styles.major : styles.tick} />; })}
    {signs.map((sign, index) => { const center = point(index * 30 + 15, 252); return <text key={sign} x={center.x} y={center.y} className={styles.sign} textAnchor="middle" dominantBaseline="central">{glyphs[index]}<title>{sign}</title></text>; })}
    {chart.houses.map((longitude, index) => { const start = point(longitude, 102); const end = point(longitude, 232); const next = chart.houses[(index + 1) % 12]; const center = point(longitude + ((next - longitude + 360) % 360) / 2, 111); return <g key={`house-${index + 1}`}><line x1={start.x} y1={start.y} x2={end.x} y2={end.y} className={styles.house} /><text x={center.x} y={center.y} textAnchor="middle" className={styles.houseNumber}>{index + 1}</text></g>; })}
    {chart.aspects.slice(0, 18).map(aspect => { const from = chart.placements.find(body => body.id === aspect.from)!; const to = chart.placements.find(body => body.id === aspect.to)!; const first = point(from.longitude, 100); const second = point(to.longitude, 100); return <line key={`${aspect.from}-${aspect.to}`} x1={first.x} y1={first.y} x2={second.x} y2={second.y} className={aspect.angle === 90 || aspect.angle === 180 ? styles.tension : styles.harmony} />; })}
    {marks.map(({ body, radius }) => { const exact = point(body.longitude, 215); const label = point(body.longitude, radius); return <g key={body.id}><circle cx={exact.x} cy={exact.y} r="2" className={styles.dot} /><text x={label.x} y={label.y} className={styles.planet} textAnchor="middle" dominantBaseline="central">{bodyGlyphs[body.id]}<title>{body.id}: {body.sign} {body.degree.toFixed(2)} degrees, house {body.house}</title></text></g>; })}
    <text x="51" y="305" className={styles.angle}>AC</text><text x="527" y="305" className={styles.angle}>DC</text>
    <circle cx="300" cy="300" r="3" className={styles.dot} />
  </svg>;
}