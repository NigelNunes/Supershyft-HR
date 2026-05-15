import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_INFO } from '../../content/chartInfo';
import type { AbnormalMarker } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import { pctTooltip } from './tooltipFormat';

interface TopAbnormalMarkersProps {
  markers: AbnormalMarker[];
}

export function TopAbnormalMarkers({ markers }: TopAbnormalMarkersProps) {
  const chart = useChartTheme();
  const sorted = [...markers].sort((a, b) => b.abnormalPercent - a.abnormalPercent);
  const top = sorted[0];

  return (
    <ChartCard
      title="Top abnormal lab markers"
      subtitle="Ranked by % outside reference range"
      info={CHART_INFO.topAbnormalMarkers}
      insight={
        <InsightFooter
          tone="concern"
          text={
            top
              ? `${top.testName} leads at ${top.abnormalPercent}% abnormal — align supplementation and screening programmes accordingly.`
              : 'Review ranked markers to plan lab-based interventions.'
          }
        />
      }
    >
      <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 36)}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} horizontal={false} />
          <XAxis type="number" domain={[0, 50]} tick={chart.tick(11)} />
          <YAxis type="category" dataKey="testName" width={140} tick={chart.tick(10)} />
          <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
          <Bar
            dataKey="abnormalPercent"
            name="Abnormal %"
            fill={chart.colors.danger}
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
