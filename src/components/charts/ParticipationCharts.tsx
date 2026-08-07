import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { Info, Lightbulb } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import {
  DUMMY_AGE_BANDS,
  DUMMY_ALL_YEARS_AGE_INSIGHT,
  DUMMY_ALL_YEARS_AGE_PARTICIPATION,
} from '../../data/dummyAllYearsMetrics';
import type { YearOption } from '../layout/DashboardHeader';
import type { ParticipationByAge } from '../../types';
import { AllYearsRiskHoverTooltip } from './AllYearsRiskHoverTooltip';
import { PieHoverTooltip } from './PieHoverTooltip';
import './ParticipationCharts.css';

const AGE_COLORS = ['#3B82F6', '#34D399', '#8A61F7', '#FB923C', '#F87171'];

const AGE_ACCENT_COLORS: Record<string, string> = Object.fromEntries(
  DUMMY_AGE_BANDS.map((band, i) => [band, AGE_COLORS[i % AGE_COLORS.length]]),
);

const ALL_YEARS_AGE_BLOCKS = DUMMY_ALL_YEARS_AGE_PARTICIPATION.map((yearBlock) => ({
  year: yearBlock.year,
  bands: yearBlock.bands.map((row) => ({
    band: row.ageGroup,
    count: row.enrolled,
  })),
}));

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
  allYearsHover,
}: {
  data: { name: string; value: number; enrolled: number; color: string }[];
  assessed: number | string;
  size?: 'lg' | 'sm';
  centerLabel?: string;
  allYearsHover?: {
    yearBlocks: typeof ALL_YEARS_AGE_BLOCKS;
    activeYear: number;
    accentColors: Record<string, string>;
  };
}) {
  const top =
    data.length > 0
      ? data.reduce((best, row) => (row.value > best.value ? row : best), data[0])
      : null;
  const dim = size === 'sm' ? 128 : 224;
  const inner = size === 'sm' ? 46 : 62;
  const outer = size === 'sm' ? 58 : 92;

  const tooltip = allYearsHover ? (
    <Tooltip
      content={
        <AllYearsRiskHoverTooltip
          yearBlocks={allYearsHover.yearBlocks}
          activeYear={allYearsHover.activeYear}
          accentColors={allYearsHover.accentColors}
        />
      }
      wrapperStyle={{ zIndex: 30, outline: 'none' }}
      allowEscapeViewBox={{ x: true, y: true }}
      offset={12}
    />
  ) : (
    <Tooltip content={<PieHoverTooltip />} wrapperStyle={{ zIndex: 20, outline: 'none' }} />
  );

  return (
    <div
      className={`participation-age-pie__chart participation-age-pie__chart--${size}`}
      style={{ width: dim, height: dim }}
    >
      <PieChart width={dim} height={dim} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={inner}
          outerRadius={outer}
          paddingAngle={3.5}
          cornerRadius={size === 'sm' ? 5 : 7}
          stroke="none"
        >
          {data.map((entry) => {
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
        {data.length > 0 && tooltip}
      </PieChart>
      <div className="participation-age-pie__center" aria-hidden>
        <span className="participation-age-pie__center-value">{assessed}</span>
        <span className="participation-age-pie__center-label">{centerLabel}</span>
      </div>
    </div>
  );
}

function AllYearsParticipation() {
  // TEMPORARY: DUMMY_ALL_YEARS_AGE_* — remove when multi-year API exists
  return (
    <>
      <div className="participation-age-card__allyears">
        <div className="participation-age-card__allyears-pies">
          {DUMMY_ALL_YEARS_AGE_PARTICIPATION.map((yearBlock) => {
            const chartData = yearBlock.bands.map((row, i) => ({
              name: row.ageGroup,
              value: row.percent,
              enrolled: row.enrolled,
              color: AGE_COLORS[i % AGE_COLORS.length],
            }));
            return (
              <div key={yearBlock.year} className="participation-age-card__allyears-col">
                <span className="participation-age-card__allyears-year">{yearBlock.year}</span>
                <AgePie
                  data={chartData}
                  assessed={yearBlock.assessed.toLocaleString()}
                  size="sm"
                  centerLabel="Assessed"
                  allYearsHover={{
                    yearBlocks: ALL_YEARS_AGE_BLOCKS,
                    activeYear: yearBlock.year,
                    accentColors: AGE_ACCENT_COLORS,
                  }}
                />
              </div>
            );
          })}
        </div>

        <ul className="participation-age-pie__legend participation-age-pie__legend--horizontal">
          {DUMMY_AGE_BANDS.map((band, i) => (
            <li key={band} className="participation-age-pie__legend-item">
              <span
                className="participation-age-pie__dot"
                style={{ backgroundColor: AGE_COLORS[i % AGE_COLORS.length] }}
              />
              <span className="participation-age-pie__label">{band}</span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="participation-age-card__insight">
        <div className="participation-age-card__insight-label">
          <Lightbulb size={20} aria-hidden />
          <span>Insight</span>
        </div>
        <p className="participation-age-card__insight-text">{DUMMY_ALL_YEARS_AGE_INSIGHT}</p>
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
          assessed={loading ? '…' : byAge.length > 0 ? totalEnrolled.toLocaleString() : '—'}
          size="lg"
          centerLabel="Enrolled"
        />

        <ul className="participation-age-pie__legend">
          {loading && byAge.length === 0 && (
            <li className="participation-age-pie__empty">Loading…</li>
          )}
          {!loading && byAge.length === 0 && (
            <li className="participation-age-pie__empty">No data available</li>
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
