import { Info, OctagonAlert } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import { getTopDiseaseRiskConcernInsight } from '../../content/chartInsights';
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

/** Fixed decorative sizes — assigned by percentage rank (highest → largest). */
const BUBBLE_COLORS = ['#4A45D3', '#0E0EA8', '#B760FF'] as const;

function formatPct(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

/** Keep the three fixed circle sizes; assign them by elevated-risk %. */
function allocateBubblesByPercent(diseases: TopHighRiskDisease[]): TopHighRiskDisease[] {
  return [...diseases]
    .sort((a, b) => b.highRiskPercent - a.highRiskPercent)
    .slice(0, 3);
}

export function TopHighRiskDiseasesList({
  diseases,
  title = 'Top disease risks',
  subtitle = 'Highest elevated-risk share across the workforce',
  info = CHART_INFO.topHighRiskDiseases,
  insightPrefix = 'employees',
  loading = false,
}: TopHighRiskDiseasesListProps) {
  const top3 = allocateBubblesByPercent(diseases);
  const lead = top3[0];

  const concern =
    !loading && lead
      ? getTopDiseaseRiskConcernInsight(lead, insightPrefix).text
      : undefined;

  return (
    <article className="top-disease-bubbles">
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
      </header>

      <div className="top-disease-bubbles__stage" aria-label="Top disease risk bubbles">
        {loading ? (
          <p className="top-disease-bubbles__empty">Loading…</p>
        ) : top3.length === 0 ? (
          <p className="top-disease-bubbles__empty">No elevated-risk disease data available.</p>
        ) : (
          top3.map((disease, rank) => (
            <div
              key={disease.name}
              className={`top-disease-bubble top-disease-bubble--${rank + 1}`}
              style={{ backgroundColor: BUBBLE_COLORS[rank] ?? BUBBLE_COLORS[2] }}
            >
              <span className="top-disease-bubble__pct">
                {formatPct(disease.highRiskPercent)}
              </span>
              <span className="top-disease-bubble__name">{disease.name}</span>
            </div>
          ))
        )}
      </div>

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
