import { Stethoscope, Users, AlertTriangle, Droplets } from 'lucide-react';
import {
  useCampKpis,
  useCampOverallRiskScore,
  useCampParticipationByAge,
  useCampPhysicalActivity,
  useCampRanking,
  useCampSleep,
} from '../hooks/useCampDashboard';
import { KpiCard } from '../components/ui/KpiCard';
import { ParticipationCharts } from '../components/charts/ParticipationCharts';
import { OverallRiskScoreChart } from '../components/charts/OverallRiskScoreChart';
import { PhysicalSleepPieCharts } from '../components/charts/PhysicalSleepPieCharts';
import { DashboardExtendedSections } from './DashboardExtendedSections';
import type { GenderDistributionPair, KpiSummary } from '../types';

const EMPTY_GENDER_DISTRIBUTION: GenderDistributionPair = { male: [], female: [] };

function formatGenderBreakdown(kpis: KpiSummary | null): string {
  if (!kpis) return '—';
  if (kpis.maleEnrolled != null && kpis.femaleEnrolled != null) {
    return `M: ${kpis.maleEnrolled.toLocaleString()} · F: ${kpis.femaleEnrolled.toLocaleString()}`;
  }
  return '—';
}

function formatKpiValue(value: number | undefined, loading: boolean, hasData: boolean): string {
  if (loading) return '…';
  if (!hasData || value == null) return '—';
  return value.toLocaleString();
}

function formatConsultationValue(
  doctor: number | undefined,
  nutritionist: number | undefined,
  loading: boolean,
  hasData: boolean,
): string {
  if (loading) return '…';
  if (!hasData || doctor == null || nutritionist == null) return '—';
  return `${doctor.toLocaleString()}/${nutritionist.toLocaleString()}`;
}

function formatBloodTestSub(kpis: KpiSummary | null, loading: boolean): string {
  if (loading) return 'Loading…';
  if (!kpis) return '—';
  const percent =
    kpis.bloodTestPercent ??
    (kpis.employeesEnrolled > 0
      ? Math.round((kpis.totalBloodTest / kpis.employeesEnrolled) * 100)
      : null);
  return percent != null ? `${percent}% of enrolled` : '—';
}

export function DashboardPage() {
  const { data: apiKpis, loading: kpisLoading, error: kpisError } = useCampKpis();
  const { data: apiRanking, loading: rankingLoading, error: rankingError } = useCampRanking();
  const { data: apiParticipationByAge, loading: ageLoading, error: ageError } =
    useCampParticipationByAge();
  const {
    data: apiOverallRiskScore,
    loading: riskLoading,
    error: riskError,
  } = useCampOverallRiskScore();
  const {
    data: apiPhysicalActivity,
    loading: physicalLoading,
    error: physicalError,
  } = useCampPhysicalActivity();
  const { data: apiSleep, loading: sleepLoading, error: sleepError } = useCampSleep();

  const hasKpis = apiKpis != null;
  const hasRanking = apiRanking != null;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1>HR health intelligence dashboard</h1>
          <p>Workforce wellness analysis</p>
          <span className="badge-live">
            <span className="dot" />
            Live data
          </span>
        </div>
        <div className="dashboard-ranks" aria-label="Organization ranks">
          <div className="dashboard-rank">
            <span className="dashboard-rank__value">
              {formatKpiValue(apiRanking?.cityRank, rankingLoading, hasRanking)}
            </span>
            <span className="dashboard-rank__label">City Rank</span>
          </div>
          <div className="dashboard-rank">
            <span className="dashboard-rank__value">
              {formatKpiValue(apiRanking?.industryRank, rankingLoading, hasRanking)}
            </span>
            <span className="dashboard-rank__label">Industry Rank</span>
          </div>
        </div>
      </header>

      {(kpisError || rankingError || ageError || riskError || physicalError || sleepError) && (
        <p className="dashboard-api-error" role="alert">
          {kpisError || rankingError || ageError || riskError || physicalError || sleepError}
        </p>
      )}

      <div className="kpi-grid">
        <KpiCard
          label="Employees Enrolled"
          value={formatKpiValue(apiKpis?.employeesEnrolled, kpisLoading, hasKpis)}
          sub={kpisLoading ? 'Loading…' : formatGenderBreakdown(apiKpis)}
          icon={Users}
          variant="green"
        />
        <KpiCard
          label="Total Blood test"
          value={formatKpiValue(apiKpis?.totalBloodTest, kpisLoading, hasKpis)}
          sub={formatBloodTestSub(apiKpis, kpisLoading)}
          icon={Droplets}
          variant="blue"
        />
        <KpiCard
          label="Doctor/Nutritionist consultation"
          value={formatConsultationValue(
            apiKpis?.doctorConsultation,
            apiKpis?.nutritionistConsultation,
            kpisLoading,
            hasKpis,
          )}
          sub="Doctor / Nutritionist"
          icon={Stethoscope}
          variant="amber"
        />
        <KpiCard
          label="High Risk Group"
          value={formatKpiValue(apiKpis?.highRiskGroup, kpisLoading, hasKpis)}
          sub="Metabolic age ≥3 years above actual"
          icon={AlertTriangle}
          variant="red"
        />
      </div>

      <div className="grid-2 distribution-pair-row">
        <ParticipationCharts byAge={apiParticipationByAge ?? []} loading={ageLoading} />
        <OverallRiskScoreChart buckets={apiOverallRiskScore ?? []} loading={riskLoading} />
      </div>

      <PhysicalSleepPieCharts
        physical={apiPhysicalActivity ?? EMPTY_GENDER_DISTRIBUTION}
        sleep={apiSleep ?? EMPTY_GENDER_DISTRIBUTION}
        loading={physicalLoading || sleepLoading}
        maleEnrolled={apiKpis?.maleEnrolled}
        femaleEnrolled={apiKpis?.femaleEnrolled}
      />

      <DashboardExtendedSections />
    </div>
  );
}
