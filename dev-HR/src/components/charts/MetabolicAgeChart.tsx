import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_INFO } from '../../content/chartInfo';
import type { MetabolicAgeSummary } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import { pctTooltip } from './tooltipFormat';

interface MetabolicAgeChartProps {
  data: MetabolicAgeSummary;
}

export function MetabolicAgeChart({ data }: MetabolicAgeChartProps) {
  const chart = useChartTheme();
  const chartData = data.buckets.map((b) => ({
    name: b.label,
    percent: b.percent,
    count: b.count,
    isHighRisk: b.isHighRisk,
  }));

  return (
    <ChartCard
      title="Metabolic age distribution"
      subtitle={`Avg. gap: ${data.avgGapYears} years · ${data.highRiskPercent}% high risk`}
      info={CHART_INFO.metabolicAge}
      insight={
        <InsightFooter
          tone="concern"
          text={`${data.highRiskPercent}% of tested employees have metabolic age at least 3 years above their actual age — prioritise for lifestyle and clinical follow-up.`}
        />
      }
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
          <XAxis
            dataKey="name"
            tick={chart.tick(10)}
            interval={0}
            angle={-12}
            textAnchor="end"
            height={70}
          />
          <YAxis
            tick={chart.tick(11)}
            label={{ value: '% of workforce', angle: -90, position: 'insideLeft', ...chart.axisLabel(11) }}
          />
          <Tooltip
            {...chart.tooltipProps}
            formatter={pctTooltip}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="percent" name="Share" radius={[4, 4, 0, 0]} maxBarSize={72}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.isHighRisk ? chart.colors.danger : chart.colors.accent} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
