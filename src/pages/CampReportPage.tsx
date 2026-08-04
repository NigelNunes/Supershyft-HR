import { useMemo, useState } from 'react';
import {
  useCampRanking,
  useCampCompanyAverageScores,
  useCampPhysicalActivity,
  useCampSleep,
  useCampKpis,
  useCampRiskLifestyleByGender,
  useCampBloodAndLabIntelligence,
  useCampPositiveWins,
  useCampOxidativeStress,
} from '../hooks/useCampDashboard';
import { DashboardHeader, type YearOption } from '../components/layout/DashboardHeader';
import { ExecutiveRankingCard } from '../components/charts/ExecutiveRankingCard';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';
import { PhysicalSleepSegmentCharts } from '../components/charts/PhysicalSleepSegmentCharts';
import { TopHighRiskDiseasesList } from '../components/charts/TopHighRiskDiseasesList';
import { DiseaseDeepDive } from '../components/charts/DiseaseDeepDive';
import { OxidativeStressChart } from '../components/charts/OxidativeStressChart';
import { BloodParameterPanels } from '../components/charts/BloodParameterPanels';
import { PositiveWinsPanel } from '../components/charts/PositiveWinsPanel';
import { LeadershipTakeawaysSection } from '../components/charts/LeadershipTakeawaysSection';
import { mockDashboard } from '../data/mockDashboard';
import {
  getDummyYearBloodPanels,
  getDummyYearCompanyScores,
  getDummyYearDiseases,
  getDummyYearKpis,
  getDummyYearPhysicalActivity,
  getDummyYearRanking,
  getDummyYearSleep,
  getDummyYearTopDiseases,
  parseCampYear,
} from '../data/dummyAllYearsMetrics';
import type { GenderDistributionPair } from '../types';
import './CampReportPage.css';

const EMPTY_GENDER_DISTRIBUTION: GenderDistributionPair = { male: [], female: [] };

function CampSectionTitle({ children }: { children: string }) {
  return (
    <div className="camp-section-title">
      <h2 className="camp-section-title__text">{children}</h2>
      <span className="camp-section-title__rule" aria-hidden />
    </div>
  );
}

function CampReportPageContent({ onRefresh }: { onRefresh: () => void }) {
  const [selectedYear, setSelectedYear] = useState<YearOption>('2026');
  const { data: apiRanking, loading: rankingLoading, error: rankingError } = useCampRanking();
  const {
    data: companyScores,
    loading: companyScoresLoading,
    error: companyScoresError,
  } = useCampCompanyAverageScores();
  const { data: apiKpis } = useCampKpis();
  const {
    data: apiPhysicalActivity,
    loading: physicalLoading,
    error: physicalError,
  } = useCampPhysicalActivity();
  const { data: apiSleep, loading: sleepLoading, error: sleepError } = useCampSleep();
  const {
    data: riskLifestyle,
    loading: riskLifestyleLoading,
    error: riskLifestyleError,
  } = useCampRiskLifestyleByGender();
  const {
    data: bloodPanels,
    loading: bloodPanelsLoading,
    error: bloodPanelsError,
  } = useCampBloodAndLabIntelligence();
  const {
    data: positiveWins,
    loading: positiveWinsLoading,
    error: positiveWinsError,
  } = useCampPositiveWins();
  const {
    data: oxidativeStress,
    loading: oxidativeLoading,
    error: oxidativeError,
  } = useCampOxidativeStress();

  const campYear = parseCampYear(selectedYear);
  const yearData = useMemo(() => {
    if (!campYear) return null;
    return {
      ranking: getDummyYearRanking(campYear),
      kpis: getDummyYearKpis(campYear),
      companyScores: getDummyYearCompanyScores(campYear),
      physical: getDummyYearPhysicalActivity(campYear),
      sleep: getDummyYearSleep(campYear),
      topDiseases: getDummyYearTopDiseases(campYear),
      diseases: getDummyYearDiseases(campYear),
      bloodPanels: getDummyYearBloodPanels(campYear),
    };
  }, [campYear]);

  const oxidativeData = oxidativeStress?.distribution ?? [];
  const oxidativeHeadcount = yearData?.kpis.employeesEnrolled ?? oxidativeStress?.totalEmployees;

  const ranking = yearData?.ranking ?? apiRanking;
  const scores = yearData?.companyScores ?? companyScores ?? { nutrition: 0, fitness: 0, lifestyle: 0 };
  const physical = yearData?.physical ?? apiPhysicalActivity ?? EMPTY_GENDER_DISTRIBUTION;
  const sleep = yearData?.sleep ?? apiSleep ?? EMPTY_GENDER_DISTRIBUTION;
  const kpis = yearData?.kpis ?? apiKpis;
  const topDiseases = yearData?.topDiseases ?? riskLifestyle?.topHighRiskDiseases ?? [];
  const diseases = yearData?.diseases ?? riskLifestyle?.diseases ?? [];
  const panels = yearData?.bloodPanels ?? bloodPanels ?? [];

  return (
    <div className="dashboard-page">
      <DashboardHeader
        title="HR health intelligence report"
        subtitle="Workforce wellness analysis"
        onRefresh={onRefresh}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {(rankingError ||
        companyScoresError ||
        physicalError ||
        sleepError ||
        riskLifestyleError ||
        oxidativeError ||
        bloodPanelsError ||
        positiveWinsError) &&
        !yearData && (
          <p className="dashboard-api-error" role="alert">
            {rankingError ||
              companyScoresError ||
              physicalError ||
              sleepError ||
              riskLifestyleError ||
              oxidativeError ||
              bloodPanelsError ||
              positiveWinsError}
          </p>
        )}

      <ExecutiveRankingCard
        ranking={ranking}
        rankingLoading={!yearData && rankingLoading}
        selectedYear={selectedYear}
      />

      <CompanyAverageScores
        scores={scores}
        loading={!yearData && companyScoresLoading}
        selectedYear={selectedYear}
      />

      <PhysicalSleepSegmentCharts
        physical={physical}
        sleep={sleep}
        loading={!yearData && (physicalLoading || sleepLoading)}
        maleEnrolled={kpis?.maleEnrolled}
        femaleEnrolled={kpis?.femaleEnrolled}
        selectedYear={selectedYear}
      />

      <CampSectionTitle>Risks & Lifestyle</CampSectionTitle>
      {selectedYear === 'all' ? (
        <>
          <TopHighRiskDiseasesList
            diseases={topDiseases}
            loading={!yearData && riskLifestyleLoading}
            selectedYear={selectedYear}
          />
          <DiseaseDeepDive
            diseases={diseases}
            loading={!yearData && riskLifestyleLoading}
            selectedYear={selectedYear}
          />
        </>
      ) : (
        <div className="camp-risk-lifestyle-grid">
          <TopHighRiskDiseasesList
            diseases={topDiseases}
            loading={!yearData && riskLifestyleLoading}
            selectedYear={selectedYear}
          />
          <DiseaseDeepDive
            diseases={diseases}
            loading={!yearData && riskLifestyleLoading}
            selectedYear={selectedYear}
          />
        </div>
      )}

      <CampSectionTitle>Oxidative Stress</CampSectionTitle>
      <OxidativeStressChart
        data={oxidativeData.length > 0 ? oxidativeData : mockDashboard.oxidativeStress}
        departments={mockDashboard.departments}
        totalHeadcount={oxidativeHeadcount}
        loading={!yearData && oxidativeLoading}
      />

      <CampSectionTitle>Blood & Lab Intelligence</CampSectionTitle>
      <BloodParameterPanels
        panels={panels}
        loading={!yearData && bloodPanelsLoading}
        selectedYear={selectedYear}
      />

      <PositiveWinsPanel
        data={positiveWins ?? { lowRisk: [], healthyHabits: [], healthyProfiles: [] }}
        loading={positiveWinsLoading}
      />

      <CampSectionTitle>Leadership Takeaways</CampSectionTitle>
      <LeadershipTakeawaysSection />
    </div>
  );
}

export function CampReportPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <CampReportPageContent
      key={refreshKey}
      onRefresh={() => setRefreshKey((key) => key + 1)}
    />
  );
}
