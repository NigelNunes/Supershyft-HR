import { useMemo, useState } from 'react';
import {
  useCampKpis,
  useCampOverallRiskScore,
  useCampParticipationByAge,
  useCampRanking,
} from '../hooks/useCampDashboard';
import { DashboardHeader, type YearOption } from '../components/layout/DashboardHeader';
import { DashboardMetricCards } from '../components/ui/DashboardMetricCards';
import { ParticipationCharts } from '../components/charts/ParticipationCharts';
import { MetabolicAgeDistributionCard } from '../components/charts/MetabolicAgeDistributionCard';
import { OverallRiskScoreChart } from '../components/charts/OverallRiskScoreChart';
import { DashboardExtendedSections } from './DashboardExtendedSections';
import {
  getDummyYearKpis,
  getDummyYearMetabolicAge,
  getDummyYearOverallRisk,
  getDummyYearParticipationByAge,
  getDummyYearRanking,
  parseCampYear,
} from '../data/dummyAllYearsMetrics';

function DashboardPageContent({ onRefresh }: { onRefresh: () => void }) {
  const [selectedYear, setSelectedYear] = useState<YearOption>('2026');
  const { data: apiKpis, loading: kpisLoading, error: kpisError } = useCampKpis();
  const { data: apiRanking, loading: rankingLoading, error: rankingError } = useCampRanking();
  const { data: apiParticipationByAge, loading: ageLoading, error: ageError } =
    useCampParticipationByAge();
  const {
    data: apiOverallRiskScore,
    loading: riskLoading,
    error: riskError,
  } = useCampOverallRiskScore();

  const campYear = parseCampYear(selectedYear);
  const yearData = useMemo(() => {
    if (!campYear) return null;
    return {
      kpis: getDummyYearKpis(campYear),
      ranking: getDummyYearRanking(campYear),
      participationByAge: getDummyYearParticipationByAge(campYear),
      overallRiskScore: getDummyYearOverallRisk(campYear),
      metabolicAge: getDummyYearMetabolicAge(campYear),
    };
  }, [campYear]);

  const kpis = yearData?.kpis ?? apiKpis;
  const ranking = yearData?.ranking ?? apiRanking;
  const participationByAge = yearData?.participationByAge ?? apiParticipationByAge ?? [];
  const overallRiskScore = yearData?.overallRiskScore ?? apiOverallRiskScore ?? [];

  return (
    <div className="dashboard-page">
      <DashboardHeader
        onRefresh={onRefresh}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {(kpisError || rankingError || ageError || riskError) && !yearData && (
        <p className="dashboard-api-error" role="alert">
          {kpisError || rankingError || ageError || riskError}
        </p>
      )}

      <div className="dashboard-metrics-row">
        <div className="dashboard-metrics-col">
          <DashboardMetricCards
            kpis={kpis}
            ranking={ranking}
            kpisLoading={!yearData && kpisLoading}
            rankingLoading={!yearData && rankingLoading}
            selectedYear={selectedYear}
          />
          <MetabolicAgeDistributionCard
            categories={yearData?.metabolicAge}
            selectedYear={selectedYear}
          />
        </div>
        <div className="dashboard-metrics-col">
          <ParticipationCharts
            byAge={participationByAge}
            loading={!yearData && ageLoading}
            selectedYear={selectedYear}
          />
          <OverallRiskScoreChart
            buckets={overallRiskScore}
            loading={!yearData && riskLoading}
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
