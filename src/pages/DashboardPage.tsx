import { useMemo, useState } from 'react';
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
import { DashboardExtendedSections } from './DashboardExtendedSections';
import { metabolicCategoriesFromKpis } from '../services/campDashboardMappers';

function DashboardPageContent({ onRefresh }: { onRefresh: () => void }) {
  const { selectedYear, setSelectedYear, yearOptions } = useCamp();
  const { data: kpis, loading: kpisLoading, error: kpisError } = useCampKpis();
  const { data: ranking, loading: rankingLoading, error: rankingError } = useCampRanking();
  const { data: participationByAge, loading: ageLoading, error: ageError } =
    useCampParticipationByAge();
  const {
    data: overallRiskScore,
    loading: riskLoading,
    error: riskError,
  } = useCampOverallRiskScore();

  const metabolicCategories = useMemo(() => metabolicCategoriesFromKpis(kpis), [kpis]);
  const sectionError = kpisError || rankingError || ageError || riskError;

  return (
    <div className="dashboard-page">
      <DashboardHeader
        onRefresh={onRefresh}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        yearOptions={yearOptions}
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
            ranking={ranking}
            kpisLoading={kpisLoading}
            rankingLoading={rankingLoading}
            selectedYear={selectedYear}
          />
          <MetabolicAgeDistributionCard
            categories={metabolicCategories}
            selectedYear={selectedYear}
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

export function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardPageContent
      key={refreshKey}
      onRefresh={() => setRefreshKey((key) => key + 1)}
    />
  );
}
