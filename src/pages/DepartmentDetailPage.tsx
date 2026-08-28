import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCamp } from '../contexts/CampContext';
import { useOrganization } from '../contexts/OrganizationContext';
import {
  useDepartmentCompanyAverageScores,
  useDepartmentKpis,
  useDepartmentOverallRiskScore,
  useDepartmentParticipationByAge,
  useDepartmentPhysicalActivity,
  useDepartmentSleep,
} from '../hooks/useDepartmentDashboard';
import { CHART_INFO } from '../content/chartInfo';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { DashboardMetricCards } from '../components/ui/DashboardMetricCards';
import { MetabolicAgeDistributionCard } from '../components/charts/MetabolicAgeDistributionCard';
import { ParticipationCharts } from '../components/charts/ParticipationCharts';
import { OverallRiskScoreChart } from '../components/charts/OverallRiskScoreChart';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';
import { PhysicalSleepSegmentCharts } from '../components/charts/PhysicalSleepSegmentCharts';
import { metabolicCategoriesFromKpis } from '../services/campDashboardMappers';
import type { GenderDistributionPair } from '../types';
import './DepartmentDetailPage.css';

const EMPTY_GENDER_DISTRIBUTION: GenderDistributionPair = { male: [], female: [] };

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { departments, loading: orgLoading } = useOrganization();
  const { selectedYear, setSelectedYear, yearOptions } = useCamp();

  const campDepartment = departments.find((dept) => dept.slug === id);
  const departmentName = campDepartment?.department ?? 'Department';

  const { data: kpis, loading: kpisLoading, error: kpisError, refresh: refreshKpis } =
    useDepartmentKpis(id);
  const {
    data: participationByAge,
    loading: ageLoading,
    error: ageError,
    refresh: refreshAge,
  } = useDepartmentParticipationByAge(id);
  const {
    data: overallRiskScore,
    loading: riskLoading,
    error: riskError,
    refresh: refreshRisk,
  } = useDepartmentOverallRiskScore(id);
  const {
    data: physicalActivity,
    loading: physicalLoading,
    error: physicalError,
    refresh: refreshPhysical,
  } = useDepartmentPhysicalActivity(id);
  const { data: sleepQuality, loading: sleepLoading, error: sleepError, refresh: refreshSleep } =
    useDepartmentSleep(id);
  const {
    data: companyScores,
    loading: companyScoresLoading,
    error: companyScoresError,
    refresh: refreshCompanyScores,
  } = useDepartmentCompanyAverageScores(id);

  const metabolicCategories = useMemo(() => metabolicCategoriesFromKpis(kpis), [kpis]);

  const sectionError =
    kpisError || ageError || riskError || physicalError || sleepError || companyScoresError;

  const handleRefresh = async () => {
    await Promise.all([
      refreshKpis(),
      refreshAge(),
      refreshRisk(),
      refreshPhysical(),
      refreshSleep(),
      refreshCompanyScores(),
    ]);
  };

  if (!id || (!orgLoading && departments.length > 0 && !campDepartment)) {
    return (
      <div className="page-header">
        <h1>Department not found</h1>
        <Link to="/">← Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dept-detail-back">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      <DashboardHeader
        title={`${departmentName} Health Report`}
        subtitle="Workforce wellness analysis"
        onRefresh={handleRefresh}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        yearOptions={yearOptions}
        showLocationFilter={false}
      />

      {sectionError && (
        <p className="dashboard-api-error" role="alert">
          {sectionError}
        </p>
      )}

      <div className="dashboard-metrics-row">
        <div className="dashboard-metrics-col">
          <DashboardMetricCards
            kpis={kpis}
            ranking={null}
            showRanking={false}
            kpisLoading={kpisLoading}
            selectedYear={selectedYear}
          />
          <MetabolicAgeDistributionCard
            categories={metabolicCategories}
            selectedYear={selectedYear}
            loading={kpisLoading}
          />
        </div>
        <div className="dashboard-metrics-col">
          <ParticipationCharts
            byAge={participationByAge ?? []}
            loading={ageLoading}
            selectedYear={selectedYear}
          />
          <OverallRiskScoreChart
            buckets={overallRiskScore ?? []}
            loading={riskLoading}
            selectedYear={selectedYear}
          />
        </div>
      </div>

      <PhysicalSleepSegmentCharts
        physical={physicalActivity ?? EMPTY_GENDER_DISTRIBUTION}
        sleep={sleepQuality ?? EMPTY_GENDER_DISTRIBUTION}
        loading={physicalLoading || sleepLoading}
        selectedYear={selectedYear}
      />

      <CompanyAverageScores
        scores={companyScores ?? { nutrition: 0, fitness: 0, lifestyle: 0 }}
        loading={companyScoresLoading}
        title="Company average scores"
        subtitle="Nutrition · fitness · lifestyle (scale 0–100)"
        info={CHART_INFO.deptCompanyScores}
        selectedYear={selectedYear}
      />
    </div>
  );
}
