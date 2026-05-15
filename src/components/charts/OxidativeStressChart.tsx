import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_INFO } from '../../content/chartInfo';
import type { OxidativeStressByDept } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import { pctTooltip } from './tooltipFormat';

interface OxidativeStressChartProps {
  data: OxidativeStressByDept[];
}

const STACK_COLORS = {
  low: '#1D9E75',
  moderate: '#EF9F27',
  high: '#D85A30',
  veryHigh: '#E24B4A',
};

export function OxidativeStressChart({ data }: OxidativeStressChartProps) {
  const chart = useChartTheme();
  const chartData = data.map((d) => ({
    department: d.department,
    Low: d.low,
    Moderate: d.moderate,
    High: d.high,
    'Very High': d.veryHigh,
  }));

  const worst = [...data].sort((a, b) => b.high + b.veryHigh - (a.high + a.veryHigh))[0];
  const insight = worst
    ? `${worst.department} shows the highest combined High/Very High oxidative stress burden (${worst.high + worst.veryHigh}%). Prioritise antioxidant-rich nutrition and recovery programmes for this department.`
    : 'Review department-level oxidative stress distribution to target interventions.';

  return (
    <ChartCard
      title="Oxidative stress — department view"
      subtitle="Critical metabolic stress indicator"
      info={CHART_INFO.oxidativeStress}
      insight={<InsightFooter tone="concern" text={insight} />}
      className="oxidative-chart"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={chart.tick(11)} />
          <YAxis type="category" dataKey="department" width={90} tick={chart.tick(11)} />
          <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
          <Legend wrapperStyle={chart.legendStyle} />
          <Bar dataKey="Low" stackId="a" fill={STACK_COLORS.low} />
          <Bar dataKey="Moderate" stackId="a" fill={STACK_COLORS.moderate} />
          <Bar dataKey="High" stackId="a" fill={STACK_COLORS.high} />
          <Bar dataKey="Very High" stackId="a" fill={STACK_COLORS.veryHigh} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
