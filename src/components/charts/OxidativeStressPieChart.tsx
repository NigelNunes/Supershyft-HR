import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_INFO } from '../../content/chartInfo';
import type { OxidativeStressByDept } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import { pctTooltip } from './tooltipFormat';

interface OxidativeStressPieChartProps {
  data: OxidativeStressByDept;
}

const SLICE_COLORS = {
  Low: '#1D9E75',
  Moderate: '#EF9F27',
  High: '#D85A30',
  'Very High': '#E24B4A',
};

export function OxidativeStressPieChart({ data }: OxidativeStressPieChartProps) {
  const chart = useChartTheme();
  const chartData = [
    { name: 'Low', value: data.low },
    { name: 'Moderate', value: data.moderate },
    { name: 'High', value: data.high },
    { name: 'Very High', value: data.veryHigh },
  ];
  const elevated = data.high + data.veryHigh;

  return (
    <ChartCard
      title="Oxidative stress"
      subtitle={`${data.department} · severity distribution`}
      info={CHART_INFO.deptOxidativePie}
      insight={
        <InsightFooter
          tone={elevated > 20 ? 'concern' : 'neutral'}
          text={`${elevated}% of this department fall in High or Very High oxidative stress bands.`}
        />
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={96}
            paddingAngle={2}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={SLICE_COLORS[entry.name as keyof typeof SLICE_COLORS]}
              />
            ))}
          </Pie>
          <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
          <Legend wrapperStyle={chart.legendStyle} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
