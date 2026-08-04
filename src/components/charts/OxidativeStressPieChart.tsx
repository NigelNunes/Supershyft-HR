import { AlertTriangle } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import { getOxidativeStressConcernInsight } from '../../content/chartInsights';
import type { OxidativeStressByDept } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { OxidativeStressPanelBody } from './OxidativeStressPanelBody';
import { oxidativeElevatedPercent } from './oxidativeStressBands';
import './OxidativeStressChart.css';

interface OxidativeStressPieChartProps {
  data: OxidativeStressByDept;
  headcount?: number;
}

export function OxidativeStressPieChart({ data, headcount = 0 }: OxidativeStressPieChartProps) {
  const elevated = oxidativeElevatedPercent(data);
  const insight = getOxidativeStressConcernInsight(elevated);

  return (
    <ChartCard
      title="Oxidative stress"
      subtitle={`${data.department} · severity distribution`}
      info={CHART_INFO.deptOxidativePie}
      insight={
        <div className="oxidative-stress-insight">
          <div className="oxidative-stress-insight__title">
            <AlertTriangle size={20} strokeWidth={1.75} aria-hidden />
            <span>{insight.tone === 'positive' ? 'Positive' : 'Concern'}</span>
          </div>
          <p className="oxidative-stress-insight__text">{insight.text}</p>
        </div>
      }
      className="oxidative-stress-card"
    >
      <OxidativeStressPanelBody data={data} headcount={headcount} />
    </ChartCard>
  );
}
