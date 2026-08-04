import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getDepartmentDetail } from '../data/mockDashboard';
import { useOrganization } from '../contexts/OrganizationContext';
import { ComingSoonPanel } from '../components/ui/ComingSoonPanel';
import { CHART_INFO } from '../content/chartInfo';
import { DashboardHeader, type YearOption } from '../components/layout/DashboardHeader';
import { DashboardMetricCards } from '../components/ui/DashboardMetricCards';
import { MetabolicAgeDistributionCard } from '../components/charts/MetabolicAgeDistributionCard';
import { ParticipationCharts } from '../components/charts/ParticipationCharts';
import { OverallRiskScoreChart } from '../components/charts/OverallRiskScoreChart';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';
import { PhysicalSleepSegmentCharts } from '../components/charts/PhysicalSleepSegmentCharts';
import type { GenderDistributionPair } from '../types';
import './DepartmentDetailPage.css';

const EMPTY_GENDER_DISTRIBUTION: GenderDistributionPair = { male: [], female: [] };

function DepartmentDetailPageContent({
  onRefresh,
  departmentName,
  detail,
}: {
  onRefresh: () => void;
  departmentName: string;
  detail: NonNullable<ReturnType<typeof getDepartmentDetail>>;
}) {
  const [selectedYear, setSelectedYear] = useState<YearOption>('2026');
  const { genderBreakdown } = detail;

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
        onRefresh={onRefresh}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      <div className="dashboard-metrics-row">
        <div className="dashboard-metrics-col">
          <DashboardMetricCards
            kpis={detail.kpis}
            ranking={null}
            showRanking={false}
            selectedYear={selectedYear}
          />
          <MetabolicAgeDistributionCard
            categories={detail.metabolicAgeCategories}
            selectedYear={selectedYear}
          />
        </div>
        <div className="dashboard-metrics-col">
          <ParticipationCharts
            byAge={detail.participationByAge}
            selectedYear={selectedYear}
          />
          <OverallRiskScoreChart
            buckets={detail.overallRiskScore}
            selectedYear={selectedYear}
          />
        </div>
      </div>

      <PhysicalSleepSegmentCharts
        physical={detail.physicalActivityByGender ?? EMPTY_GENDER_DISTRIBUTION}
        sleep={detail.sleepQualityByGender ?? EMPTY_GENDER_DISTRIBUTION}
        maleEnrolled={genderBreakdown.male}
        femaleEnrolled={genderBreakdown.female}
        selectedYear={selectedYear}
      />

      <CompanyAverageScores
        scores={detail.companyScores}
        title="Company average scores"
        subtitle="Nutrition · fitness · lifestyle (scale 0–100)"
        info={CHART_INFO.deptCompanyScores}
        selectedYear={selectedYear}
      />
    </div>
  );
}

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { departments } = useOrganization();
  const [refreshKey, setRefreshKey] = useState(0);
  const orgDepartment = departments.find((dept) => dept.slug === id);
  const detail = id ? getDepartmentDetail(id) : null;

  if (!orgDepartment && !detail) {
    return (
      <div className="page-header">
        <h1>Department not found</h1>
        <Link to="/departments">← Back to departments</Link>
      </div>
    );
  }

  const departmentName = orgDepartment?.department ?? detail?.name ?? 'Department';

  if (!detail) {
    return (
      <div className="dashboard-page">
        <header className="page-header">
          <div>
            <Link to="/departments" className="back-link">
              <ArrowLeft size={16} /> Departments
            </Link>
            <h1>{departmentName}</h1>
            <p>Department health profile</p>
          </div>
        </header>
        <ComingSoonPanel
          title="Department insights coming soon"
          description="Live health metrics for this department will appear here once camp reports are available."
        />
      </div>
    );
  }

  return (
    <DepartmentDetailPageContent
      key={`${id}-${refreshKey}`}
      departmentName={departmentName}
      detail={detail}
      onRefresh={() => setRefreshKey((k) => k + 1)}
    />
  );
}
