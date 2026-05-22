import { CHART_INFO } from '../../content/chartInfo';
import type { OxidativeStressByDept } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { OxidativeStressPanelBody } from './OxidativeStressPanelBody';
import { oxidativeElevatedPercent } from './oxidativeStressBands';
import './OxidativeStressChart.css';

interface OxidativeStressPieChartProps {
  data: OxidativeStressByDept;
  headcount?: number;
}

export function OxidativeStressPieChart({ data, headcount = 0 }: OxidativeStressPieChartProps) {
  const elevated = oxidativeElevatedPercent(data);

  return (
    <ChartCard
      title="Oxidative stress"
      subtitle={`${data.department} · severity distribution`}
      info={CHART_INFO.deptOxidativePie}
      insight={
        <InsightFooter
          tone={elevated > 20 ? 'concern' : 'neutral'}
          text={`${elevated}% of this department are in elevated oxidative stress bands (High + Very High).`}
        />
      }
      className="oxidative-stress-card"
    >
      <OxidativeStressPanelBody data={data} headcount={headcount} />
    </ChartCard>
  );
}
