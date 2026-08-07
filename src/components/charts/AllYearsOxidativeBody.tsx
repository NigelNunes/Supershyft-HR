import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import {
  DUMMY_ALL_YEARS_OXIDATIVE,
  DUMMY_ALL_YEARS_OXIDATIVE_IMPROVEMENT_PERCENT,
} from '../../data/dummyAllYearsMetrics';
import {
  OXIDATIVE_BAND_COLORS,
  OXIDATIVE_BAND_LABELS,
} from './oxidativeStressBands';

/** Outer → inner rings (newest → oldest), matching Figma concentric layout. */
const RING_RADII = [
  { inner: 74, outer: 96 },
  { inner: 52, outer: 68 },
  { inner: 32, outer: 46 },
] as const;

const FEATURED_YEAR = 2025;

type YearBandRow = (typeof DUMMY_ALL_YEARS_OXIDATIVE)[number];

function pieSlices(row: YearBandRow) {
  return OXIDATIVE_BAND_LABELS.map(({ key, label }) => ({
    name: label,
    value: Math.max(row[key], 0.01),
    color: OXIDATIVE_BAND_COLORS[key],
    key,
  }));
}

function MixBar({ row }: { row: YearBandRow }) {
  return (
    <div className="oxidative-stress-year-bar">
      <span className="oxidative-stress-year-bar__label">{row.year}</span>
      <div className="oxidative-stress-year-bar__track" aria-hidden>
        {OXIDATIVE_BAND_LABELS.map(({ key }) => (
          <span
            key={key}
            className="oxidative-stress-year-bar__segment"
            style={{
              flexGrow: Math.max(row[key], 0.01),
              background: OXIDATIVE_BAND_COLORS[key],
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Figma All Years oxidative stress: concentric rings + multi-year summary bars. */
export function AllYearsOxidativeBody() {
  // TEMPORARY: DUMMY_ALL_YEARS_OXIDATIVE_* — remove when multi-year API exists
  const rings = DUMMY_ALL_YEARS_OXIDATIVE;
  const bars = [...DUMMY_ALL_YEARS_OXIDATIVE].sort((a, b) => a.year - b.year);
  const featured = rings.find((r) => r.year === FEATURED_YEAR) ?? rings[1];
  const centerValue = featured.high;

  return (
    <div className="oxidative-stress-layout oxidative-stress-layout--allyears">
      <div className="oxidative-stress-visual oxidative-stress-visual--allyears">
        <div className="oxidative-stress-rings">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {rings.map((row, index) => {
                const radii = RING_RADII[index] ?? RING_RADII[RING_RADII.length - 1];
                const slices = pieSlices(row);
                return (
                  <Pie
                    key={row.year}
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={radii.inner}
                    outerRadius={radii.outer}
                    paddingAngle={2.5}
                    cornerRadius={5}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {slices.map((entry) => (
                      <Cell
                        key={`${row.year}-${entry.key}`}
                        fill={entry.color}
                        stroke={
                          entry.key === 'moderate' && row.year === FEATURED_YEAR
                            ? 'rgba(255,255,255,0.2)'
                            : 'none'
                        }
                        strokeWidth={
                          entry.key === 'moderate' && row.year === FEATURED_YEAR ? 1 : 0
                        }
                        style={
                          entry.key === 'moderate' && row.year === FEATURED_YEAR
                            ? {
                                filter:
                                  'drop-shadow(0px -3px 15px rgba(255, 160, 0, 0.2))',
                              }
                            : undefined
                        }
                      />
                    ))}
                  </Pie>
                );
              })}
            </PieChart>
          </ResponsiveContainer>
          <div className="oxidative-stress-pie__center" aria-hidden>
            <span className="oxidative-stress-pie__center-value">{centerValue}%</span>
            <span className="oxidative-stress-pie__center-label">{featured.year}</span>
          </div>
        </div>

        <ul className="oxidative-stress-breakdown oxidative-stress-breakdown--allyears" aria-label="Severity bands">
          {OXIDATIVE_BAND_LABELS.map(({ key, label }) => (
            <li key={key}>
              <span
                className="oxidative-stress-breakdown__dot"
                style={{ background: OXIDATIVE_BAND_COLORS[key] }}
              />
              <span className="oxidative-stress-breakdown__label">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="oxidative-stress-summary oxidative-stress-summary--allyears">
        <div className="oxidative-stress-summary__intro">
          <p className="oxidative-stress-summary__heading">Summary</p>
          <p className="oxidative-stress-mix__caption">
            High risk reduced by {DUMMY_ALL_YEARS_OXIDATIVE_IMPROVEMENT_PERCENT}% since 2024
          </p>
        </div>

        <div className="oxidative-stress-year-bars" aria-label="Severity mix by year">
          {bars.map((row) => (
            <MixBar key={row.year} row={row} />
          ))}
        </div>
      </div>
    </div>
  );
}
