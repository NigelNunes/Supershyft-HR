import type { ReactNode } from 'react';
import { Droplets, FileText, Stethoscope, Users } from 'lucide-react';
import { DUMMY_ALL_YEARS_METRICS, DUMMY_EXECUTIVE_RANKING } from '../../data/dummyAllYearsMetrics';
import { highlightIndexForRank } from '../../utils/rankSparkline';
import type { YearOption } from '../layout/DashboardHeader';
import type { KpiSummary, RankingSummary } from '../../types';
import './DashboardMetricCards.css';

interface DashboardMetricCardsProps {
  kpis: KpiSummary | null;
  ranking: RankingSummary | null;
  kpisLoading?: boolean;
  rankingLoading?: boolean;
  selectedYear?: YearOption;
  /** When false, hides National / Industry rank cards (department view). */
  showRanking?: boolean;
}

function displayNumber(value: number | undefined | null, loading: boolean): string {
  if (loading) return '…';
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString();
}

function displayPercentOfEnrolled(
  count: number | undefined | null,
  enrolled: number | undefined | null,
  explicitPercent: number | undefined | null,
  loading: boolean,
): string {
  if (loading) return '…';
  if (explicitPercent != null) return `${Math.round(explicitPercent)}% of enrolled`;
  if (count == null || enrolled == null || enrolled <= 0) return '—';
  return `${Math.round((count / enrolled) * 100)}% of enrolled`;
}

/** Figma rank sparkline — bar heights (px) left→right. */
const RANK_SPARK_BARS: { left: number; height: number }[] = [
  { left: 1.78, height: 0.2 },
  { left: 4.46, height: 0.39 },
  { left: 7.14, height: 0.59 },
  { left: 9.82, height: 1.18 },
  { left: 12.5, height: 2 },
  { left: 15.17, height: 3.35 },
  { left: 17.85, height: 4 },
  { left: 20.53, height: 4.92 },
  { left: 23.21, height: 6 },
  { left: 25.89, height: 6 },
  { left: 28.56, height: 6 },
  { left: 31.24, height: 8 },
  { left: 33.93, height: 8 },
  { left: 36.6, height: 10 },
  { left: 39.28, height: 12 },
  { left: 41.95, height: 12 },
  { left: 44.63, height: 12 },
  { left: 47.32, height: 14 },
  { left: 49.99, height: 14 },
  { left: 52.66, height: 16 },
  { left: 55.35, height: 16 },
  { left: 58.03, height: 20 },
  { left: 60.71, height: 20 },
  { left: 63.38, height: 24 },
  { left: 66.05, height: 24 },
  { left: 68.74, height: 28 },
  { left: 71.42, height: 28 },
  { left: 74.09, height: 32 },
  { left: 76.77, height: 32 },
  { left: 79.45, height: 36 },
  { left: 82.14, height: 40 },
  { left: 84.81, height: 44 },
  { left: 87.48, height: 48 },
  { left: 90.16, height: 56 },
  { left: 92.84, height: 56 },
  { left: 95.53, height: 56 },
];

function RankSparkline({
  variant,
  highlightIndex,
}: {
  variant: 'green' | 'blue';
  highlightIndex: number;
}) {
  return (
    <div className={`metric-rank-spark metric-rank-spark--${variant}`} aria-hidden>
      {RANK_SPARK_BARS.map((bar, i) => (
        <span
          key={bar.left}
          className={`metric-rank-spark__bar${i === highlightIndex ? ' metric-rank-spark__bar--active' : ''}`}
          style={{
            left: `${bar.left}px`,
            height: `${Math.max(bar.height, 0.5)}px`,
          }}
        />
      ))}
    </div>
  );
}

type TrendTone = 'green' | 'blue' | 'purple' | 'red' | 'lime' | 'amber';

const TREND_COLORS: Record<TrendTone, string> = {
  green: '#05FF54',
  blue: '#4C7DFF',
  purple: '#A555F6',
  red: '#DE4A4A',
  lime: '#E5FF64',
  amber: '#FF8800',
};

/** 3-point sparkline for All Years cards. Lower values plot higher for ranks. */
function YearTrendSparkline({
  values,
  tone,
  invert = false,
}: {
  values: readonly number[];
  tone: TrendTone;
  invert?: boolean;
}) {
  const color = TREND_COLORS[tone];
  const w = 128;
  const h = 40;
  const padX = 10;
  const padY = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);

  const points = values.map((value, i) => {
    const x = padX + (i * (w - padX * 2)) / Math.max(values.length - 1, 1);
    const norm = invert ? (max - value) / span : (value - min) / span;
    const y = padY + (1 - norm) * (h - padY * 2);
    return { x, y };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(' ');
  const last = points[points.length - 1];

  return (
    <svg className="metric-year-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        return (
          <g key={i}>
            {isLast && (
              <circle cx={p.x} cy={p.y} r="7" fill={color} opacity="0.2" />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={isLast ? 5 : 3}
              fill={color}
            />
          </g>
        );
      })}
      {last && <circle cx={last.x} cy={last.y} r="5" fill={color} />}
    </svg>
  );
}

function AllYearsMetricCard({
  title,
  values,
  years,
  tone,
  invert,
  prefix = '',
  icon,
  glass,
}: {
  title: string;
  values: readonly number[];
  years: readonly number[];
  tone: TrendTone;
  invert?: boolean;
  prefix?: string;
  icon?: ReactNode;
  glass?: boolean;
}) {
  return (
    <article
      className={`metric-card metric-card--allyears${glass ? ' metric-card--glass' : ''}`}
    >
      <div className="metric-card__allyears-header">
        <h3 className="metric-card__allyears-title">{title}</h3>
        {icon}
      </div>
      <div className="metric-card__allyears-chart">
        <YearTrendSparkline values={values} tone={tone} invert={invert} />
        <div className="metric-card__allyears-years">
          {years.map((year, i) => (
            <div key={year} className="metric-card__allyears-col">
              <span
                className={`metric-card__allyears-value${i === 0 ? ' metric-card__allyears-value--muted' : ''}`}
              >
                {prefix}
                {values[i].toLocaleString()}
              </span>
              <span className="metric-card__allyears-year">{year}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function AllYearsMetricCards({ showRanking }: { showRanking: boolean }) {
  // TEMPORARY: DUMMY_ALL_YEARS_METRICS — remove when multi-year API exists
  const d = DUMMY_ALL_YEARS_METRICS;

  return (
    <div className={`metric-cards metric-cards--allyears${showRanking ? '' : ' metric-cards--no-rank'}`}>
      {showRanking && (
        <>
          <AllYearsMetricCard
            title="National Rank"
            values={d.nationalRank}
            years={d.years}
            tone="green"
            invert
            prefix="#"
          />
          <AllYearsMetricCard
            title="Industry Rank"
            values={d.industryRank}
            years={d.years}
            tone="blue"
            invert
            prefix="#"
          />
        </>
      )}
      <AllYearsMetricCard
        title="Employees"
        values={d.employees}
        years={d.years}
        tone="purple"
        icon={
          <div className="metric-card__icon metric-card__icon--employees" aria-hidden>
            <Users size={20} strokeWidth={1.75} />
          </div>
        }
      />
      <AllYearsMetricCard
        title="Blood Tests"
        values={d.bloodTests}
        years={d.years}
        tone="red"
        glass
        icon={
          <div className="metric-card__icon metric-card__icon--blood" aria-hidden>
            <Droplets size={20} strokeWidth={1.75} />
          </div>
        }
      />
      <AllYearsMetricCard
        title="Bio-AI Reports"
        values={d.bioAiReports}
        years={d.years}
        tone="lime"
        glass
        icon={
          <div className="metric-card__icon metric-card__icon--bio" aria-hidden>
            <FileText size={20} strokeWidth={1.75} />
          </div>
        }
      />
      <AllYearsMetricCard
        title="Consultations"
        values={d.consultations}
        years={d.years}
        tone="amber"
        glass
        icon={
          <div className="metric-card__icon metric-card__icon--consult" aria-hidden>
            <Stethoscope size={20} strokeWidth={1.75} />
          </div>
        }
      />
    </div>
  );
}

function SingleYearMetricCards({
  kpis,
  ranking,
  kpisLoading,
  rankingLoading,
  showRanking,
}: {
  kpis: KpiSummary | null;
  ranking: RankingSummary | null;
  kpisLoading: boolean;
  rankingLoading: boolean;
  showRanking: boolean;
}) {
  const nationalRank = ranking?.cityRank;
  const industryRank = ranking?.industryRank;
  const d = DUMMY_EXECUTIVE_RANKING;

  const nationalHighlight =
    nationalRank == null || rankingLoading
      ? -1
      : highlightIndexForRank(nationalRank, d.nationalAmong, RANK_SPARK_BARS.length);
  const industryHighlight =
    industryRank == null || rankingLoading
      ? -1
      : highlightIndexForRank(industryRank, d.industryAmong, RANK_SPARK_BARS.length);

  return (
    <div className={`metric-cards${showRanking ? '' : ' metric-cards--no-rank'}`}>
      {showRanking && (
        <>
          <article className="metric-card metric-card--rank metric-card--national">
            <div className="metric-card__rank-row">
              <div className="metric-card__rank-text">
                <h3 className="metric-card__rank-title">National Rank</h3>
                <p className="metric-card__rank-value metric-card__rank-value--green">
                  <span className="metric-card__hash">#</span>
                  <span>{displayNumber(nationalRank, rankingLoading)}</span>
                </p>
              </div>
              <RankSparkline variant="green" highlightIndex={nationalHighlight} />
            </div>
            <p className="metric-card__rank-footer">{d.nationalAmongLabel}</p>
          </article>

          <article className="metric-card metric-card--rank metric-card--industry">
            <div className="metric-card__rank-row">
              <div className="metric-card__rank-text">
                <h3 className="metric-card__rank-title">Industry Rank</h3>
                <p className="metric-card__rank-value metric-card__rank-value--blue">
                  <span className="metric-card__hash">#</span>
                  <span>{displayNumber(industryRank, rankingLoading)}</span>
                </p>
              </div>
              <RankSparkline variant="blue" highlightIndex={industryHighlight} />
            </div>
            <p className="metric-card__rank-footer">{d.industryAmongLabel}</p>
          </article>
        </>
      )}

      <article className="metric-card metric-card--stat">
        <div className="metric-card__stat-body">
          <h3 className="metric-card__stat-label">Employees</h3>
          <p className="metric-card__stat-value">
            {displayNumber(kpis?.employeesEnrolled, kpisLoading)}
          </p>
          <div className="metric-card__gender">
            <span className="metric-card__gender-item">
              <span className="metric-card__gender-symbol metric-card__gender-symbol--female" aria-hidden>
                ♀
              </span>
              <span>{displayNumber(kpis?.femaleEnrolled, kpisLoading)}</span>
            </span>
            <span className="metric-card__gender-item">
              <span className="metric-card__gender-symbol metric-card__gender-symbol--male" aria-hidden>
                ♂
              </span>
              <span>{displayNumber(kpis?.maleEnrolled, kpisLoading)}</span>
            </span>
          </div>
        </div>
        <div className="metric-card__icon metric-card__icon--employees" aria-hidden>
          <Users size={20} strokeWidth={1.75} />
        </div>
      </article>

      <article className="metric-card metric-card--stat metric-card--glass">
        <div className="metric-card__stat-body">
          <h3 className="metric-card__stat-label">Blood Test</h3>
          <p className="metric-card__stat-value">
            {displayNumber(kpis?.totalBloodTest, kpisLoading)}
          </p>
          <p className="metric-card__stat-footer">
            {displayPercentOfEnrolled(
              kpis?.totalBloodTest,
              kpis?.employeesEnrolled,
              kpis?.bloodTestPercent,
              kpisLoading,
            )}
          </p>
        </div>
        <div className="metric-card__icon metric-card__icon--blood" aria-hidden>
          <Droplets size={20} strokeWidth={1.75} />
        </div>
      </article>

      <article className="metric-card metric-card--stat metric-card--glass">
        <div className="metric-card__stat-body">
          <h3 className="metric-card__stat-label">Bio-AI Reports</h3>
          <p className="metric-card__stat-value">
            {displayNumber(kpis?.totalBioAiReports, kpisLoading)}
          </p>
          <p className="metric-card__stat-footer">
            {displayPercentOfEnrolled(
              kpis?.totalBioAiReports,
              kpis?.employeesEnrolled,
              kpis?.bioAiPercent,
              kpisLoading,
            )}
          </p>
        </div>
        <div className="metric-card__icon metric-card__icon--bio" aria-hidden>
          <FileText size={20} strokeWidth={1.75} />
        </div>
      </article>

      <article className="metric-card metric-card--stat metric-card--glass">
        <div className="metric-card__stat-body">
          <h3 className="metric-card__stat-label">Consultations</h3>
          <p className="metric-card__stat-value">
            {kpisLoading
              ? '…'
              : kpis == null
                ? '—'
                : `${displayNumber(kpis.doctorConsultation, false)}/${displayNumber(kpis.nutritionistConsultation, false)}`}
          </p>
          <p className="metric-card__stat-footer">Doctor / Nutritionist</p>
        </div>
        <div className="metric-card__icon metric-card__icon--consult" aria-hidden>
          <Stethoscope size={20} strokeWidth={1.75} />
        </div>
      </article>
    </div>
  );
}

export function DashboardMetricCards({
  kpis,
  ranking,
  kpisLoading = false,
  rankingLoading = false,
  selectedYear = '2026',
  showRanking = true,
}: DashboardMetricCardsProps) {
  if (selectedYear === 'all') {
    return <AllYearsMetricCards showRanking={showRanking} />;
  }

  return (
    <SingleYearMetricCards
      kpis={kpis}
      ranking={ranking}
      kpisLoading={kpisLoading}
      rankingLoading={rankingLoading}
      showRanking={showRanking}
    />
  );
}
