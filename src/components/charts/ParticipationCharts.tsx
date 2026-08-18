import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { Info, Lightbulb } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import type { YearOption } from '../layout/DashboardHeader';
import type { ParticipationByAge } from '../../types';
import { PieHoverTooltip } from './PieHoverTooltip';
import './ParticipationCharts.css';

const AGE_COLORS = ['#3B82F6', '#34D399', '#8A61F7', '#FB923C', '#F87171'];
const PLACEHOLDER_YEARS = [2024, 2025, 2026] as const;
const EMPTY = '-';

interface ParticipationChartsProps {
  byAge: ParticipationByAge[];
  loading?: boolean;
  selectedYear?: YearOption;
}

function AgePie({
  data,
  assessed,
  size = 'lg',
  centerLabel = 'Enrolled',
}: {
  data: { name: string; value: number; enrolled: number; color: string }[];
  assessed: number | string;
  size?: 'lg' | 'sm';
  centerLabel?: string;
}) {
  const top =
    data.length > 0
      ? data.reduce((best, row) => (row.value > best.value ? row : best), data[0])
      : null;
  const dim = size === 'sm' ? 128 : 224;
  const inner = size === 'sm' ? 46 : 62;
  const outer = size === 'sm' ? 58 : 92;
  const chartData =
    data.length > 0 ? data : [{ name: 'empty', value: 1, enrolled: 0, color: 'rgba(255,255,255,0.08)' }];

  return (
    <div
      className={`participation-age-pie__chart participation-age-pie__chart--${size}`}
      style={{ width: dim, height: dim }}
    >
      <PieChart width={dim} height={dim} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={inner}
          outerRadius={outer}
          paddingAngle={data.length > 1 ? 3.5 : 0}
          cornerRadius={size === 'sm' ? 5 : 7}
          stroke="none"
        >
          {chartData.map((entry) => {
            const isLead = top != null && entry.name === top.name;
            return (
              <Cell
                key={entry.name}
                fill={entry.color}
                stroke={isLead ? 'rgba(255,255,255,0.18)' : 'none'}
                strokeWidth={isLead ? 1 : 0}
                style={
                  isLead
                    ? {
                        filter: 'drop-shadow(0px -2px 8px rgba(153, 162, 249, 0.22))',
                      }
                    : undefined
                }
              />
            );
          })}
        </Pie>
        {data.length > 0 && (
          <Tooltip content={<PieHoverTooltip />} wrapperStyle={{ zIndex: 20, outline: 'none' }} />
        )}
      </PieChart>
      <div className="participation-age-pie__center" aria-hidden>
        <span className="participation-age-pie__center-value">{assessed}</span>
        <span className="participation-age-pie__center-label">{centerLabel}</span>
      </div>
    </div>
  );
}

function AllYearsParticipation() {
  return (
    <>
      <div className="participation-age-card__allyears">
        <div className="participation-age-card__allyears-pies">
          {PLACEHOLDER_YEARS.map((year) => (
            <div key={year} className="participation-age-card__allyears-col">
              <span className="participation-age-card__allyears-year">{year}</span>
              <AgePie data={[]} assessed={EMPTY} size="sm" centerLabel="Assessed" />
            </div>
          ))}
        </div>
      </div>

      <footer className="participation-age-card__insight">
        <div className="participation-age-card__insight-label">
          <Lightbulb size={20} aria-hidden />
          <span>Insight</span>
        </div>
        <p className="participation-age-card__insight-text">{EMPTY}</p>
      </footer>
    </>
  );
}

function SingleYearParticipation({
  byAge,
  loading,
}: {
  byAge: ParticipationByAge[];
  loading: boolean;
}) {
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
    <>
      <div className="participation-age-card__body">
        <AgePie
          data={chartData}
          assessed={loading ? '…' : byAge.length > 0 ? totalEnrolled.toLocaleString() : EMPTY}
          size="lg"
          centerLabel="Enrolled"
        />

        <ul className="participation-age-pie__legend">
          {loading && byAge.length === 0 && (
            <li className="participation-age-pie__empty">Loading…</li>
          )}
          {!loading && byAge.length === 0 && (
            <li className="participation-age-pie__empty">{EMPTY}</li>
          )}
          {byAge.map((row, i) => (
            <li key={row.ageGroup} className="participation-age-pie__row">
              <span className="participation-age-pie__row-left">
                <span
                  className="participation-age-pie__dot"
                  style={{ backgroundColor: AGE_COLORS[i % AGE_COLORS.length] }}
                />
                <span className="participation-age-pie__label">{row.ageGroup}</span>
              </span>
              <span className="participation-age-pie__stat">
                {row.percent}% · {row.enrolled.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {topCohort && (
        <footer className="participation-age-card__insight">
          <div className="participation-age-card__insight-label">
            <Lightbulb size={20} aria-hidden />
            <span>Insight</span>
          </div>
          <p className="participation-age-card__insight-text">
            {`${topCohort.ageGroup} is the largest cohort at ${topCohort.percent}% (${topCohort.enrolled.toLocaleString()} employees) — tailor camp messaging and scheduling for under-represented age bands.`}
          </p>
        </footer>
      )}
    </>
  );
}

export function ParticipationCharts({
  byAge,
  loading = false,
  selectedYear = '2026',
}: ParticipationChartsProps) {
  return (
    <article className="participation-age-card">
      <header className="participation-age-card__header">
        <div className="participation-age-card__title-row">
          <h3 className="participation-age-card__title">Age-wise participation</h3>
          <span className="participation-age-card__info" tabIndex={0}>
            <Info size={16} aria-hidden />
            <span className="participation-age-card__info-popup" role="tooltip">
              {CHART_INFO.participationByAge}
            </span>
          </span>
        </div>
        <p className="participation-age-card__subtitle">Employees enrolled by age group</p>
      </header>

      {selectedYear === 'all' ? (
        <AllYearsParticipation />
      ) : (
        <SingleYearParticipation byAge={byAge} loading={loading} />
      )}
    </article>
  );
}
