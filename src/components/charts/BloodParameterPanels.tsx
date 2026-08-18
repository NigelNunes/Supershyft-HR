import { Info, OctagonAlert } from 'lucide-react';
import { bloodPanelInfo } from '../../content/chartInfo';
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

interface BloodParameterPanelsProps {
  panels: BloodParameterPanel[];
  loading?: boolean;
  selectedYear?: YearOption;
}

function litDotCount(inRangePercent: number): number {
  return Math.max(0, Math.min(DOT_COUNT, Math.round(inRangePercent / 5)));
}

export function BloodParameterPanels({
  panels,
  loading = false,
}: BloodParameterPanelsProps) {
  const displayPanels = panels.length > 0 ? panels : PANEL_PLACEHOLDERS;
  const hasData = panels.length > 0;

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
