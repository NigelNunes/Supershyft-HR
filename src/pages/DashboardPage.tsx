import { useMemo } from 'react';
import { useCampKpis, useCampOverallRiskScore, useCampParticipationByAge } from '../hooks/useCampDashboard';
import { useCamp } from '../contexts/CampContext';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { DashboardMetricCards } from '../components/ui/DashboardMetricCards';
import { ParticipationCharts } from '../components/charts/ParticipationCharts';
import { MetabolicAgeDistributionCard } from '../components/charts/MetabolicAgeDistributionCard';
import { OverallRiskScoreChart } from '../components/charts/OverallRiskScoreChart';
import { ProgressiveSection, SectionError } from '../components/ui/ProgressiveSection';
import { SHOW_DASHBOARD_REFRESH } from '../config/dashboard';
import { DashboardExtendedSections } from './DashboardExtendedSections';
import { refreshMountedSections, useRegisterSectionRefresh } from '../utils/mountedSectionRefresh';
import { metabolicCategoriesFromKpis } from '../services/campDashboardMappers';
import { nvidiaDashboardConsultationCount } from '../utils/nvidiaConsultations';

function DashboardChartsColumn() {
  const { selectedYear } = useCamp();
  const {
    data: participationSection,
    loading: ageLoading,
    error: ageError,
    refresh: refreshAge,
  } = useCampParticipationByAge();
  const {
    data: overallRiskSection,
    loading: riskLoading,
    error: riskError,
    refresh: refreshRisk,
  } = useCampOverallRiskScore();

  useRegisterSectionRefresh(refreshAge);
  useRegisterSectionRefresh(refreshRisk);

  return (
    <>
      <SectionError error={ageError || riskError} selectedYear={selectedYear} />
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

export function DashboardPage() {
  const {
    selectedYear,
    setSelectedYear,
    yearOptions,
    selectedCity,
    setSelectedCity,
    locationOptions,
    selectedCampNo,
    selectedCampName,
    selectedCampOrganizationName,
    organizationCamps,
  } = useCamp();
  const selectedCamp = organizationCamps.find((camp) => camp.camp_no === selectedCampNo);
  const consultationsCount = nvidiaDashboardConsultationCount(
    {
      campName: selectedCamp?.camp_name ?? selectedCampName,
      organizationName: selectedCamp?.organization_name ?? selectedCampOrganizationName,
      startDate: selectedCamp?.start_date,
    },
    selectedCity,
  );
  const { data: kpis, loading: kpisLoading, error: kpisError, refresh: refreshKpis } = useCampKpis();
  useRegisterSectionRefresh(refreshKpis);

  const metabolicCategories = useMemo(() => metabolicCategoriesFromKpis(kpis), [kpis]);

  return (
    <div className="dashboard-page">
      <DashboardHeader
        onRefresh={refreshMountedSections}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        yearOptions={yearOptions}
        locationOptions={locationOptions}
        selectedLocation={selectedCity}
        onLocationChange={setSelectedCity}
        showRefresh={SHOW_DASHBOARD_REFRESH}
      />

      <SectionError error={kpisError} selectedYear={selectedYear} />

      <div className="dashboard-metrics-row">
        <div className="dashboard-metrics-col">
          <DashboardMetricCards
            kpis={kpis}
            ranking={null}
            kpisLoading={kpisLoading}
            rankingLoading={false}
            selectedYear={selectedYear}
            showRanking={false}
            consultationsCount={consultationsCount}
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
            <DashboardChartsColumn />
          </ProgressiveSection>
        </div>
      </div>

      <DashboardExtendedSections />
    </div>
  );
}
