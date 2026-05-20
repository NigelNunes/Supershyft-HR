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
import type { ParticipationByAge, ParticipationByGender } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { useChartTheme } from './chartTheme';

interface ParticipationChartsProps {
  byAge: ParticipationByAge[];
  byGender: ParticipationByGender[];
}

export function ParticipationCharts({ byAge, byGender }: ParticipationChartsProps) {
  const chart = useChartTheme();

  return (
    <div className="grid-2">
      <ChartCard
        title="Age-wise participation"
        subtitle="Employees enrolled by age group"
        info={CHART_INFO.participationByAge}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byAge} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
            <XAxis dataKey="ageGroup" tick={chart.tick(11)} />
            <YAxis tick={chart.tick(11)} />
            <Tooltip
              {...chart.tooltipProps}
              formatter={(value) => [`${value} employees`, 'Enrolled']}
            />
            <Bar dataKey="enrolled" name="enrolled" fill={chart.colors.accent} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Gender-wise participation"
        subtitle="Employees enrolled by gender"
        info={CHART_INFO.participationByGender}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byGender} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
            <XAxis dataKey="gender" tick={chart.tick(12)} />
            <YAxis tick={chart.tick(11)} />
            <Tooltip
              {...chart.tooltipProps}
              formatter={(value) => [`${value} employees`, 'Enrolled']}
            />
            <Bar dataKey="enrolled" name="enrolled" radius={[4, 4, 0, 0]} maxBarSize={72}>
              {byGender.map((row) => (
                <Cell
                  key={row.gender}
                  fill={row.gender === 'Male' ? 'var(--chart-male)' : 'var(--chart-female)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
