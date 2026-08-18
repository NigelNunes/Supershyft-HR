import { useMemo, useState } from 'react';
import { Info, Lightbulb } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import type { YearOption } from '../layout/DashboardHeader';
import type { DiseaseRiskData, RiskLevel } from '../../types';
import './DiseaseDeepDive.css';

interface DiseaseDeepDiveProps {
  diseases: DiseaseRiskData[];
  loading?: boolean;
  selectedYear?: YearOption;
}

const RISK_ORDER: RiskLevel[] = ['Healthy', 'Increased', 'High', 'Very High'];
const CHART_HEIGHT = 256;

function segmentValue(disease: DiseaseRiskData, level: RiskLevel, key: string): number {
  const bucket = disease.buckets.find((b) => b.level === level);
  return bucket?.segments[key] ?? 0;
}

function SingleYearDiseaseDeepDive({
  diseases,
  loading = false,
}: {
  diseases: DiseaseRiskData[];
  loading?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = diseases[activeIndex] ?? diseases[0];

  const segmentKeys = useMemo(() => {
    if (!active) return [] as string[];
    const keys = Object.keys(active.buckets[0]?.segments ?? {});
    const preferred = ['Male', 'Female'];
    return [
      ...preferred.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !preferred.includes(k)),
    ];
  }, [active]);

  const insight = useMemo(() => {
    if (!active || loading) return '';
    const healthy = active.buckets.find((bucket) => bucket.level === 'Healthy');
    const total = healthy
      ? Object.values(healthy.segments).reduce((sum, value) => sum + value, 0) /
        Math.max(segmentKeys.length, 1)
      : 0;
    const high = active.buckets
      .filter((bucket) => bucket.level === 'High' || bucket.level === 'Very High')
      .flatMap((bucket) => Object.values(bucket.segments));
    const highAvg = high.length ? high.reduce((sum, value) => sum + value, 0) / high.length : 0;
    return `For ${active.disease.name}, ~${Math.round(total)}% of the workforce (gender) is in the Healthy band, while elevated risk (High + Very High) averages ${Math.round(highAvg)}% across segments.`;
  }, [active, loading, segmentKeys.length]);

  const statusLabel = active?.overallStatus ?? '';

  return (
    <article className="disease-deep-dive-card">
      <header className="disease-deep-dive-card__header">
        <div className="disease-deep-dive-card__header-top">
          <div className="disease-deep-dive-card__title-row">
            <h3 className="disease-deep-dive-card__title">Disease deep dive analysis</h3>
            <span className="disease-deep-dive-card__info" tabIndex={0}>
              <Info size={16} aria-hidden />
              <span className="disease-deep-dive-card__info-popup" role="tooltip">
                {CHART_INFO.diseaseDeepDive}
              </span>
            </span>
          </div>
          {active && !loading && (
            <span className="disease-deep-dive-card__status">{statusLabel}</span>
          )}
        </div>
        <p className="disease-deep-dive-card__subtitle">
          Risk distribution by gender · {active?.disease.name ?? '—'}
        </p>
      </header>

      <div className="disease-deep-dive-card__tabs" role="tablist" aria-label="Disease">
        {diseases.map((disease, index) => (
          <button
            key={disease.disease.code}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            className={`disease-deep-dive-card__tab${
              index === activeIndex ? ' disease-deep-dive-card__tab--active' : ''
            }`}
            onClick={() => setActiveIndex(index)}
          >
            {disease.disease.name}
          </button>
        ))}
      </div>

      {loading && <p className="disease-deep-dive-card__empty">Loading disease distribution…</p>}
      {!loading && diseases.length === 0 && (
        <p className="disease-deep-dive-card__empty">No disease distribution data available.</p>
      )}

      {active && !loading && (
        <>
          <div className="disease-deep-dive-card__chart">
            <div className="disease-deep-dive-card__y-label" aria-hidden>
              Percentage (%)
            </div>
            <div className="disease-deep-dive-card__plot">
              <div className="disease-deep-dive-card__grid" aria-hidden>
                {[100, 75, 50, 25, 0].map((tick) => (
                  <div key={tick} className="disease-deep-dive-card__grid-row">
                    <span>{tick}</span>
                    {tick > 0 && <span className="disease-deep-dive-card__grid-line" />}
                  </div>
                ))}
              </div>
              <div className="disease-deep-dive-card__bars">
                {RISK_ORDER.map((level) => (
                  <div key={level} className="disease-deep-dive-card__group">
                    <div
                      className="disease-deep-dive-card__pair"
                      style={{ height: `${CHART_HEIGHT}px` }}
                    >
                      {segmentKeys.map((key) => {
                        const value = Math.max(0, Math.min(100, segmentValue(active, level, key)));
                        const tone = key.toLowerCase().startsWith('f') ? 'female' : 'male';
                        return (
                          <div
                            key={key}
                            className={`disease-deep-dive-card__bar disease-deep-dive-card__bar--${tone}`}
                            style={{ height: `${(value / 100) * CHART_HEIGHT}px` }}
                            title={`${key}: ${Math.round(value)}%`}
                          />
                        );
                      })}
                    </div>
                    <span className="disease-deep-dive-card__x-label">{level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="disease-deep-dive-card__legend">
            <span className="disease-deep-dive-card__legend-item">
              <span className="disease-deep-dive-card__swatch disease-deep-dive-card__swatch--female" />
              Female
            </span>
            <span className="disease-deep-dive-card__legend-item">
              <span className="disease-deep-dive-card__swatch disease-deep-dive-card__swatch--male" />
              Male
            </span>
          </div>
        </>
      )}

      {insight && (
        <footer className="disease-deep-dive-card__insight">
          <div className="disease-deep-dive-card__insight-title">
            <Lightbulb size={22} strokeWidth={1.75} aria-hidden />
            <span>Insight</span>
          </div>
          <p className="disease-deep-dive-card__insight-text">{insight}</p>
        </footer>
      )}
    </article>
  );
}

export function DiseaseDeepDive({
  diseases,
  loading = false,
}: DiseaseDeepDiveProps) {
  return <SingleYearDiseaseDeepDive diseases={diseases} loading={loading} />;
}
