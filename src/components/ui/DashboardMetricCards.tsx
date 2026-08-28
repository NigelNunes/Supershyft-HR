import type { ReactNode } from 'react';
import { Droplets, FileText, Stethoscope, Users } from 'lucide-react';
import { ComingSoonPanel } from './ComingSoonPanel';
import { highlightIndexForRank, uniformAscendingHeights } from '../../utils/rankSparkline';
import {
  hasKpiSectionData,
  hasRankingSectionData,
  shouldShowComingSoon,
} from '../../utils/comingSoon';
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

const EMPTY = '-';
const PLACEHOLDER_YEARS = [2024, 2025, 2026] as const;

function displayNumber(value: number | undefined | null, loading: boolean): string {
  if (loading) return '…';
  if (value == null || Number.isNaN(value)) return EMPTY;
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
  if (count == null || enrolled == null || enrolled <= 0) return EMPTY;
  return `${Math.round((count / enrolled) * 100)}% of enrolled`;
}

const RANK_SPARK_BAR_COUNT = 36;
const RANK_SPARK_HEIGHTS = uniformAscendingHeights(RANK_SPARK_BAR_COUNT, 4, 100);

function RankSparkline({
  variant,
  highlightIndex,
}: {
  variant: 'green' | 'blue';
  highlightIndex: number;
}) {
  return (
    <div className={`metric-rank-spark metric-rank-spark--${variant}`} aria-hidden>
      {RANK_SPARK_HEIGHTS.map((height, i) => (
        <span
          key={i}
          className={`metric-rank-spark__bar${i === highlightIndex ? ' metric-rank-spark__bar--active' : ''}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function AllYearsMetricCard({
  title,
  prefix = '',
  icon,
  glass,
}: {
  title: string;
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
        <div className="metric-card__allyears-years">
          {PLACEHOLDER_YEARS.map((year) => (
            <div key={year} className="metric-card__allyears-col">
              <span className="metric-card__allyears-value metric-card__allyears-value--muted">
                {prefix}
                {EMPTY}
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
  return (
    <div className={`metric-cards metric-cards--allyears${showRanking ? '' : ' metric-cards--no-rank'}`}>
      {showRanking && (
        <>
          <AllYearsMetricCard title="National Rank" prefix="#" />
          <AllYearsMetricCard title="Industry Rank" prefix="#" />
        </>
      )}
      <AllYearsMetricCard
        title="Employees"
        icon={
          <div className="metric-card__icon metric-card__icon--employees" aria-hidden>
            <Users size={20} strokeWidth={1.75} />
          </div>
        }
      />
      <AllYearsMetricCard
        title="Blood Tests"
        glass
        icon={
          <div className="metric-card__icon metric-card__icon--blood" aria-hidden>
            <Droplets size={20} strokeWidth={1.75} />
          </div>
        }
      />
      <AllYearsMetricCard
        title="Bio-AI Reports"
        glass
        icon={
          <div className="metric-card__icon metric-card__icon--bio" aria-hidden>
            <FileText size={20} strokeWidth={1.75} />
          </div>
        }
      />
      <AllYearsMetricCard
        title="Consultations"
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
  selectedYear,
}: {
  kpis: KpiSummary | null;
  ranking: RankingSummary | null;
  kpisLoading: boolean;
  rankingLoading: boolean;
  showRanking: boolean;
  selectedYear: YearOption;
}) {
  const comingSoonKpis = shouldShowComingSoon(selectedYear, kpisLoading, hasKpiSectionData(kpis));
  const comingSoonRank = shouldShowComingSoon(
    selectedYear,
    rankingLoading,
    hasRankingSectionData(ranking),
  );
  const nationalRank = ranking?.cityRank;
  const industryRank = ranking?.industryRank;

  const nationalHighlight =
    nationalRank == null || rankingLoading
      ? -1
      : highlightIndexForRank(nationalRank, 38, RANK_SPARK_BAR_COUNT);
  const industryHighlight =
    industryRank == null || rankingLoading
      ? -1
      : highlightIndexForRank(industryRank, 12, RANK_SPARK_BAR_COUNT);

  const nationalFooter =
    rankingLoading || nationalRank == null
      ? EMPTY
      : ranking?.city
        ? `Among companies in ${ranking.city}`
        : EMPTY;
  const industryFooter =
    rankingLoading || industryRank == null ? EMPTY : 'Among companies in industry';

  return (
    <div className={`metric-cards${showRanking ? '' : ' metric-cards--no-rank'}`}>
      {showRanking && (
        <>
          <article className="metric-card metric-card--rank metric-card--national">
            <div className="metric-card__rank-row">
              <div className="metric-card__rank-text">
                <h3 className="metric-card__rank-title">National Rank</h3>
                {comingSoonRank ? (
                  <ComingSoonPanel variant="metric" />
                ) : (
                  <p className="metric-card__rank-value metric-card__rank-value--green">
                    <span className="metric-card__hash">#</span>
                    <span>{displayNumber(nationalRank, rankingLoading)}</span>
                  </p>
                )}
              </div>
              {!comingSoonRank && (
                <RankSparkline variant="green" highlightIndex={nationalHighlight} />
              )}
            </div>
            {!comingSoonRank && <p className="metric-card__rank-footer">{nationalFooter}</p>}
          </article>

          <article className="metric-card metric-card--rank metric-card--industry">
            <div className="metric-card__rank-row">
              <div className="metric-card__rank-text">
                <h3 className="metric-card__rank-title">Industry Rank</h3>
                {comingSoonRank ? (
                  <ComingSoonPanel variant="metric" />
                ) : (
                  <p className="metric-card__rank-value metric-card__rank-value--blue">
                    <span className="metric-card__hash">#</span>
                    <span>{displayNumber(industryRank, rankingLoading)}</span>
                  </p>
                )}
              </div>
              {!comingSoonRank && (
                <RankSparkline variant="blue" highlightIndex={industryHighlight} />
              )}
            </div>
            {!comingSoonRank && <p className="metric-card__rank-footer">{industryFooter}</p>}
          </article>
        </>
      )}

      <article className="metric-card metric-card--stat">
        <div className="metric-card__stat-body">
          <h3 className="metric-card__stat-label">Employees</h3>
          {comingSoonKpis ? (
            <ComingSoonPanel variant="metric" />
          ) : (
            <>
              <p className="metric-card__stat-value">
                {displayNumber(kpis?.employeesEnrolled, kpisLoading)}
              </p>
              <div className="metric-card__gender">
                <span className="metric-card__gender-item">
                  <span className="metric-card__gender-symbol metric-card__gender-symbol--male" aria-hidden>
                    ♂
                  </span>
                  <span>{displayNumber(kpis?.maleEnrolled, kpisLoading)}</span>
                </span>
                <span className="metric-card__gender-item">
                  <span className="metric-card__gender-symbol metric-card__gender-symbol--female" aria-hidden>
                    ♀
                  </span>
                  <span>{displayNumber(kpis?.femaleEnrolled, kpisLoading)}</span>
                </span>
              </div>
            </>
          )}
        </div>
        <div className="metric-card__icon metric-card__icon--employees" aria-hidden>
          <Users size={20} strokeWidth={1.75} />
        </div>
      </article>

      <article className="metric-card metric-card--stat metric-card--glass">
        <div className="metric-card__stat-body">
          <h3 className="metric-card__stat-label">Blood Test</h3>
          {comingSoonKpis ? (
            <ComingSoonPanel variant="metric" />
          ) : (
            <>
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
            </>
          )}
        </div>
        <div className="metric-card__icon metric-card__icon--blood" aria-hidden>
          <Droplets size={20} strokeWidth={1.75} />
        </div>
      </article>

      <article className="metric-card metric-card--stat metric-card--glass">
        <div className="metric-card__stat-body">
          <h3 className="metric-card__stat-label">Bio-AI Reports</h3>
          {comingSoonKpis ? (
            <ComingSoonPanel variant="metric" />
          ) : (
            <>
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
            </>
          )}
        </div>
        <div className="metric-card__icon metric-card__icon--bio" aria-hidden>
          <FileText size={20} strokeWidth={1.75} />
        </div>
      </article>

      <article className="metric-card metric-card--stat metric-card--glass">
        <div className="metric-card__stat-body">
          <h3 className="metric-card__stat-label">Consultations Requested</h3>
          {comingSoonKpis ? (
            <ComingSoonPanel variant="metric" />
          ) : (
            <>
              <p className="metric-card__stat-value">
                {kpisLoading
                  ? '…'
                  : kpis == null
                    ? EMPTY
                    : `${displayNumber(kpis.doctorConsultation, false)}/${displayNumber(kpis.nutritionistConsultation, false)}`}
              </p>
              <p className="metric-card__stat-footer">Doctor / Nutritionist</p>
            </>
          )}
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
      selectedYear={selectedYear}
    />
  );
}
