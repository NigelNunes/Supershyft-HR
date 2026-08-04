import { useMemo, useState } from 'react';
import { AlertTriangle, Info, Lightbulb, Mars, Venus } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import { getTopDiseaseRiskConcernInsight } from '../../content/chartInsights';
import type { YearOption } from '../layout/DashboardHeader';
import {
  DUMMY_ALL_YEARS_DISEASE_DEEP_DIVE,
  DUMMY_ALL_YEARS_DISEASE_YEARS,
  DUMMY_ALL_YEARS_TOP_DISEASE_RISKS,
  type AllYearsDiseaseGenderSeries,
  type AllYearsDiseaseRiskBand,
} from '../../data/dummyAllYearsMetrics';
import type { DiseaseRiskData, RiskLevel } from '../../types';
import './DiseaseDeepDive.css';

interface DiseaseDeepDiveProps {
  diseases: DiseaseRiskData[];
  loading?: boolean;
  selectedYear?: YearOption;
}

const RISK_ORDER: RiskLevel[] = ['Healthy', 'Increased', 'High', 'Very High'];
const ALL_YEARS_BANDS: AllYearsDiseaseRiskBand[] = [
  'Healthy',
  'Increased',
  'High',
  'Very High',
];
const CHART_HEIGHT = 256;

type HoverCell = {
  gender: 'male' | 'female';
  band: AllYearsDiseaseRiskBand;
  yearIndex: number;
};

function segmentValue(disease: DiseaseRiskData, level: RiskLevel, key: string): number {
  const bucket = disease.buckets.find((b) => b.level === level);
  return bucket?.segments[key] ?? 0;
}

function trendCopy(values: readonly [number, number, number], years: readonly number[]): string {
  const first = values[0];
  const last = values[values.length - 1];
  const delta = Math.round((last - first) * 10) / 10;
  const abs = Math.abs(delta);
  const since = years[0];
  if (delta > 0) return `Increased by ${abs}% since ${since}.`;
  if (delta < 0) return `Decreased by ${abs}% since ${since}.`;
  return `Unchanged since ${since}.`;
}

function bandClass(band: AllYearsDiseaseRiskBand): string {
  return band.toLowerCase().replace(/\s+/g, '-');
}

function GenderYearGrid({
  title,
  gender,
  series,
  years,
  hover,
  onHover,
}: {
  title: string;
  gender: 'male' | 'female';
  series: AllYearsDiseaseGenderSeries;
  years: readonly number[];
  hover: HoverCell | null;
  onHover: (next: HoverCell | null) => void;
}) {
  const Icon = gender === 'male' ? Mars : Venus;
  const activeBand = hover?.gender === gender ? hover.band : null;
  const activeYearIndex = hover?.gender === gender ? hover.yearIndex : null;

  return (
    <div className={`ddd-allyears-panel ddd-allyears-panel--${gender}`}>
      <div className="ddd-allyears-panel__title">
        <Icon size={22} strokeWidth={2} aria-hidden />
        <span>{title}</span>
      </div>

      <div className="ddd-allyears-grid">
        <span className="ddd-allyears-grid__corner" aria-hidden />
        {ALL_YEARS_BANDS.map((band) => (
          <span
            key={band}
            className={`ddd-allyears-grid__band ddd-allyears-grid__band--${bandClass(band)}`}
          >
            {band}
          </span>
        ))}

        {years.map((year, yearIndex) => (
          <div key={year} style={{ display: 'contents' }}>
            <span
              className={`ddd-allyears-grid__year${
                yearIndex === years.length - 1 ? ' ddd-allyears-grid__year--current' : ''
              }`}
            >
              {year}
            </span>
            {ALL_YEARS_BANDS.map((band) => {
              const value = series[band][yearIndex];
              const isActive = activeBand === band && activeYearIndex === yearIndex;
              return (
                <button
                  key={`${band}-${year}`}
                  type="button"
                  className={`ddd-allyears-cell ddd-allyears-cell--${bandClass(band)}${
                    isActive ? ' ddd-allyears-cell--active' : ''
                  }`}
                  onMouseEnter={() => onHover({ gender, band, yearIndex })}
                  onFocus={() => onHover({ gender, band, yearIndex })}
                  onMouseLeave={() => onHover(null)}
                  onBlur={() => onHover(null)}
                  aria-label={`${title}, ${band}, ${year}: ${value}%`}
                >
                  <span>{value}</span>
                  <span aria-hidden>%</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {activeBand != null && activeYearIndex != null && (
        <div className={`ddd-allyears-popup ddd-allyears-popup--${gender}`} role="tooltip">
          <div className="ddd-allyears-popup__timeline" aria-hidden>
            <span className="ddd-allyears-popup__rail" />
            <span className="ddd-allyears-popup__rail ddd-allyears-popup__rail--accent" />
            {years.map((year, index) => (
              <span
                key={year}
                className={`ddd-allyears-popup__dot${
                  index === activeYearIndex ? ' ddd-allyears-popup__dot--active' : ''
                }`}
              />
            ))}
          </div>
          <div className="ddd-allyears-popup__years">
            {years.map((year, index) => {
              const value = series[activeBand][index];
              const isActive = index === activeYearIndex;
              return (
                <div
                  key={year}
                  className={`ddd-allyears-popup__year${
                    isActive ? ' ddd-allyears-popup__year--active' : ''
                  }`}
                >
                  <span className="ddd-allyears-popup__pct">{value}%</span>
                  <span className="ddd-allyears-popup__label">{year}</span>
                </div>
              );
            })}
          </div>
          <div className="ddd-allyears-popup__insight">
            <Lightbulb size={14} strokeWidth={2} aria-hidden />
            <span>{trendCopy(series[activeBand], years)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AllYearsDiseaseDeepDive({ loading = false }: { loading?: boolean }) {
  const rows = DUMMY_ALL_YEARS_DISEASE_DEEP_DIVE;
  const years = DUMMY_ALL_YEARS_DISEASE_YEARS;
  const defaultIndex = Math.max(
    0,
    rows.findIndex((row) => row.code === 'type_2_diabetes'),
  );
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [hover, setHover] = useState<HoverCell | null>(null);
  const active = rows[activeIndex] ?? rows[0];

  const concern = useMemo(() => {
    const lead = [...DUMMY_ALL_YEARS_TOP_DISEASE_RISKS].sort(
      (a, b) => b.highRiskPercent - a.highRiskPercent,
    )[0];
    return getTopDiseaseRiskConcernInsight({
      name: lead.name,
      highRiskPercent: lead.highRiskPercent,
    });
  }, []);

  return (
    <article className="disease-deep-dive-card disease-deep-dive-card--allyears">
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
        </div>
        <p className="disease-deep-dive-card__subtitle">
          Risk distribution by gender · {active?.name ?? '—'}
        </p>
      </header>

      <div className="disease-deep-dive-card__tabs" role="tablist" aria-label="Disease">
        {rows.map((row, index) => (
          <button
            key={row.code}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            className={`disease-deep-dive-card__tab${
              index === activeIndex ? ' disease-deep-dive-card__tab--active' : ''
            }`}
            onClick={() => {
              setActiveIndex(index);
              setHover(null);
            }}
          >
            {row.name}
          </button>
        ))}
      </div>

      {loading && <p className="disease-deep-dive-card__empty">Loading disease distribution…</p>}

      {active && !loading && (
        <div className="ddd-allyears-body">
          <GenderYearGrid
            title="Male Population"
            gender="male"
            series={active.male}
            years={years}
            hover={hover}
            onHover={setHover}
          />
          <div className="ddd-allyears-divider" aria-hidden />
          <GenderYearGrid
            title="Female Population"
            gender="female"
            series={active.female}
            years={years}
            hover={hover}
            onHover={setHover}
          />
        </div>
      )}

      <footer className="disease-deep-dive-card__insight disease-deep-dive-card__insight--concern">
        <div className="disease-deep-dive-card__insight-title">
          <AlertTriangle size={20} strokeWidth={1.75} aria-hidden />
          <span>Concern</span>
        </div>
        <p className="disease-deep-dive-card__insight-text">{concern.text}</p>
      </footer>
    </article>
  );
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
  selectedYear = '2026',
}: DiseaseDeepDiveProps) {
  if (selectedYear === 'all') {
    return <AllYearsDiseaseDeepDive loading={loading} />;
  }
  return <SingleYearDiseaseDeepDive diseases={diseases} loading={loading} />;
}
