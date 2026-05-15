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
import type { GenderComparisonMetric } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import { numTooltip } from './tooltipFormat';

interface GenderComparisonChartProps {
  data: GenderComparisonMetric[];
}

export function GenderComparisonChart({ data }: GenderComparisonChartProps) {
  const chart = useChartTheme();
  const gap = data.find((d) => d.metric === 'Metabolic risk');
  const insight = gap
    ? `Men show ${gap.male - gap.female} points higher metabolic risk index than women; thyroid and hemoglobin patterns differ significantly by gender.`
    : 'Compare key health metrics between male and female employees to tailor programmes.';

  return (
    <ChartCard
      title="Gender health comparison"
      subtitle="Key differential metrics (index 0–100)"
      info={CHART_INFO.genderComparison}
      insight={<InsightFooter tone="neutral" text={insight} />}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
          <XAxis dataKey="metric" tick={chart.tick(11)} />
          <YAxis domain={[0, 100]} tick={chart.tick(12)} />
          <Tooltip {...chart.tooltipProps} formatter={numTooltip} />
          <Legend wrapperStyle={{ ...chart.legendStyle, paddingTop: 8 }} />
          <Bar dataKey="male" name="Men" fill="var(--chart-male)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="female" name="Women" fill="var(--chart-female)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
