import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_INFO } from '../../content/chartInfo';
import type { DepartmentLifestyleDistribution } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { useChartTheme } from './chartTheme';
import { pctTooltip } from './tooltipFormat';

interface DeptLifestylePieChartsProps {
  data: DepartmentLifestyleDistribution;
  departmentName: string;
}

const PHYSICAL_COLORS = ['#E24B4A', '#EF9F27', '#1D9E75', '#7F77DD'];
const SLEEP_COLORS = ['#E24B4A', '#EF9F27', '#5DCAA5', '#378ADD'];

function LifestylePie({
  title,
  subtitle,
  info,
  slices,
  colors,
}: {
  title: string;
  subtitle: string;
  info: string;
  slices: { label: string; percent: number }[];
  colors: string[];
}) {
  const chart = useChartTheme();
  const chartData = slices.map((d) => ({ name: d.label, value: d.percent }));

  return (
    <ChartCard title={title} subtitle={subtitle} info={info}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={88}
            paddingAngle={2}
          >
            {chartData.map((entry, i) => (
              <Cell key={entry.name} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
          <Legend wrapperStyle={chart.legendStyle} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DeptLifestylePieCharts({ data, departmentName }: DeptLifestylePieChartsProps) {
  return (
    <div className="grid-2">
      <LifestylePie
        title="Physical activity"
        subtitle={`${departmentName} · activity level distribution`}
        info={CHART_INFO.deptPhysicalPie}
        slices={data.physical}
        colors={PHYSICAL_COLORS}
      />
      <LifestylePie
        title="Sleep"
        subtitle={`${departmentName} · hours of sleep per night`}
        info={CHART_INFO.deptSleepPie}
        slices={data.sleep}
        colors={SLEEP_COLORS}
      />
    </div>
  );
}
