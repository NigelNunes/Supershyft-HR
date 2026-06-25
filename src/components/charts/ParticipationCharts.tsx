import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_INFO } from '../../content/chartInfo';
import type { ParticipationByAge } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { useChartTheme } from './chartTheme';
import './ParticipationCharts.css';

const AGE_COLORS = ['#378ADD', '#5DCAA5', '#7F77DD', '#EF9F27', '#E24B4A'];

interface ParticipationChartsProps {
  byAge: ParticipationByAge[];
  loading?: boolean;
}

export function ParticipationCharts({ byAge, loading = false }: ParticipationChartsProps) {
  const chart = useChartTheme();
  const chartData = byAge.map((row, i) => ({
    name: row.ageGroup,
    value: row.percent,
    enrolled: row.enrolled,
    color: AGE_COLORS[i % AGE_COLORS.length],
  }));
  const totalEnrolled = byAge.reduce((sum, row) => sum + row.enrolled, 0);
  const topCohort =
    byAge.length > 0
      ? byAge.reduce((best, row) => (row.percent > best.percent ? row : best))
      : null;

  return (
    <ChartCard
      className="participation-age-card"
      title="Age-wise participation"
      subtitle="Employees enrolled by age group"
      info={CHART_INFO.participationByAge}
      insight={
        topCohort ? (
          <InsightFooter
            tone="neutral"
            text={`${topCohort.ageGroup} is the largest cohort at ${topCohort.percent}% (${topCohort.enrolled.toLocaleString()} employees) — tailor camp messaging and scheduling for under-represented age bands.`}
          />
        ) : undefined
      }
    >
      <div className="participation-age-pie">
        <div className="participation-age-pie__chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                {...chart.tooltipProps}
                formatter={(value, _name, item) => {
                  const enrolled = (item?.payload as { enrolled?: number })?.enrolled ?? 0;
                  const v = typeof value === 'number' ? value : Number(value);
                  return [`${v}% (${enrolled.toLocaleString()} employees)`, 'Share'];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="participation-age-pie__center" aria-hidden>
            <span className="participation-age-pie__center-value">
              {loading ? '…' : byAge.length > 0 ? totalEnrolled.toLocaleString() : '—'}
            </span>
            <span className="participation-age-pie__center-label">enrolled</span>
          </div>
        </div>
        <ul className="participation-age-pie__breakdown">
          {byAge.map((row, i) => (
            <li
              key={row.ageGroup}
              className={
                topCohort?.ageGroup === row.ageGroup
                  ? 'participation-age-pie__row participation-age-pie__row--lead'
                  : 'participation-age-pie__row'
              }
            >
              <span
                className="participation-age-pie__dot"
                style={{ backgroundColor: AGE_COLORS[i % AGE_COLORS.length] }}
              />
              <span className="participation-age-pie__label">{row.ageGroup}</span>
              <span className="participation-age-pie__stat">
                {row.percent}% · {row.enrolled.toLocaleString()}
              </span>
            </li>
          ))}
          <li className="participation-age-pie__total">
            <span>
              {loading
                ? 'Loading…'
                : byAge.length > 0
                  ? `${totalEnrolled.toLocaleString()} employees enrolled`
                  : 'No data available'}
            </span>
          </li>
        </ul>
      </div>
    </ChartCard>
  );
}
