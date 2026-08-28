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
import { useCamp } from '../contexts/CampContext';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { ExecutiveRankingCard } from '../components/charts/ExecutiveRankingCard';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';
import { PhysicalSleepSegmentCharts } from '../components/charts/PhysicalSleepSegmentCharts';
import { TopHighRiskDiseasesList } from '../components/charts/TopHighRiskDiseasesList';
import { DiseaseDeepDive } from '../components/charts/DiseaseDeepDive';
import { OxidativeStressChart } from '../components/charts/OxidativeStressChart';
import { BloodParameterPanels } from '../components/charts/BloodParameterPanels';
import { PositiveWinsPanel } from '../components/charts/PositiveWinsPanel';
import { LeadershipTakeawaysSection } from '../components/charts/LeadershipTakeawaysSection';
import { SHOW_DASHBOARD_REFRESH, SHOW_EXECUTIVE_RANKING, SHOW_LEADERSHIP_TAKEAWAYS } from '../config/dashboard';
import { EMPLOYEES_CAMP_YEAR } from '../config/camp';
import type { GenderDistributionPair, PositiveWins } from '../types';
import './CampReportPage.css';

const EMPTY_GENDER_DISTRIBUTION: GenderDistributionPair = { male: [], female: [] };
const EMPTY_POSITIVE_WINS: PositiveWins = {
  lowRisk: [],
  healthyHabits: [],
  healthyProfiles: [],
};

function CampSectionTitle({ children }: { children: string }) {
  return (
    <div className="camp-section-title">
      <h2 className="camp-section-title__text">{children}</h2>
      <span className="camp-section-title__rule" aria-hidden />
    </div>
  );
}

export function CampReportPage() {
  const {
    selectedYear,
    setSelectedYear,
    yearOptions,
    selectedCity,
    setSelectedCity,
    locationOptions,
  } = useCamp();
  const { data: ranking, loading: rankingLoading, error: rankingError, refresh: refreshRanking } = useCampRanking();
  const {
    data: companyScores,
    loading: companyScoresLoading,
    error: companyScoresError,
    refresh: refreshCompanyScores,
  } = useCampCompanyAverageScores();
  const { data: apiKpis, refresh: refreshKpis } = useCampKpis();
  const {
    data: physicalActivity,
    loading: physicalLoading,
    error: physicalError,
    refresh: refreshPhysical,
  } = useCampPhysicalActivity();
  const { data: sleepQuality, loading: sleepLoading, error: sleepError, refresh: refreshSleep } = useCampSleep();
  const {
    data: riskLifestyle,
    loading: riskLifestyleLoading,
    error: riskLifestyleError,
    refresh: refreshRiskLifestyle,
  } = useCampRiskLifestyleByGender();
  const {
    data: bloodPanels,
    loading: bloodPanelsLoading,
    error: bloodPanelsError,
    refresh: refreshBlood,
  } = useCampBloodAndLabIntelligence();
  const {
    data: positiveWins,
    loading: positiveWinsLoading,
    error: positiveWinsError,
    refresh: refreshPositiveWins,
  } = useCampPositiveWins();
  const {
    data: oxidativeStress,
    loading: oxidativeLoading,
    error: oxidativeError,
    refresh: refreshOxidative,
  } = useCampOxidativeStress();

  const oxidativeData = oxidativeStress?.distribution ?? [];
  const oxidativeHeadcount =
    oxidativeStress?.totalEmployees ?? apiKpis?.employeesEnrolled;

  const scores = companyScores ?? { nutrition: 0, fitness: 0, lifestyle: 0 };
  const physical = physicalActivity ?? EMPTY_GENDER_DISTRIBUTION;
  const sleep = sleepQuality ?? EMPTY_GENDER_DISTRIBUTION;
  const topDiseases = riskLifestyle?.topHighRiskDiseases ?? [];
  const diseases = riskLifestyle?.diseases ?? [];
  const panels = bloodPanels ?? [];

  const sectionError =
    companyScoresError ||
    physicalError ||
    sleepError ||
    riskLifestyleError ||
    oxidativeError ||
    bloodPanelsError ||
    positiveWinsError ||
    (SHOW_EXECUTIVE_RANKING && rankingError) ||
    null;

  const handleRefresh = async () => {
    await Promise.all([
      refreshKpis(),
      refreshRanking(),
      refreshCompanyScores(),
      refreshPhysical(),
      refreshSleep(),
      refreshRiskLifestyle(),
      refreshOxidative(),
      refreshBlood(),
      refreshPositiveWins(),
    ]);
  };

  return (
    <div className="dashboard-page">
      <DashboardHeader
        title="HR health intelligence report"
        subtitle="Workforce wellness analysis"
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

      {SHOW_EXECUTIVE_RANKING && (
        <ExecutiveRankingCard
          ranking={ranking}
          rankingLoading={rankingLoading}
          selectedYear={selectedYear}
        />
      )}

      <CompanyAverageScores
        scores={scores}
        loading={companyScoresLoading}
        selectedYear={selectedYear}
      />

      <PhysicalSleepSegmentCharts
        physical={physical}
        sleep={sleep}
        loading={physicalLoading || sleepLoading}
        selectedYear={selectedYear}
      />

      <CampSectionTitle>Risks & Lifestyle</CampSectionTitle>
      {selectedYear === 'all' ? (
        <>
          <TopHighRiskDiseasesList
            diseases={topDiseases}
            loading={riskLifestyleLoading}
            selectedYear={selectedYear}
          />
          <DiseaseDeepDive
            diseases={diseases}
            loading={riskLifestyleLoading}
            selectedYear={selectedYear}
          />
        </>
      ) : (
        <div className="camp-risk-lifestyle-grid">
          <TopHighRiskDiseasesList
            diseases={topDiseases}
            loading={riskLifestyleLoading}
            selectedYear={selectedYear}
          />
          <DiseaseDeepDive
            diseases={diseases}
            loading={riskLifestyleLoading}
            selectedYear={selectedYear}
          />
        </div>
      )}

      <CampSectionTitle>Oxidative Stress</CampSectionTitle>
      <OxidativeStressChart
        data={oxidativeData}
        totalHeadcount={oxidativeHeadcount}
        loading={oxidativeLoading}
        selectedYear={selectedYear}
      />

      <CampSectionTitle>Blood & Lab Intelligence</CampSectionTitle>
      <BloodParameterPanels
        panels={panels}
        loading={bloodPanelsLoading}
        selectedYear={selectedYear}
      />

      <PositiveWinsPanel
        data={positiveWins ?? EMPTY_POSITIVE_WINS}
        loading={positiveWinsLoading}
        selectedYear={selectedYear}
      />

      {SHOW_LEADERSHIP_TAKEAWAYS && (
        <>
          <CampSectionTitle>Leadership Takeaways</CampSectionTitle>
          <LeadershipTakeawaysSection />
        </>
      )}
    </div>
  );
}
