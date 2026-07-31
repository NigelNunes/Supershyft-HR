import { ChartCard } from '../ui/ChartCard';
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
        const outOfRangePercent = hasData
          ? (panel.abnormalPercent > 0
              ? panel.abnormalPercent
              : Math.max(0, 100 - panel.inRangePercent))
          : 0;

        return (
          <ChartCard
            key={panel.id}
            title={panel.name}
            info={bloodPanelInfo(panel.id, panel.name)}
          >
            <div className="blood-panel__ring">
              <svg viewBox="0 0 120 120" className="blood-panel__svg" aria-hidden>
                <circle cx="60" cy="60" r="52" fill="none" stroke={chart.colors.border} strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={chart.colors.danger}
                  strokeWidth="10"
                  strokeDasharray={`${(outOfRangePercent / 100) * 327} 327`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="blood-panel__center">
                <span className="blood-panel__pct">
                  {loading ? '…' : hasData ? `${outOfRangePercent}%` : '—'}
                </span>
                <span className="blood-panel__label">out of range</span>
              </div>
            </div>
          </ChartCard>
        );
      })}
    </div>
  );
}
