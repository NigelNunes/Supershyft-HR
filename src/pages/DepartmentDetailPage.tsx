import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getDepartmentDetail } from '../data/mockDashboard';
import { DISPLAY_ENROLLED } from '../data/participantPool';
import {
  getDummyYearMetabolicAge,
  getDummyYearOverallRisk,
  getDummyYearParticipationByAge,
  parseCampYear,
} from '../data/dummyAllYearsMetrics';
import { useOrganization } from '../contexts/OrganizationContext';
import { ComingSoonPanel } from '../components/ui/ComingSoonPanel';
import { CHART_INFO } from '../content/chartInfo';
import { DashboardHeader, YEAR_OPTIONS, type YearOption } from '../components/layout/DashboardHeader';
import { DashboardMetricCards } from '../components/ui/DashboardMetricCards';
import { MetabolicAgeDistributionCard } from '../components/charts/MetabolicAgeDistributionCard';
import { ParticipationCharts } from '../components/charts/ParticipationCharts';
import { OverallRiskScoreChart } from '../components/charts/OverallRiskScoreChart';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';
import { PhysicalSleepSegmentCharts } from '../components/charts/PhysicalSleepSegmentCharts';
import type { GenderDistributionPair, KpiSummary } from '../types';
import './DepartmentDetailPage.css';

const EMPTY_GENDER_DISTRIBUTION: GenderDistributionPair = { male: [], female: [] };

const YEAR_ENROLLED = { 2024: 620, 2025: 900, 2026: 1120 } as const;

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
  const campYear = parseCampYear(selectedYear);

  const yearView = useMemo(() => {
    if (!campYear) return null;
    // Share of org (for chart slices) + year ratio (for KPI headcounts).
    const deptShare = detail.kpis.employeesEnrolled / DISPLAY_ENROLLED;
    const yearRatio = YEAR_ENROLLED[campYear] / YEAR_ENROLLED[2026];
    const scaleKpi = (n: number) => Math.max(0, Math.round(n * yearRatio));
    const scaleChart = (n: number) => Math.max(0, Math.round(n * deptShare));

    const companyKpisYear = {
      employeesEnrolled: scaleKpi(detail.kpis.employeesEnrolled),
      maleEnrolled: scaleKpi(detail.kpis.maleEnrolled ?? 0),
      femaleEnrolled: scaleKpi(detail.kpis.femaleEnrolled ?? 0),
      totalBloodTest: scaleKpi(detail.kpis.totalBloodTest),
      bloodTestPercent: detail.kpis.bloodTestPercent,
      totalBioAiReports: scaleKpi(detail.kpis.totalBioAiReports ?? 0),
      bioAiPercent: detail.kpis.bioAiPercent,
      doctorConsultation: scaleKpi(detail.kpis.doctorConsultation),
      nutritionistConsultation: scaleKpi(detail.kpis.nutritionistConsultation),
      highRiskGroup: scaleKpi(detail.kpis.highRiskGroup),
    } satisfies KpiSummary;

    const participation = getDummyYearParticipationByAge(campYear).map((row) => ({
      ...row,
      enrolled: scaleChart(row.enrolled),
    }));

    const overallRisk = getDummyYearOverallRisk(campYear).map((row) => ({
      ...row,
      count: scaleChart(row.count),
    }));

    const metabolic = getDummyYearMetabolicAge(campYear).map((row) => ({
      ...row,
      count: scaleChart(row.count),
    }));

    return {
      kpis: companyKpisYear,
      participation,
      overallRisk,
      metabolic,
      maleEnrolled: companyKpisYear.maleEnrolled,
      femaleEnrolled: companyKpisYear.femaleEnrolled,
    };
  }, [campYear, detail]);

  const kpis = yearView?.kpis ?? detail.kpis;
  const genderBreakdown = yearView
    ? { male: yearView.maleEnrolled ?? 0, female: yearView.femaleEnrolled ?? 0 }
    : detail.genderBreakdown;

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
        yearOptions={YEAR_OPTIONS.map((opt) => ({ ...opt, campNo: null }))}
      />

      <div className="dashboard-metrics-row">
        <div className="dashboard-metrics-col">
          <DashboardMetricCards
            kpis={kpis}
            ranking={null}
            showRanking={false}
            selectedYear={selectedYear === 'all' ? '2026' : selectedYear}
          />
          <MetabolicAgeDistributionCard
            categories={yearView?.metabolic ?? detail.metabolicAgeCategories}
            selectedYear={selectedYear}
          />
        </div>
        <div className="dashboard-metrics-col">
          <ParticipationCharts
            byAge={yearView?.participation ?? detail.participationByAge}
            selectedYear={selectedYear}
          />
          <OverallRiskScoreChart
            buckets={yearView?.overallRisk ?? detail.overallRiskScore}
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
        <Link to="/">← Back to dashboard</Link>
      </div>
    );
  }

  const departmentName = orgDepartment?.department ?? detail?.name ?? 'Department';

  if (!detail) {
    return (
      <div className="dashboard-page">
        <header className="page-header">
          <div>
            <Link to="/" className="back-link">
              <ArrowLeft size={16} /> Dashboard
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
