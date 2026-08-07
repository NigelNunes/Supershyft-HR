import { useId, useMemo } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import {
  DUMMY_ALL_YEARS_METABOLIC_AGE,
  DUMMY_ALL_YEARS_METABOLIC_INSIGHT,
} from '../../data/dummyAllYearsMetrics';
import type { YearOption } from '../layout/DashboardHeader';
import './MetabolicAgeDistributionCard.css';

export interface MetabolicAgeCategory {
  key: 'good' | 'attention' | 'highRisk';
  label: string;
  count: number;
  percent: number;
}

/** Temporary dummy data until metabolic-age API is wired. */
export const DUMMY_METABOLIC_AGE_CATEGORIES: MetabolicAgeCategory[] = [
  { key: 'good', label: 'GOOD', count: 999, percent: 999 },
  { key: 'attention', label: 'NEEDS ATTENTION', count: 999, percent: 999 },
  { key: 'highRisk', label: 'HIGH RISK', count: 999, percent: 999 },
];

interface MetabolicAgeDistributionCardProps {
  categories?: MetabolicAgeCategory[];
  selectedYear?: YearOption;
}

const VIEW_W = 640;
const VIEW_H = 192;
const MID = VIEW_H / 2;

/** Column centers — dashed guides + stats columns. */
const COL_X = [VIEW_W * 0.17, VIEW_W * 0.5, VIEW_W * 0.83] as const;

/** Max half-height (px) when a category is at the peak count. */
const BASE_HALF = 78;

/** Sample density along the snake path. */
const SAMPLE_STEP = 8;

type Pt = { x: number; y: number };

function smoothThrough(points: Pt[]): string {
  if (points.length < 2) return '';
  const pts = [points[0], ...points, points[points.length - 1]];
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

/**
 * Relative amplitude along x from three category counts (1 at the max count).
 * Holds each column's value across its span so equal counts stay uniform.
 */
function amplitudeAtX(x: number, counts: [number, number, number]): number {
  const max = Math.max(...counts, 1);
  const a0 = counts[0] / max;
  const a1 = counts[1] / max;
  const a2 = counts[2] / max;
  const [x0, x1, x2] = COL_X;

  if (x <= x0) return a0;
  if (x <= x1) return lerp(a0, a1, (x - x0) / (x1 - x0));
  if (x <= x2) return lerp(a1, a2, (x - x1) / (x2 - x1));
  return a2;
}

/**
 * Soft organic envelope — rounded head, flat through the value columns,
 * gentle tip after the last column. Does not encode fake left→right taper.
 */
function envelopeAtX(x: number): number {
  const headEnd = 28;
  const [, , x2] = COL_X;

  if (x <= headEnd) {
    // Rounded face that opens to full height
    const t = x / headEnd;
    return lerp(0.78, 1, t * (2 - t));
  }
  if (x <= x2) {
    // Subtle organic undulation (±3%) without biasing any column
    return 1 + 0.03 * Math.sin((x / VIEW_W) * Math.PI * 2.2);
  }
  // Soft tip after the last category column
  const t = (x - x2) / Math.max(VIEW_W - x2, 1);
  return lerp(1, 0.04, t * t);
}

function halfHeightAtX(x: number, counts: [number, number, number]): number {
  const amp = amplitudeAtX(x, counts);
  if (amp <= 0) return 0;
  return BASE_HALF * amp * envelopeAtX(x);
}

function buildSnakePath(counts: [number, number, number]): string {
  const top: Pt[] = [];
  const bottom: Pt[] = [];

  for (let x = 0; x <= VIEW_W; x += SAMPLE_STEP) {
    const half = halfHeightAtX(x, counts);
    top.push({ x, y: MID - half });
    bottom.push({ x, y: MID + half });
  }
  if (top[top.length - 1]?.x !== VIEW_W) {
    const half = halfHeightAtX(VIEW_W, counts);
    top.push({ x: VIEW_W, y: MID - half });
    bottom.push({ x: VIEW_W, y: MID + half });
  }

  // Tip lands on the midline
  top[top.length - 1] = { x: VIEW_W, y: MID };
  bottom[bottom.length - 1] = { x: VIEW_W, y: MID };

  const topPath = smoothThrough(top);
  const bottomPath = smoothThrough([...bottom].reverse()).replace(/^M/, 'L');
  return `${topPath} ${bottomPath} Z`;
}

function MetabolicAgeSnake({ categories }: { categories: MetabolicAgeCategory[] }) {
  const uid = useId().replace(/:/g, '');
  const fillId = `metabolic-snake-fill-${uid}`;
  const glowId = `metabolic-snake-glow-${uid}`;

  const { path, dividers } = useMemo(() => {
    const counts = categories.map((c) => c.count) as [number, number, number];
    return {
      path: buildSnakePath(counts),
      dividers: [...COL_X],
    };
  }, [categories]);

  return (
    <div className="metabolic-snake" aria-hidden>
      <svg
        className="metabolic-snake__svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#6366f1" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.92" />
          </linearGradient>
          <filter id={glowId} x="-6%" y="-35%" width="112%" height="170%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(101, 242, 255, 0.3)" />
          </filter>
        </defs>

        {dividers.map((x) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2={VIEW_H}
            className="metabolic-snake__divider"
          />
        ))}

        <path
          d={path}
          fill={`url(#${fillId})`}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
          filter={`url(#${glowId})`}
        />
      </svg>
    </div>
  );
}

export function MetabolicAgeDistributionCard({
  categories = DUMMY_METABOLIC_AGE_CATEGORIES,
  selectedYear = '2026',
}: MetabolicAgeDistributionCardProps) {
  const highRisk = categories.find((c) => c.key === 'highRisk');
  const insightPercent = highRisk?.percent ?? 0;
  const isAllYears = selectedYear === 'all';

  return (
    <article className={`metabolic-age-card${isAllYears ? ' metabolic-age-card--allyears' : ''}`}>
      <header className="metabolic-age-card__header">
        <div className="metabolic-age-card__title-row">
          <h3 className="metabolic-age-card__title">Metabolic Age Distribution</h3>
          <span className="metabolic-age-card__info" tabIndex={0}>
            <Info size={16} aria-hidden />
            <span className="metabolic-age-card__info-popup" role="tooltip">
              {CHART_INFO.metabolicAge}
            </span>
          </span>
        </div>
        <p className="metabolic-age-card__subtitle">
          Distribution by number of employees metabolic age compared to actual age
        </p>
      </header>

      {isAllYears ? (
        <>
          {/* TEMPORARY: DUMMY_ALL_YEARS_METABOLIC_* — remove when multi-year API exists */}
          <div className="metabolic-age-bars">
            {DUMMY_ALL_YEARS_METABOLIC_AGE.map((row) => {
              const goodEnd = row.good;
              const cautionEnd = row.good + row.caution;
              return (
                <div key={row.year} className="metabolic-age-bars__row">
                  <span className="metabolic-age-bars__year">{row.year}</span>
                  <div className="metabolic-age-bars__track" aria-hidden>
                    <div
                      className="metabolic-age-bars__seg metabolic-age-bars__seg--high"
                      style={{ width: '100%' }}
                    />
                    <div
                      className="metabolic-age-bars__seg metabolic-age-bars__seg--caution"
                      style={{ width: `${cautionEnd}%` }}
                    />
                    <div
                      className="metabolic-age-bars__seg metabolic-age-bars__seg--good"
                      style={{ width: `${goodEnd}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <ul className="metabolic-age-bars__legend">
            <li>
              <span className="metabolic-age-bars__dot metabolic-age-bars__dot--good" />
              <span>GOOD</span>
            </li>
            <li>
              <span className="metabolic-age-bars__dot metabolic-age-bars__dot--caution" />
              <span>CAUTION</span>
            </li>
            <li>
              <span className="metabolic-age-bars__dot metabolic-age-bars__dot--high" />
              <span>HIGH RISK</span>
            </li>
          </ul>

          <div className="metabolic-age-card__insight">
            <AlertCircle size={20} aria-hidden />
            <p>{DUMMY_ALL_YEARS_METABOLIC_INSIGHT}</p>
          </div>
        </>
      ) : (
        <>
          <div className="metabolic-age-card__stats">
            {categories.map((category) => (
              <div
                key={category.key}
                className={`metabolic-age-stat metabolic-age-stat--${category.key}`}
              >
                <span className="metabolic-age-stat__label">{category.label}</span>
                <span className="metabolic-age-stat__count">
                  {category.count.toLocaleString()}
                </span>
                <span className="metabolic-age-stat__percent">{category.percent}%</span>
              </div>
            ))}
          </div>

          <MetabolicAgeSnake categories={categories} />

          <div className="metabolic-age-card__insight">
            <AlertCircle size={20} aria-hidden />
            <p>
              {insightPercent}% Employees have their metabolic age &gt;3 years of their actual age
            </p>
          </div>
        </>
      )}
    </article>
  );
}
