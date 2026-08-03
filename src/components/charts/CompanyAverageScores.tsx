import type { CSSProperties } from 'react';
import { Info, Utensils, Dumbbell, TrendingDown, TrendingUp } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import { DUMMY_ALL_YEARS_COMPANY_SCORES } from '../../data/dummyAllYearsMetrics';
import type { CompanyAverageScores as CompanyScores } from '../../types';
import type { YearOption } from '../layout/DashboardHeader';
import lifestyleIconUrl from '../../assets/icons/lifestyle-mirror-comb.png';
import './CompanyAverageScores.css';

/** Hand-mirror + comb (Figma lifestyle icon). */
function LifestyleMirrorIcon({ size = 20 }: { size?: number; strokeWidth?: number }) {
  return (
    <span
      className="company-score-panel__icon-glyph"
      style={
        {
          width: size,
          height: size,
          WebkitMaskImage: `url(${lifestyleIconUrl})`,
          maskImage: `url(${lifestyleIconUrl})`,
        } as CSSProperties
      }
      aria-hidden
    />
  );
}

interface CompanyAverageScoresProps {
  scores: CompanyScores;
  title?: string;
  subtitle?: string;
  info?: string;
  loading?: boolean;
  selectedYear?: YearOption;
}

type ScoreTone = 'very-low' | 'low' | 'needs-improvement' | 'optimal';

interface ScoreTier {
  tone: ScoreTone;
  label: string;
  barsLit: number;
  color: string;
  shadow: string;
  rising: boolean;
}

/** Bands match Figma examples: 12 Very Low · 27 Low · 52 Needs Improvement · >67.5 Optimal */
function scoreTier(value: number): ScoreTier {
  if (value > 67.5) {
    return {
      tone: 'optimal',
      label: 'Optimal',
      barsLit: 4,
      color: '#22c55e',
      shadow: 'rgba(34,197,94,0.20)',
      rising: true,
    };
  }
  if (value >= 50) {
    return {
      tone: 'needs-improvement',
      label: 'Needs Improvement',
      barsLit: 3,
      color: '#e5ff64',
      shadow: 'rgba(229,255,101,0.20)',
      rising: false,
    };
  }
  if (value >= 25) {
    return {
      tone: 'low',
      label: 'Low',
      barsLit: 2,
      color: '#ff8820',
      shadow: 'rgba(255,136,32,0.20)',
      rising: false,
    };
  }
  return {
    tone: 'very-low',
    label: 'Very Low',
    barsLit: 1,
    color: '#de4a4a',
    shadow: 'rgba(222,74,74,0.20)',
    rising: false,
  };
}

/** All-years bar color by score band (legend: Optimal / Low risk / Increased / High). */
function allYearsBarColor(value: number): { color: string; shadow: string } {
  if (value > 67.5) {
    return { color: '#10b981', shadow: 'rgba(16,185,129,0.20)' };
  }
  if (value >= 50) {
    return { color: '#e5ff64', shadow: 'rgba(229,255,100,0.20)' };
  }
  if (value >= 25) {
    return { color: '#ff8820', shadow: 'rgba(255,136,32,0.20)' };
  }
  return { color: '#de4a4a', shadow: 'rgba(222,74,74,0.20)' };
}

function improvementSince(
  values: readonly number[],
  firstYear: number,
  overridePct?: number,
): string {
  const pct =
    overridePct ??
    (() => {
      const first = values[0] ?? 0;
      const last = values[values.length - 1] ?? 0;
      if (first <= 0) return 0;
      return Math.round(((last - first) / first) * 100);
    })();
  if (pct > 0) return `${pct}% improvement since ${firstYear}.`;
  if (pct < 0) return `${Math.abs(pct)}% decline since ${firstYear}.`;
  return `No change since ${firstYear}.`;
}

const BAR_HEIGHTS = [32, 56, 80, 112];
const ALL_YEARS_BAR_MAX_PX = 112;

const SCORE_META = [
  {
    key: 'nutrition' as const,
    label: 'NUTRITION SCORE',
    labelLines: ['NUTRITION', 'SCORE'] as const,
    Icon: Utensils,
    accent: '#ff8820',
  },
  {
    key: 'fitness' as const,
    label: 'FITNESS SCORE',
    labelLines: ['FITNESS', 'SCORE'] as const,
    Icon: Dumbbell,
    accent: '#de4a4a',
  },
  {
    key: 'lifestyle' as const,
    label: 'LIFESTYLE SCORE',
    labelLines: ['LIFESTYLE', 'SCORE'] as const,
    Icon: LifestyleMirrorIcon,
    accent: '#e5ff64',
  },
];

const LEGEND = [
  { label: 'Optimal', color: '#10b981' },
  { label: 'Low risk', color: '#e5ff64' },
  { label: 'Increased Risk', color: '#ff8820' },
  { label: 'High risk', color: '#de4a4a' },
] as const;

export function CompanyAverageScores({
  scores,
  title = 'Company average scores',
  subtitle = 'Nutrition · fitness · lifestyle (scale 0–100)',
  info = CHART_INFO.companyScores,
  loading = false,
  selectedYear = '2026',
}: CompanyAverageScoresProps) {
  const isAllYears = selectedYear === 'all';
  const allYears = DUMMY_ALL_YEARS_COMPANY_SCORES;

  return (
    <article className="company-avg-scores">
      <header className="company-avg-scores__header">
        <div className="company-avg-scores__title-row">
          <h3 className="company-avg-scores__title">{title}</h3>
          <span className="company-avg-scores__info" tabIndex={0}>
            <Info size={16} aria-hidden />
            <span className="company-avg-scores__info-popup" role="tooltip">
              {info}
            </span>
          </span>
        </div>
        <p className="company-avg-scores__subtitle">{subtitle}</p>
      </header>

      {loading ? (
        <p className="company-avg-scores__loading">Loading company average scores…</p>
      ) : isAllYears ? (
        <>
          <div className="company-avg-scores__grid company-avg-scores__grid--allyears">
            {SCORE_META.map(({ key, labelLines, Icon, accent }) => {
              const series = allYears[key];
              const years = allYears.years;
              const maxVal = Math.max(...series, 1);

              return (
                <div key={key} className="company-score-panel company-score-panel--allyears">
                  <div className="company-score-panel__allyears-left">
                    <div
                      className="company-score-panel__icon"
                      style={{ '--score-color': accent } as CSSProperties}
                    >
                      <Icon size={20} strokeWidth={2} aria-hidden />
                    </div>
                    <div className="company-score-panel__allyears-label">
                      {labelLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                    <p className="company-score-panel__allyears-note">
                      {improvementSince(
                        series,
                        years[0],
                        allYears.improvementPercent,
                      )}
                    </p>
                  </div>

                  <div className="company-score-panel__allyears-chart">
                    <div className="company-score-panel__allyears-bars">
                      {series.map((value, i) => {
                        const { color, shadow } = allYearsBarColor(value);
                        const height = Math.max(
                          24,
                          Math.round((value / maxVal) * ALL_YEARS_BAR_MAX_PX),
                        );
                        return (
                          <div key={years[i]} className="company-score-panel__allyears-bar-col">
                            <span className="company-score-panel__allyears-bar-value">{value}</span>
                            <span
                              className="company-score-panel__allyears-bar"
                              style={{
                                height: `${height}px`,
                                background: color,
                                boxShadow: i === 0 ? `0 4px 10px 0 ${shadow}` : undefined,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="company-score-panel__allyears-years">
                      {years.map((year) => (
                        <span key={year} className="company-score-panel__allyears-year">
                          {year}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="company-avg-scores__legend" aria-label="Score band legend">
            {LEGEND.map((item) => (
              <div key={item.label} className="company-avg-scores__legend-item">
                <span
                  className="company-avg-scores__legend-swatch"
                  style={{ background: item.color }}
                />
                <span className="company-avg-scores__legend-label">{item.label}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="company-avg-scores__grid">
          {SCORE_META.map(({ key, label, Icon }) => {
            const value = Math.round(scores[key]);
            const tier = scoreTier(value);
            const TrendIcon = tier.rising ? TrendingUp : TrendingDown;

            return (
              <div key={key} className={`company-score-panel company-score-panel--${tier.tone}`}>
                <div className="company-score-panel__top">
                  <div
                    className="company-score-panel__icon"
                    style={
                      {
                        '--score-color': tier.color,
                      } as CSSProperties
                    }
                  >
                    <Icon size={20} strokeWidth={2} aria-hidden />
                  </div>
                  <div
                    className="company-score-panel__badge"
                    style={{ '--score-color': tier.color } as CSSProperties}
                  >
                    <TrendIcon size={14} strokeWidth={2.5} aria-hidden />
                    <span>{tier.label}</span>
                  </div>
                </div>

                <div className="company-score-panel__bottom">
                  <div className="company-score-panel__copy">
                    <div className="company-score-panel__label">{label}</div>
                    <div className="company-score-panel__value">
                      <span className="company-score-panel__number">{value}</span>
                      <span className="company-score-panel__denom">/100</span>
                    </div>
                  </div>
                  <div className="company-score-panel__bars" aria-hidden>
                    {BAR_HEIGHTS.map((h, i) => {
                      const lit = i < tier.barsLit;
                      return (
                        <span
                          key={i}
                          className={`company-score-panel__bar${lit ? ' company-score-panel__bar--lit' : ''}`}
                          style={{
                            height: `${h}px`,
                            ...(lit
                              ? {
                                  background: tier.color,
                                  boxShadow: `0 4px 10px 0 ${tier.shadow}`,
                                }
                              : {}),
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
