import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { bloodPanelInfo } from '../../content/chartInfo';
import type { BloodParameterPanel } from '../../types';
import { useChartTheme } from './chartTheme';
import './BloodParameterPanels.css';

interface BloodParameterPanelsProps {
  panels: BloodParameterPanel[];
}

export function BloodParameterPanels({ panels }: BloodParameterPanelsProps) {
  const chart = useChartTheme();

  return (
    <div className="blood-panels">
      {panels.map((panel) => (
        <ChartCard
          key={panel.id}
          title={panel.name}
          info={bloodPanelInfo(panel.id, panel.name)}
          insight={
            <InsightFooter
              tone={panel.abnormalPercent > 30 ? 'concern' : 'neutral'}
              text={`${panel.abnormalPercent}% outside optimal range. ${panel.topConcern}.`}
            />
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
                stroke={panel.abnormalPercent > 30 ? chart.colors.danger : chart.colors.accent}
                strokeWidth="10"
                strokeDasharray={`${(panel.inRangePercent / 100) * 327} 327`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className="blood-panel__pct">{panel.inRangePercent}%</span>
            <span className="blood-panel__label">in range</span>
          </div>
        </ChartCard>
      ))}
    </div>
  );
}
