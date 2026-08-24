import { useId, useMemo } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import type { YearOption } from '../layout/DashboardHeader';
import './MetabolicAgeDistributionCard.css';

export interface MetabolicAgeCategory {
  key: 'good' | 'attention' | 'highRisk';
  label: string;
  count: number;
  percent: number;
}

const EMPTY_CATEGORIES: MetabolicAgeCategory[] = [
  { key: 'good', label: 'GOOD', count: 0, percent: 0 },
  { key: 'attention', label: 'NEEDS ATTENTION', count: 0, percent: 0 },
  { key: 'highRisk', label: 'HIGH RISK', count: 0, percent: 0 },
];

const PLACEHOLDER_YEARS = [2024, 2025, 2026] as const;
const EMPTY = '-';

interface MetabolicAgeDistributionCardProps {
  categories?: MetabolicAgeCategory[];
  selectedYear?: YearOption;
}

const VIEW_W = 640;
const VIEW_H = 192;
const MID = VIEW_H / 2;
/** Max half-height from midline at a full-strength peak. */
const MAX_HALF = 78;
/** Soft floor so tiny categories stay visible without looking empty. */
const MIN_HALF = 8;
const SAMPLE_STEP = 8;

/** Column centers — dashed guides + peak centers under each stat. */
const COL_X = [VIEW_W * 0.17, VIEW_W * 0.5, VIEW_W * 0.83] as const;

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
    const cp1x = p1.x + (p2.x - p0.x) / 7;
    const cp1y = p1.y + (p2.y - p0.y) / 7;
    const cp2x = p2.x - (p3.x - p1.x) / 7;
    const cp2y = p2.y - (p3.y - p1.y) / 7;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Half-height at x from explicit peaks on each dashed column.
 * Valleys sit midway between columns so each lobe is centered on its guide.
 */
function halfHeightAtX(x: number, counts: [number, number, number]): number {
  const max = Math.max(...counts, 1);
  const peaks = counts.map((count) =>
    count <= 0 ? 0 : lerp(MIN_HALF, MAX_HALF, count / max),
  ) as [number, number, number];
  const [h0, h1, h2] = peaks;
  const [x0, x1, x2] = COL_X;
  const m01 = (x0 + x1) / 2;
  const m12 = (x1 + x2) / 2;
  const v01 = Math.min(h0, h1) * 0.38;
  const v12 = Math.min(h1, h2) * 0.38;

  const keys: { x: number; h: number }[] = [
    { x: 0, h: h0 * 0.42 },
    { x: x0, h: h0 },
    { x: m01, h: v01 },
    { x: x1, h: h1 },
    { x: m12, h: v12 },
    { x: x2, h: h2 },
    { x: VIEW_W, h: h2 * 0.22 },
  ];

  if (x <= keys[0].x) return keys[0].h;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (x <= b.x) {
      const t = smoothstep((x - a.x) / (b.x - a.x || 1));
      return lerp(a.h, b.h, t);
    }
  }
  return keys[keys.length - 1].h;
}

function buildSnakePath(counts: [number, number, number]): string {
  const xs = new Set<number>();
  for (let x = 0; x <= VIEW_W; x += SAMPLE_STEP) xs.add(x);
  for (const cx of COL_X) xs.add(cx);
  xs.add(VIEW_W);

  const samples = Array.from(xs).sort((a, b) => a - b);
  const top: Pt[] = [];
  const bottom: Pt[] = [];

  for (const x of samples) {
    const half = halfHeightAtX(x, counts);
    top.push({ x, y: MID - half });
    bottom.push({ x, y: MID + half });
  }

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
  categories,
  selectedYear = '2026',
}: MetabolicAgeDistributionCardProps) {
  const resolved =
    categories && categories.length > 0 ? categories : EMPTY_CATEGORIES;
  const hasData = Boolean(categories && categories.length > 0);
  const highRisk = resolved.find((c) => c.key === 'highRisk');
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
          <div className="metabolic-age-bars">
            {PLACEHOLDER_YEARS.map((year) => (
              <div key={year} className="metabolic-age-bars__row">
                <span className="metabolic-age-bars__year">{year}</span>
                <div className="metabolic-age-bars__track" aria-hidden>
                  <div
                    className="metabolic-age-bars__seg metabolic-age-bars__seg--good"
                    style={{ width: '100%', opacity: 0.15 }}
                  />
                </div>
                <span className="metabolic-age-bars__empty">{EMPTY}</span>
              </div>
            ))}
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
            <p>{EMPTY}</p>
          </div>
        </>
      ) : (
        <>
          <div className="metabolic-age-card__stats">
            {resolved.map((category) => (
              <div
                key={category.key}
                className={`metabolic-age-stat metabolic-age-stat--${category.key}`}
              >
                <span className="metabolic-age-stat__label">{category.label}</span>
                <span className="metabolic-age-stat__count">
                  {hasData ? category.count.toLocaleString() : EMPTY}
                </span>
                <span className="metabolic-age-stat__percent">
                  {hasData ? `${category.percent}%` : EMPTY}
                </span>
              </div>
            ))}
          </div>

          {hasData ? <MetabolicAgeSnake categories={resolved} /> : null}

          <div className="metabolic-age-card__insight">
            <AlertCircle size={20} aria-hidden />
            <p>
              {hasData
                ? `${insightPercent}% Employees have their metabolic age >3 years of their actual age`
                : EMPTY}
            </p>
          </div>
        </>
      )}
    </article>
  );
}
