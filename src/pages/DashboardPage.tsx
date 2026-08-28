import { useMemo } from 'react';
import {
  useCampKpis,
  useCampOverallRiskScore,
  useCampParticipationByAge,
  useCampRanking,
} from '../hooks/useCampDashboard';
import { useCamp } from '../contexts/CampContext';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { DashboardMetricCards } from '../components/ui/DashboardMetricCards';
import { ParticipationCharts } from '../components/charts/ParticipationCharts';
import { MetabolicAgeDistributionCard } from '../components/charts/MetabolicAgeDistributionCard';
import { OverallRiskScoreChart } from '../components/charts/OverallRiskScoreChart';
import { EMPLOYEES_CAMP_YEAR } from '../config/camp';
import { SHOW_DASHBOARD_REFRESH } from '../config/dashboard';
import { DashboardExtendedSections } from './DashboardExtendedSections';
import { metabolicCategoriesFromKpis } from '../services/campDashboardMappers';

export function DashboardPage() {
  const {
    selectedYear,
    setSelectedYear,
    yearOptions,
    selectedCity,
    setSelectedCity,
    locationOptions,
  } = useCamp();
  const { data: kpis, loading: kpisLoading, error: kpisError, refresh: refreshKpis } = useCampKpis();
  const { data: ranking, loading: rankingLoading, error: rankingError, refresh: refreshRanking } = useCampRanking();
  const { data: participationByAge, loading: ageLoading, error: ageError, refresh: refreshAge } =
    useCampParticipationByAge();
  const {
    data: overallRiskScore,
    loading: riskLoading,
    error: riskError,
    refresh: refreshRisk,
  } = useCampOverallRiskScore();

  const metabolicCategories = useMemo(() => metabolicCategoriesFromKpis(kpis), [kpis]);
  const sectionError = kpisError || rankingError || ageError || riskError;

  const handleRefresh = async () => {
    await Promise.all([refreshKpis(), refreshRanking(), refreshAge(), refreshRisk()]);
  };

  return (
    <div className="dashboard-page">
      <DashboardHeader
        onRefresh={handleRefresh}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        yearOptions={yearOptions}
        locationOptions={locationOptions}
        selectedLocation={selectedCity}
        onLocationChange={setSelectedCity}
        showRefresh={SHOW_DASHBOARD_REFRESH}
      />

      {sectionError && selectedYear !== EMPLOYEES_CAMP_YEAR && (
        <p className="dashboard-api-error" role="alert">
          {sectionError}
        </p>
      )}

      <div className="dashboard-metrics-row">
        <div className="dashboard-metrics-col">
          <DashboardMetricCards
            kpis={kpis}
            ranking={ranking}
            kpisLoading={kpisLoading}
            rankingLoading={rankingLoading}
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

      <DashboardExtendedSections />
    </div>
  );
}
