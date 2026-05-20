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
import type { OverallRiskScoreBucket } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { OVERALL_RISK_COLORS, useChartTheme } from './chartTheme';

interface OverallRiskScoreChartProps {
  buckets: OverallRiskScoreBucket[];
}

export function OverallRiskScoreChart({ buckets }: OverallRiskScoreChartProps) {
  const chart = useChartTheme();
  const chartData = buckets.map((b) => ({
    band: b.band,
    percent: b.percent,
    count: b.count,
  }));
  const elevated = buckets
    .filter((b) => b.band === 'Increased Risk' || b.band === 'High risk')
    .reduce((sum, b) => sum + b.percent, 0);

  return (
    <ChartCard
      title="Overall risk score"
      subtitle="Workforce distribution by risk band"
      info={CHART_INFO.overallRiskScore}
      insight={
        <InsightFooter
          tone={elevated > 25 ? 'concern' : 'neutral'}
          text={`${elevated}% of employees fall in Increased Risk or High risk bands — use for programme prioritisation and doctor consultation outreach.`}
        />
      }
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
          <XAxis
            dataKey="band"
            tick={chart.tick(10)}
            interval={0}
            angle={-10}
            textAnchor="end"
            height={56}
          />
          <YAxis
            domain={[0, 100]}
            tick={chart.tick(11)}
            label={{ value: '% of workforce', angle: -90, position: 'insideLeft', ...chart.axisLabel(11) }}
          />
          <Tooltip
            {...chart.tooltipProps}
            formatter={(value, _name, item) => {
              const count = (item?.payload as { count?: number })?.count ?? 0;
              const v = typeof value === 'number' ? value : Number(value);
              return [`${v}% (${count} employees)`, 'Share'];
            }}
          />
          <Bar dataKey="percent" name="Share" radius={[4, 4, 0, 0]} maxBarSize={72}>
            {chartData.map((entry) => (
              <Cell key={entry.band} fill={OVERALL_RISK_COLORS[entry.band] ?? chart.colors.accent} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
