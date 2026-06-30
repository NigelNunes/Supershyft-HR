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
import { getTopDiseaseRiskConcernInsight } from '../../content/chartInsights';
import type { TopHighRiskDisease } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import { pctTooltip } from './tooltipFormat';

interface TopHighRiskDiseasesChartProps {
  diseases: TopHighRiskDisease[];
  title?: string;
  subtitle?: string;
  info?: string;
  insightPrefix?: string;
}

export function TopHighRiskDiseasesChart({
  diseases,
  title = 'High-risk distribution',
  subtitle = 'Top 3 diseases · elevated risk across workforce',
  info = CHART_INFO.topHighRiskDiseases,
  insightPrefix = 'employees',
}: TopHighRiskDiseasesChartProps) {
  const chart = useChartTheme();
  const chartData = diseases.map((d) => ({
    name: d.name,
    percent: d.highRiskPercent,
  }));
  const top = diseases[0];

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      info={info}
      insight={
        top ? (
          <InsightFooter
            tone="concern"
            text={getTopDiseaseRiskConcernInsight(top, insightPrefix).text}
          />
        ) : undefined
      }
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} horizontal={false} />
          <XAxis type="number" domain={[0, 50]} tick={chart.tick(11)} unit="%" />
          <YAxis type="category" dataKey="name" tick={chart.tick(11)} width={120} />
          <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
          <Bar dataKey="percent" name="Elevated risk" radius={[0, 4, 4, 0]} maxBarSize={36}>
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  entry.percent >= 30
                    ? chart.colors.danger
                    : entry.percent >= 25
                      ? '#D85A30'
                      : '#EF9F27'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
