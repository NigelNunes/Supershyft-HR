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
import { lifestyleInfo } from '../../content/chartInfo';
import type { LifestyleIndicator, ToggleDimension } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import { pctTooltip } from './tooltipFormat';

interface LifestyleChartsProps {
  indicators: LifestyleIndicator[];
  dimension: ToggleDimension;
}

function LifestyleChart({ item, dimension }: { item: LifestyleIndicator; dimension: ToggleDimension }) {
  const chart = useChartTheme();
  const keys = Object.keys(item.buckets[0]?.segments ?? {});
  const data = item.buckets.map((b) => ({ label: b.label, ...b.segments }));

  return (
    <ChartCard
      title={`${item.title} (${new Date().getFullYear()})`}
      info={lifestyleInfo(item.id, item.title, dimension)}
      insight={<InsightFooter tone={item.insight.tone} text={item.insight.text} />}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
          <XAxis dataKey="label" tick={chart.tick(12)} />
          <YAxis
            domain={[0, 80]}
            tick={chart.tick(12)}
            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', ...chart.axisLabel(11) }}
          />
          <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
          <Legend wrapperStyle={{ ...chart.legendStyle, paddingTop: 8 }} />
          {keys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={i === 0 ? 'var(--chart-male)' : 'var(--chart-female)'}
              radius={[4, 4, 0, 0]}
              maxBarSize={56}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function LifestyleCharts({ indicators, dimension }: LifestyleChartsProps) {
  return (
    <div className="grid-2">
      {indicators.map((item) => (
        <LifestyleChart key={item.id} item={item} dimension={dimension} />
      ))}
    </div>
  );
}
