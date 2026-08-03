import { Info, OctagonAlert } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import { getTopDiseaseRiskConcernInsight } from '../../content/chartInsights';
import { DUMMY_ALL_YEARS_TOP_DISEASE_RISKS } from '../../data/dummyAllYearsMetrics';
import type { TopHighRiskDisease } from '../../types';
import type { YearOption } from '../layout/DashboardHeader';
import './TopHighRiskDiseasesList.css';

interface TopHighRiskDiseasesListProps {
  diseases: TopHighRiskDisease[];
  title?: string;
  subtitle?: string;
  info?: string;
  insightPrefix?: string;
  loading?: boolean;
  selectedYear?: YearOption;
}

const BUBBLE_COLORS = ['#4A45D3', '#0E0EA8', '#B760FF'] as const;

/** Decorative bubble sizes within each year cluster (large / medium / small). */
const CLUSTER_SIZES = ['lg', 'md', 'sm'] as const;

function formatPct(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function TopHighRiskDiseasesList({
  diseases,
  title = 'Top disease risks',
  subtitle = 'Highest elevated-risk share across the workforce',
  info = CHART_INFO.topHighRiskDiseases,
  insightPrefix = 'employees',
  loading = false,
  selectedYear = '2026',
}: TopHighRiskDiseasesListProps) {
  const isAllYears = selectedYear === 'all';
  const top3 = diseases.slice(0, 3);
  const allYears = DUMMY_ALL_YEARS_TOP_DISEASE_RISKS;

  const lead = isAllYears
    ? [...allYears].sort((a, b) => b.highRiskPercent - a.highRiskPercent)[0]
    : top3[0];

  const concern =
    !loading && lead
      ? getTopDiseaseRiskConcernInsight(lead, insightPrefix).text
      : undefined;

  return (
    <article
      className={`top-disease-bubbles${isAllYears ? ' top-disease-bubbles--allyears' : ''}`}
    >
      <header className="top-disease-bubbles__header">
        <div className="top-disease-bubbles__title-row">
          <h3 className="top-disease-bubbles__title">{title}</h3>
          <span className="top-disease-bubbles__info" tabIndex={0}>
            <Info size={16} aria-hidden />
            <span className="top-disease-bubbles__info-popup" role="tooltip">
              {info}
            </span>
          </span>
        </div>
        <p className="top-disease-bubbles__subtitle">{subtitle}</p>

        {isAllYears && (
          <div className="top-disease-bubbles__legend" aria-label="Year legend">
            {allYears.map((row) => (
              <div key={row.year} className="top-disease-bubbles__legend-item">
                <span
                  className="top-disease-bubbles__legend-swatch"
                  style={{ backgroundColor: row.color }}
                />
                <span className="top-disease-bubbles__legend-label">{row.year}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      {isAllYears ? (
        <div
          className="top-disease-bubbles__stage top-disease-bubbles__stage--allyears"
          aria-label="Top disease risk by year"
        >
          {allYears.map((row, clusterIndex) => (
            <div
              key={row.year}
              className={`top-disease-year-cluster top-disease-year-cluster--${clusterIndex + 1}`}
            >
              {CLUSTER_SIZES.map((size, bubbleIndex) => (
                <div
                  key={size}
                  className={`top-disease-bubble top-disease-bubble--allyears top-disease-bubble--allyears-${size} top-disease-bubble--allyears-float-${bubbleIndex + 1}`}
                  style={{ backgroundColor: row.color }}
                >
                  <span className="top-disease-bubble__pct">
                    {formatPct(row.highRiskPercent)}
                  </span>
                  <span className="top-disease-bubble__name">{row.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="top-disease-bubbles__stage" aria-label="Top disease risk bubbles">
          {loading ? (
            <p className="top-disease-bubbles__empty">Loading…</p>
          ) : top3.length === 0 ? (
            <p className="top-disease-bubbles__empty">No elevated-risk disease data available.</p>
          ) : (
            top3.map((disease, index) => (
              <div
                key={disease.name}
                className={`top-disease-bubble top-disease-bubble--${index + 1}`}
                style={{ backgroundColor: BUBBLE_COLORS[index] ?? BUBBLE_COLORS[2] }}
              >
                <span className="top-disease-bubble__pct">
                  {formatPct(disease.highRiskPercent)}
                </span>
                <span className="top-disease-bubble__name">{disease.name}</span>
              </div>
            ))
          )}
        </div>
      )}

      {concern && (
        <footer className="top-disease-bubbles__concern">
          <div className="top-disease-bubbles__concern-title">
            <OctagonAlert size={22} strokeWidth={1.75} aria-hidden />
            <span>Concern</span>
          </div>
          <p className="top-disease-bubbles__concern-text">{concern}</p>
        </footer>
      )}
    </article>
  );
}
