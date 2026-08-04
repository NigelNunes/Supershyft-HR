import { Info } from 'lucide-react';
import { highlightIndexForRank } from '../../utils/rankSparkline';
import { CHART_INFO } from '../../content/chartInfo';
import {
  DUMMY_ALL_YEARS_METRICS,
  DUMMY_EXECUTIVE_RANKING,
  getDummyYearExecutiveRanking,
  parseCampYear,
} from '../../data/dummyAllYearsMetrics';
import type { RankingSummary } from '../../types';
import type { YearOption } from '../layout/DashboardHeader';
import { IndiaHexMap } from './IndiaHexMap';
import './ExecutiveRankingCard.css';

interface ExecutiveRankingCardProps {
  ranking?: RankingSummary | null;
  rankingLoading?: boolean;
  selectedYear?: YearOption;
}

const NATIONAL_BAR_HEIGHTS = [12, 14, 16, 20, 24, 28, 36, 40, 44, 44, 48, 56, 56, 64, 64, 64];
const INDUSTRY_BAR_HEIGHTS = [12, 14, 16, 20, 24, 28, 36, 40, 44, 44, 48, 56, 56, 64, 64, 64];

function RankBars({
  heights,
  highlightIndex,
  tone,
}: {
  heights: number[];
  highlightIndex: number;
  tone: 'emerald' | 'lime';
}) {
  return (
    <div className={`executive-rank-bars executive-rank-bars--${tone}`} aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className={`executive-rank-bars__bar${i === highlightIndex ? ' executive-rank-bars__bar--active' : ''}`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

/** 3-year rank sparkline — lower rank plots higher. */
function RankYearSparkline({
  values,
  tone,
}: {
  values: readonly number[];
  tone: 'green' | 'lime';
}) {
  const color = tone === 'green' ? '#05ff54' : '#e5ff64';
  const w = 240;
  const h = 48;
  const padX = 38;
  const padY = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);

  const points = values.map((value, i) => {
    const x = padX + (i * (w - padX * 2)) / Math.max(values.length - 1, 1);
    const norm = (max - value) / span;
    const y = padY + (1 - norm) * (h - padY * 2);
    return { x, y };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg className="executive-rank-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        return (
          <g key={i}>
            {isLast && <circle cx={p.x} cy={p.y} r="7" fill={color} opacity="0.2" />}
            <circle cx={p.x} cy={p.y} r={isLast ? 5 : 5} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

function AllYearsRankPanel({
  label,
  values,
  years,
  tone,
}: {
  label: string;
  values: readonly number[];
  years: readonly number[];
  tone: 'green' | 'lime';
}) {
  return (
    <div className="executive-rank-panel executive-rank-panel--allyears">
      <div className="executive-rank-panel__allyears-label">{label}</div>
      <div className="executive-rank-panel__allyears-body">
        <RankYearSparkline values={values} tone={tone} />
        <div className="executive-rank-panel__allyears-years">
          {years.map((year, i) => (
            <div key={year} className="executive-rank-panel__allyears-col">
              <span className="executive-rank-panel__allyears-value">#{values[i]}</span>
              <span className="executive-rank-panel__allyears-year">{year}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ExecutiveRankingCard({
  ranking = null,
  rankingLoading = false,
  selectedYear = '2026',
}: ExecutiveRankingCardProps) {
  const isAllYears = selectedYear === 'all';
  const campYear = parseCampYear(selectedYear);
  const d = campYear ? getDummyYearExecutiveRanking(campYear) : DUMMY_EXECUTIVE_RANKING;
  const allYears = DUMMY_ALL_YEARS_METRICS;
  const nationalRank = rankingLoading
    ? null
    : (ranking?.cityRank ?? d.nationalRank);
  const industryRank = rankingLoading
    ? null
    : (ranking?.industryRank ?? d.industryRank);

  const nationalHighlight =
    nationalRank == null
      ? -1
      : highlightIndexForRank(nationalRank, d.nationalAmong, NATIONAL_BAR_HEIGHTS.length);
  const industryHighlight =
    industryRank == null
      ? -1
      : highlightIndexForRank(industryRank, d.industryAmong, INDUSTRY_BAR_HEIGHTS.length);

  return (
    <article className="executive-ranking-card">
      <div className="executive-ranking-card__content">
        <header className="executive-ranking-card__header">
          <div className="executive-ranking-card__title-row">
            <h3 className="executive-ranking-card__title">Executive Ranking</h3>
            <span className="executive-ranking-card__info" tabIndex={0}>
              <Info size={16} aria-hidden />
              <span className="executive-ranking-card__info-popup" role="tooltip">
                {CHART_INFO.executiveRanking}
              </span>
            </span>
          </div>
          <p className="executive-ranking-card__subtitle">
            National rank and industry rank standing across all other industries
          </p>
        </header>

        <div
          className={`executive-ranking-card__ranks${isAllYears ? ' executive-ranking-card__ranks--allyears' : ''}`}
        >
          {isAllYears ? (
            <>
              <AllYearsRankPanel
                label="National Rank"
                values={allYears.nationalRank}
                years={allYears.years}
                tone="green"
              />
              <AllYearsRankPanel
                label="Industry Rank"
                values={allYears.industryRank}
                years={allYears.years}
                tone="lime"
              />
            </>
          ) : (
            <>
              <div className="executive-rank-panel">
                <div className="executive-rank-panel__row">
                  <div className="executive-rank-panel__text">
                    <span className="executive-rank-panel__label">National Rank</span>
                    <p className="executive-rank-panel__value executive-rank-panel__value--emerald">
                      <span className="executive-rank-panel__hash">#</span>
                      <span>{nationalRank == null ? '…' : nationalRank}</span>
                    </p>
                  </div>
                  <RankBars
                    heights={NATIONAL_BAR_HEIGHTS}
                    highlightIndex={nationalHighlight}
                    tone="emerald"
                  />
                </div>
                <p className="executive-rank-panel__footer">{d.nationalAmongLabel}</p>
              </div>

              <div className="executive-rank-panel">
                <div className="executive-rank-panel__row">
                  <div className="executive-rank-panel__text">
                    <span className="executive-rank-panel__label">Industry Rank</span>
                    <p className="executive-rank-panel__value executive-rank-panel__value--lime">
                      <span className="executive-rank-panel__hash">#</span>
                      <span>{industryRank == null ? '…' : industryRank}</span>
                    </p>
                  </div>
                  <RankBars
                    heights={INDUSTRY_BAR_HEIGHTS}
                    highlightIndex={industryHighlight}
                    tone="lime"
                  />
                </div>
                <p className="executive-rank-panel__footer">{d.industryAmongLabel}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="executive-map" aria-hidden>
        <div className="executive-map__stage">
          <IndiaHexMap
            cities={d.cities.map((city) => ({
              name: city.name,
              rank: city.rank,
              tone: city.tone,
            }))}
          />
        </div>
      </div>
    </article>
  );
}
