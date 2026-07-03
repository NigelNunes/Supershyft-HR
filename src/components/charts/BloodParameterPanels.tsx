import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { bloodPanelInfo } from '../../content/chartInfo';
import type { BloodParameterPanel } from '../../types';
import { useChartTheme } from './chartTheme';
import './BloodParameterPanels.css';

const PANEL_PLACEHOLDERS: BloodParameterPanel[] = [
  { id: 'b12', name: 'Vitamin B12', inRangePercent: 0, abnormalPercent: 0 },
  { id: 'd3', name: 'Vitamin D3', inRangePercent: 0, abnormalPercent: 0 },
  { id: 'diabetes', name: 'Diabetes', inRangePercent: 0, abnormalPercent: 0 },
  { id: 'lipid', name: 'Lipid', inRangePercent: 0, abnormalPercent: 0 },
  { id: 'inflammatory', name: 'Inflammatory', inRangePercent: 0, abnormalPercent: 0 },
];

interface BloodParameterPanelsProps {
  panels: BloodParameterPanel[];
  loading?: boolean;
}

export function BloodParameterPanels({ panels, loading = false }: BloodParameterPanelsProps) {
  const chart = useChartTheme();
  const displayPanels = panels.length > 0 ? panels : PANEL_PLACEHOLDERS;

  return (
    <div className="blood-panels">
      {displayPanels.map((panel) => {
        const hasData = panels.length > 0;
        const inRangePercent = hasData ? panel.inRangePercent : 0;
        const abnormalPercent = hasData ? panel.abnormalPercent : 0;
        const showConcern = hasData && abnormalPercent > 30;

        return (
          <ChartCard
            key={panel.id}
            title={panel.name}
            info={bloodPanelInfo(panel.id, panel.name)}
            insight={
              hasData ? (
                <InsightFooter
                  tone={showConcern ? 'concern' : 'neutral'}
                  text={`${showConcern ? 'Concern' : 'Insight'}: ${abnormalPercent}% outside optimal range.`}
                />
              ) : undefined
            }
          >
            <div className="blood-panel__ring">
              <svg viewBox="0 0 120 120" className="blood-panel__svg" aria-hidden>
                <circle cx="60" cy="60" r="52" fill="none" stroke={chart.colors.border} strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={showConcern ? chart.colors.danger : chart.colors.accent}
                  strokeWidth="10"
                  strokeDasharray={`${(inRangePercent / 100) * 327} 327`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="blood-panel__center">
                <span className="blood-panel__pct">
                  {loading ? '…' : hasData ? `${inRangePercent}%` : '—'}
                </span>
                <span className="blood-panel__label">in range</span>
              </div>
            </div>
          </ChartCard>
        );
      })}
    </div>
  );
}
