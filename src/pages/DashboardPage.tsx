import { Stethoscope, Users, AlertTriangle, Droplets } from 'lucide-react';
import { SHOW_EXTENDED_DASHBOARD_SECTIONS } from '../config/dashboard';
import {
  useCampKpis,
  useCampOverallRiskScore,
  useCampParticipationByAge,
  useCampPhysicalActivity,
  useCampSleep,
} from '../hooks/useCampDashboard';
import { KpiCard } from '../components/ui/KpiCard';
import { ComingSoonPanel } from '../components/ui/ComingSoonPanel';
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

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1>HR health intelligence dashboard</h1>
          <p>Workforce wellness analysis</p>
        </div>
        <span className="badge-live">
          <span className="dot" />
          Live data
        </span>
      </header>

      {(kpisError || ageError || riskError || physicalError || sleepError) && (
        <p className="dashboard-api-error" role="alert">
          {kpisError || ageError || riskError || physicalError || sleepError}
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
          label="Doctor consultation"
          value={formatKpiValue(apiKpis?.doctorConsultation, kpisLoading, hasKpis)}
          sub="Enrolled for consultation"
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
      />

      {SHOW_EXTENDED_DASHBOARD_SECTIONS ? (
        <DashboardExtendedSections />
      ) : (
        <ComingSoonPanel />
      )}
    </div>
  );
}
