import { Info, OctagonAlert, TrendingDown, TrendingUp } from 'lucide-react';
import { bloodPanelInfo } from '../../content/chartInfo';
import { DUMMY_ALL_YEARS_BLOOD_PANELS } from '../../data/dummyAllYearsMetrics';
import type { BloodParameterPanel } from '../../types';
import type { YearOption } from '../layout/DashboardHeader';
import './BloodParameterPanels.css';

const PANEL_PLACEHOLDERS: BloodParameterPanel[] = [
  { id: 'b12', name: 'Vitamin B12', inRangePercent: 0, abnormalPercent: 0 },
  { id: 'd3', name: 'Vitamin D3', inRangePercent: 0, abnormalPercent: 0 },
  { id: 'diabetes', name: 'Diabetes', inRangePercent: 0, abnormalPercent: 0 },
  { id: 'lipid', name: 'Lipid', inRangePercent: 0, abnormalPercent: 0 },
  { id: 'inflammatory', name: 'Inflammatory', inRangePercent: 0, abnormalPercent: 0 },
];

const DOT_COUNT = 20;
const ALL_YEARS_DOT_COUNT = 10;

interface BloodParameterPanelsProps {
  panels: BloodParameterPanel[];
  loading?: boolean;
  selectedYear?: YearOption;
}

function litDotCount(inRangePercent: number): number {
  return Math.max(0, Math.min(DOT_COUNT, Math.round(inRangePercent / 5)));
}

/** 2×5 grid indices filled from the bottom (left→right within each row). */
function isAllYearsDotLit(index: number, lit: number): boolean {
  const row = Math.floor(index / 2); // 0 = top
  const col = index % 2;
  const fromBottom = (4 - row) * 2 + col; // 0 = bottom-left
  return fromBottom < lit;
}

function YearDotColumn({ year, lit }: { year: number; lit: number }) {
  return (
    <div className="blood-lab-card__year-col">
      <div className="blood-lab-card__year-dots" aria-hidden>
        {Array.from({ length: ALL_YEARS_DOT_COUNT }, (_, i) => (
          <span
            key={i}
            className={`blood-lab-card__dot${isAllYearsDotLit(i, lit) ? ' blood-lab-card__dot--lit' : ''}`}
          />
        ))}
      </div>
      <span className="blood-lab-card__year-label">{year}</span>
    </div>
  );
}

export function BloodParameterPanels({
  panels,
  loading = false,
  selectedYear = '2026',
}: BloodParameterPanelsProps) {
  const isAllYears = selectedYear === 'all';
  const displayPanels = panels.length > 0 ? panels : PANEL_PLACEHOLDERS;
  const hasData = panels.length > 0;

  if (isAllYears) {
    return (
      <div className="blood-lab-panels">
        {DUMMY_ALL_YEARS_BLOOD_PANELS.map((panel) => {
          const improving = panel.deltaPercent >= 0;
          const TrendIcon = improving ? TrendingUp : TrendingDown;
          const deltaLabel = `${improving ? '+' : ''}${panel.deltaPercent}%`;
          const sinceYear = panel.years[0]?.year ?? 2023;

          return (
            <article key={panel.id} className="blood-lab-card blood-lab-card--allyears">
              <div className="blood-lab-card__top">
                <div className="blood-lab-card__title-row">
                  <h3 className="blood-lab-card__title">{panel.name}</h3>
                  <span className="blood-lab-card__info" tabIndex={0}>
                    <Info size={16} aria-hidden />
                    <span className="blood-lab-card__info-popup" role="tooltip">
                      {bloodPanelInfo(panel.id, panel.name)}
                    </span>
                  </span>
                </div>

                <div className="blood-lab-card__allyears-body">
                  <div className="blood-lab-card__years">
                    {panel.years.map((col) => (
                      <YearDotColumn key={col.year} year={col.year} lit={col.lit} />
                    ))}
                  </div>

                  <div
                    className={`blood-lab-card__trend${improving ? ' blood-lab-card__trend--up' : ' blood-lab-card__trend--down'}`}
                  >
                    <div className="blood-lab-card__trend-delta">
                      <TrendIcon size={18} strokeWidth={2.5} aria-hidden />
                      <span>{deltaLabel}</span>
                    </div>
                    <p className="blood-lab-card__trend-note">
                      {improving ? 'Improving' : 'Declining'} since {sinceYear}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="blood-lab-panels">
      {displayPanels.map((panel) => {
        const inRange = hasData ? Math.round(panel.inRangePercent) : 0;
        const outside = hasData
          ? panel.abnormalPercent > 0
            ? Math.round(panel.abnormalPercent)
            : Math.max(0, 100 - inRange)
          : 0;
        const lit = hasData && !loading ? litDotCount(panel.inRangePercent) : 0;

        return (
          <article key={panel.id} className="blood-lab-card">
            <div className="blood-lab-card__top">
              <div className="blood-lab-card__title-row">
                <h3 className="blood-lab-card__title">{panel.name}</h3>
                <span className="blood-lab-card__info" tabIndex={0}>
                  <Info size={16} aria-hidden />
                  <span className="blood-lab-card__info-popup" role="tooltip">
                    {bloodPanelInfo(panel.id, panel.name)}
                  </span>
                </span>
              </div>

              <div className="blood-lab-card__viz">
                <div className="blood-lab-card__dots" aria-hidden>
                  {Array.from({ length: DOT_COUNT }, (_, i) => (
                    <span
                      key={i}
                      className={`blood-lab-card__dot${i < lit ? ' blood-lab-card__dot--lit' : ''}`}
                    />
                  ))}
                </div>
                <div className="blood-lab-card__pct-block">
                  <span className="blood-lab-card__pct">
                    {loading ? '…' : hasData ? `${inRange}%` : '—'}
                  </span>
                  <span className="blood-lab-card__pct-label">IN RANGE</span>
                </div>
              </div>
            </div>

            <footer className="blood-lab-card__concern">
              <div className="blood-lab-card__concern-title">
                <OctagonAlert size={16} strokeWidth={1.75} aria-hidden />
                <span>Concern</span>
              </div>
              <p className="blood-lab-card__concern-text">
                {loading
                  ? '…'
                  : hasData
                    ? `${outside}% outside optimal range.`
                    : 'No lab panel data available.'}
              </p>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
