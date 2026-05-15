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
import type { NutritionSummary } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import { pctTooltip } from './tooltipFormat';

interface NutritionMacroChartProps {
  data: NutritionSummary;
}

export function NutritionMacroChart({ data }: NutritionMacroChartProps) {
  const chart = useChartTheme();
  const chartData = data.macros.map((m) => ({
    name: m.name,
    'Within ideal': m.withinIdealPercent,
    Above: m.aboveIdealPercent,
    Below: m.belowIdealPercent,
  }));

  const fibreLow = data.macros.find((m) => m.name === 'Fibre');

  return (
    <ChartCard
      title="Nutrition score & macro balance"
      subtitle={`Avg. score ${data.avgScore}/5 · ${data.riskBand} band`}
      info={CHART_INFO.nutrition}
      insight={
        <InsightFooter
          tone={fibreLow && fibreLow.withinIdealPercent < 60 ? 'concern' : 'neutral'}
          text={
            fibreLow
              ? `Only ${fibreLow.withinIdealPercent}% meet ideal fibre intake; water intake above ideal in ${data.macros.find((m) => m.name === 'Water')?.aboveIdealPercent ?? 0}% of employees.`
              : 'Review macro distribution to tailor nutrition programmes by department.'
          }
        />
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
          <XAxis dataKey="name" tick={chart.tick(12)} />
          <YAxis domain={[0, 100]} tick={chart.tick(11)} />
          <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
          <Legend wrapperStyle={{ ...chart.legendStyle, paddingTop: 8 }} />
          <Bar dataKey="Within ideal" stackId="a" fill={chart.colors.accent} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Above" stackId="a" fill="#EF9F27" />
          <Bar dataKey="Below" stackId="a" fill={chart.colors.danger} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
