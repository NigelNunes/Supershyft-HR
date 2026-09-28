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
import { ProgressiveSection, SectionError } from '../components/ui/ProgressiveSection';
import { metabolicCategoriesFromKpis } from '../services/campDashboardMappers';
import { refreshMountedSections, useRegisterSectionRefresh } from '../utils/mountedSectionRefresh';
import type { GenderDistributionPair } from '../types';
import './DepartmentDetailPage.css';

const EMPTY_GENDER_DISTRIBUTION: GenderDistributionPair = { male: [], female: [] };

function DepartmentChartsColumn({ slug }: { slug: string }) {
  const { selectedYear } = useCamp();
  const {
    data: participationSection,
    loading: ageLoading,
    error: ageError,
    refresh: refreshAge,
  } = useDepartmentParticipationByAge(slug);
  const {
    data: overallRiskSection,
    loading: riskLoading,
    error: riskError,
    refresh: refreshRisk,
  } = useDepartmentOverallRiskScore(slug);
  useRegisterSectionRefresh(refreshAge);
  useRegisterSectionRefresh(refreshRisk);

  return (
    <>
      <SectionError error={ageError || riskError} always />
      <ParticipationCharts
        byAge={participationSection?.byAge ?? []}
        intelligence={participationSection?.intelligence}
        loading={ageLoading}
        selectedYear={selectedYear}
      />
      <OverallRiskScoreChart
        buckets={overallRiskSection?.buckets ?? []}
        intelligence={overallRiskSection?.intelligence}
        loading={riskLoading}
        selectedYear={selectedYear}
      />
    </>
  );
}

function DepartmentActivitySection({ slug }: { slug: string }) {
  const { selectedYear } = useCamp();
  const {
    data: physicalActivity,
    loading: physicalLoading,
    error: physicalError,
    refresh: refreshPhysical,
  } = useDepartmentPhysicalActivity(slug);
  const { data: sleepQuality, loading: sleepLoading, error: sleepError, refresh: refreshSleep } =
    useDepartmentSleep(slug);
  useRegisterSectionRefresh(refreshPhysical);
  useRegisterSectionRefresh(refreshSleep);

  return (
    <>
      <SectionError error={physicalError || sleepError} always />
      <PhysicalSleepSegmentCharts
        physical={physicalActivity ?? EMPTY_GENDER_DISTRIBUTION}
        sleep={sleepQuality ?? EMPTY_GENDER_DISTRIBUTION}
        loading={physicalLoading || sleepLoading}
        selectedYear={selectedYear}
      />
    </>
  );
}

function DepartmentScoresSection({ slug }: { slug: string }) {
  const { selectedYear } = useCamp();
  const { data, loading, error, refresh } = useDepartmentCompanyAverageScores(slug);
  useRegisterSectionRefresh(refresh);

  return (
    <>
      <SectionError error={error} always />
      <CompanyAverageScores
        scores={data ?? { nutrition: 0, fitness: 0, lifestyle: 0 }}
        loading={loading}
        title="Company average scores"
        subtitle="Nutrition · fitness · lifestyle (scale 0–100)"
        info={CHART_INFO.deptCompanyScores}
        selectedYear={selectedYear}
      />
    </>
  );
}

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { departments, loading: orgLoading } = useOrganization();
  const { selectedYear, setSelectedYear, yearOptions } = useCamp();

  const campDepartment = departments.find((dept) => dept.slug === id);
  const departmentName = campDepartment?.department ?? 'Department';
  const { data: kpis, loading: kpisLoading, error: kpisError, refresh: refreshKpis } =
    useDepartmentKpis(id);
  useRegisterSectionRefresh(refreshKpis);

  const metabolicCategories = useMemo(() => metabolicCategoriesFromKpis(kpis), [kpis]);

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
        onRefresh={refreshMountedSections}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        yearOptions={yearOptions}
        showLocationFilter={false}
      />

      <SectionError error={kpisError} always />

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
          <ProgressiveSection
            hold={kpisLoading}
            eager
            minHeight="32rem"
            label="Loading participation and risk charts"
          >
            <DepartmentChartsColumn slug={id} />
          </ProgressiveSection>
        </div>
      </div>

      <ProgressiveSection minHeight="22rem" label="Loading activity and sleep">
        <DepartmentActivitySection slug={id} />
      </ProgressiveSection>

      <ProgressiveSection minHeight="16rem" label="Loading company scores">
        <DepartmentScoresSection slug={id} />
      </ProgressiveSection>
    </div>
  );
}
