import { Lightbulb } from 'lucide-react';
import type { CSSProperties } from 'react';
import { OVERALL_RISK_COLORS } from './chartTheme';
import './AllYearsRiskHoverTooltip.css';

export type AllYearsSeriesYearBlock = {
  year: number;
  /** Segment key (risk band / age group) → count for that year. */
  bands: readonly { band: string; count: number }[];
};

type AllYearsRiskHoverTooltipProps = {
  active?: boolean;
  payload?: Array<{
    name?: string;
    payload?: { name?: string; count?: number; enrolled?: number };
  }>;
  /** All Years blocks (any order). */
  yearBlocks: readonly AllYearsSeriesYearBlock[];
  /** Year of the pie chart currently being hovered. */
  activeYear: number;
  /** Optional accent map (age bands, etc.). Falls back to overall-risk colors. */
  accentColors?: Record<string, string>;
};

type YearPoint = { year: number; count: number };

const DEFAULT_ACCENT = '#9B6DFF';

function bandLabel(band: string): string {
  if (band === 'Low risk') return 'Low Risk';
  if (band === 'High risk') return 'High Risk';
  return band;
}

function seriesForBand(
  yearBlocks: readonly AllYearsSeriesYearBlock[],
  band: string,
): YearPoint[] {
  return [...yearBlocks]
    .map((block) => ({
      year: block.year,
      count: block.bands.find((b) => b.band === band)?.count ?? 0,
    }))
    .sort((a, b) => b.year - a.year);
}

function trendInsight(band: string, series: readonly YearPoint[]): string {
  if (series.length < 2) return `${bandLabel(band)} employees across camp years.`;
  // series is newest → oldest (matches pie row); compare oldest → newest for trend copy
  const newest = series[0];
  const oldest = series[series.length - 1];
  const label = bandLabel(band);
  if (newest.count > oldest.count) {
    return `${label} employees increased since ${oldest.year}.`;
  }
  if (newest.count < oldest.count) {
    return `${label} employees decreased since ${oldest.year}.`;
  }
  return `${label} employees unchanged since ${oldest.year}.`;
}

function resolveAccent(
  band: string,
  accentColors?: Record<string, string>,
): string {
  return accentColors?.[band] ?? OVERALL_RISK_COLORS[band] ?? DEFAULT_ACCENT;
}

/** Figma All Years pie hover: year timeline + trend insight (risk / age / etc.). */
export function AllYearsRiskHoverTooltip({
  active,
  payload,
  yearBlocks,
  activeYear,
  accentColors,
}: AllYearsRiskHoverTooltipProps) {
  if (!active || !payload?.length) return null;

  const band = String(payload[0]?.name ?? payload[0]?.payload?.name ?? '');
  if (!band || band === 'empty') return null;

  const series = seriesForBand(yearBlocks, band);
  if (series.length === 0) return null;

  const accent = resolveAccent(band, accentColors);
  const style = { '--risk-accent': accent } as CSSProperties;

  return (
    <div className="all-years-risk-tooltip" style={style}>
      <div className="all-years-risk-tooltip__timeline-block">
        <div className="all-years-risk-tooltip__rail" aria-hidden>
          <span className="all-years-risk-tooltip__rail-line" />
          <span className="all-years-risk-tooltip__rail-line all-years-risk-tooltip__rail-line--accent" />
          {series.map((point) => {
            const isActive = point.year === activeYear;
            return (
              <div key={point.year} className="all-years-risk-tooltip__dot-wrap">
                <span
                  className={`all-years-risk-tooltip__dot${isActive ? ' all-years-risk-tooltip__dot--active' : ''}`}
                />
              </div>
            );
          })}
        </div>

        <div className="all-years-risk-tooltip__values">
          {series.map((point) => {
            const isActive = point.year === activeYear;
            return (
              <div key={point.year} className="all-years-risk-tooltip__col">
                <span
                  className={`all-years-risk-tooltip__count${isActive ? ' all-years-risk-tooltip__count--active' : ''}`}
                >
                  {point.count.toLocaleString()}
                </span>
                <span className="all-years-risk-tooltip__year">{point.year}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="all-years-risk-tooltip__insight">
        <span className="all-years-risk-tooltip__insight-icon">
          <Lightbulb size={14} strokeWidth={2} fill="currentColor" aria-hidden />
        </span>
        <p className="all-years-risk-tooltip__insight-text">{trendInsight(band, series)}</p>
      </div>
    </div>
  );
}
