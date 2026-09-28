import {
  useCampBloodAndLabIntelligence,
  useCampCompanyAverageScores,
  useCampKpis,
  useCampOxidativeStress,
  useCampPhysicalActivity,
  useCampPositiveWins,
  useCampRanking,
  useCampRiskLifestyleByGender,
  useCampSleep,
  useCampStateDiseaseBenchmark,
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
import { StateDiseaseBenchmarkChart } from '../components/charts/StateDiseaseBenchmarkChart';
import { LeadershipTakeawaysSection } from '../components/charts/LeadershipTakeawaysSection';
import { ProgressiveSection, SectionError } from '../components/ui/ProgressiveSection';
import { SHOW_DASHBOARD_REFRESH, SHOW_EXECUTIVE_RANKING, SHOW_LEADERSHIP_TAKEAWAYS } from '../config/dashboard';
import { refreshMountedSections, useRegisterSectionRefresh } from '../utils/mountedSectionRefresh';
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

function RankingSection() {
  const { selectedYear } = useCamp();
  const { data: ranking, loading, error, refresh } = useCampRanking();
  useRegisterSectionRefresh(refresh);

  return (
    <>
      <SectionError error={error} selectedYear={selectedYear} />
      <ExecutiveRankingCard
        ranking={ranking}
        rankingLoading={loading}
        selectedYear={selectedYear}
      />
    </>
  );
}

function CompanyScoresSection() {
  const { selectedYear } = useCamp();
  const { data, loading, error, refresh } = useCampCompanyAverageScores();
  useRegisterSectionRefresh(refresh);

  return (
    <>
      <SectionError error={error} selectedYear={selectedYear} />
      <CompanyAverageScores
        scores={data ?? { nutrition: 0, fitness: 0, lifestyle: 0 }}
        loading={loading}
        selectedYear={selectedYear}
      />
    </>
  );
}

function ActivitySection() {
  const { selectedYear } = useCamp();
  const { data: physicalActivity, loading: physicalLoading, error: physicalError, refresh: refreshPhysical } =
    useCampPhysicalActivity();
  const { data: sleepQuality, loading: sleepLoading, error: sleepError, refresh: refreshSleep } =
    useCampSleep();
  useRegisterSectionRefresh(refreshPhysical);
  useRegisterSectionRefresh(refreshSleep);

  return (
    <>
      <SectionError error={physicalError || sleepError} selectedYear={selectedYear} />
      <PhysicalSleepSegmentCharts
        physical={physicalActivity ?? EMPTY_GENDER_DISTRIBUTION}
        sleep={sleepQuality ?? EMPTY_GENDER_DISTRIBUTION}
        loading={physicalLoading || sleepLoading}
        selectedYear={selectedYear}
      />
    </>
  );
}

function RiskLifestyleSection() {
  const { selectedYear } = useCamp();
  const { data, loading, error, refresh } = useCampRiskLifestyleByGender();
  useRegisterSectionRefresh(refresh);

  const topDiseases = data?.topHighRiskDiseases ?? [];
  const diseases = data?.diseases ?? [];
  const charts = (
    <>
      <TopHighRiskDiseasesList
        diseases={topDiseases}
        intelligence={data?.diseaseRisksIntelligence}
        loading={loading}
        selectedYear={selectedYear}
      />
      <DiseaseDeepDive diseases={diseases} loading={loading} selectedYear={selectedYear} />
    </>
  );

  return (
    <>
      <SectionError error={error} selectedYear={selectedYear} />
      <CampSectionTitle>Risks & Lifestyle</CampSectionTitle>
      {selectedYear === 'all' ? charts : <div className="camp-risk-lifestyle-grid">{charts}</div>}
    </>
  );
}

function OxidativeSection() {
  const { selectedYear } = useCamp();
  const { data: apiKpis, refresh: refreshKpis } = useCampKpis();
  const { data, loading, error, refresh } = useCampOxidativeStress();
  useRegisterSectionRefresh(refreshKpis);
  useRegisterSectionRefresh(refresh);

  return (
    <>
      <SectionError error={error} selectedYear={selectedYear} />
      <CampSectionTitle>Oxidative Stress</CampSectionTitle>
      <OxidativeStressChart
        data={data?.distribution ?? []}
        intelligence={data?.intelligence}
        totalHeadcount={data?.totalEmployees ?? apiKpis?.employeesEnrolled}
        loading={loading}
        selectedYear={selectedYear}
      />
    </>
  );
}

function BloodSection() {
  const { selectedYear } = useCamp();
  const { data, loading, error, refresh } = useCampBloodAndLabIntelligence();
  useRegisterSectionRefresh(refresh);

  return (
    <>
      <SectionError error={error} selectedYear={selectedYear} />
      <CampSectionTitle>Blood & Lab Intelligence</CampSectionTitle>
      <BloodParameterPanels panels={data ?? []} loading={loading} selectedYear={selectedYear} />
    </>
  );
}

function StateBenchmarkSection() {
  const { selectedYear } = useCamp();
  const { data, loading, error, refresh } = useCampStateDiseaseBenchmark();
  useRegisterSectionRefresh(refresh);

  return (
    <>
      <SectionError error={error} selectedYear={selectedYear} />
      <StateDiseaseBenchmarkChart data={data} loading={loading} selectedYear={selectedYear} />
    </>
  );
}

function PositiveWinsSection() {
  const { selectedYear } = useCamp();
  const { data, loading, error, refresh } = useCampPositiveWins();
  useRegisterSectionRefresh(refresh);

  return (
    <>
      <SectionError error={error} selectedYear={selectedYear} />
      <PositiveWinsPanel
        data={data ?? EMPTY_POSITIVE_WINS}
        loading={loading}
        selectedYear={selectedYear}
      />
    </>
  );
}

function LeadershipSection() {
  return (
    <>
      <CampSectionTitle>Leadership Takeaways</CampSectionTitle>
      <LeadershipTakeawaysSection />
    </>
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

  return (
    <div className="dashboard-page">
      <DashboardHeader
        title="HR health intelligence report"
        subtitle="Workforce wellness analysis"
        onRefresh={refreshMountedSections}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        yearOptions={yearOptions}
        locationOptions={locationOptions}
        selectedLocation={selectedCity}
        onLocationChange={setSelectedCity}
        showRefresh={SHOW_DASHBOARD_REFRESH}
      />

      {SHOW_EXECUTIVE_RANKING && (
        <ProgressiveSection eager minHeight="12rem" label="Loading executive ranking">
          <RankingSection />
        </ProgressiveSection>
      )}

      <ProgressiveSection eager minHeight="16rem" label="Loading company scores">
        <CompanyScoresSection />
      </ProgressiveSection>

      <ProgressiveSection minHeight="22rem" label="Loading activity and sleep">
        <ActivitySection />
      </ProgressiveSection>

      <ProgressiveSection minHeight="36rem" label="Loading disease risk">
        <RiskLifestyleSection />
      </ProgressiveSection>

      <ProgressiveSection minHeight="18rem" label="Loading oxidative stress">
        <OxidativeSection />
      </ProgressiveSection>

      <ProgressiveSection minHeight="18rem" label="Loading blood and lab intelligence">
        <BloodSection />
      </ProgressiveSection>

      <ProgressiveSection minHeight="22rem" label="Loading state disease benchmark">
        <StateBenchmarkSection />
      </ProgressiveSection>

      <ProgressiveSection minHeight="16rem" label="Loading positive wins">
        <PositiveWinsSection />
      </ProgressiveSection>

      {SHOW_LEADERSHIP_TAKEAWAYS && (
        <ProgressiveSection minHeight="16rem" label="Loading leadership takeaways">
          <LeadershipSection />
        </ProgressiveSection>
      )}
    </div>
  );
}
