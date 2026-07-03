import { mockDashboard } from '../data/mockDashboard';
import { SHOW_EXTENDED_DASHBOARD_SECTIONS } from '../config/dashboard';
import {
  useCampRiskLifestyleByGender,
  useCampOxidativeStress,
  useCampPositiveWins,
  useCampCompanyAverageScores,
  useCampBloodAndLabIntelligence,
} from '../hooks/useCampDashboard';
import { DiseaseDeepDive } from '../components/charts/DiseaseDeepDive';
import { OxidativeStressChart } from '../components/charts/OxidativeStressChart';
import { BloodParameterPanels } from '../components/charts/BloodParameterPanels';
import { TopHighRiskDiseasesList } from '../components/charts/TopHighRiskDiseasesList';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';
import { PositiveWinsPanel } from '../components/charts/PositiveWinsPanel';
import { LeadershipTakeawaysSection } from '../components/charts/LeadershipTakeawaysSection';

/** Dashboard sections below the main KPI / participation charts. */
export function DashboardExtendedSections() {
  const d = mockDashboard;
  const {
    data: riskLifestyle,
    loading: riskLifestyleLoading,
    error: riskLifestyleError,
  } = useCampRiskLifestyleByGender();
  const {
    data: oxidativeStress,
    loading: oxidativeLoading,
    error: oxidativeError,
  } = useCampOxidativeStress();
  const {
    data: positiveWins,
    loading: positiveWinsLoading,
    error: positiveWinsError,
  } = useCampPositiveWins();
  const {
    data: companyScores,
    loading: companyScoresLoading,
    error: companyScoresError,
  } = useCampCompanyAverageScores();
  const {
    data: bloodPanels,
    loading: bloodPanelsLoading,
    error: bloodPanelsError,
  } = useCampBloodAndLabIntelligence();

  const oxidativeData = oxidativeStress?.distribution ?? [];
  const oxidativeHeadcount = oxidativeStress?.totalEmployees;

  return (
    <>
      {SHOW_EXTENDED_DASHBOARD_SECTIONS && (
        <>
          {companyScoresError && (
            <p className="dashboard-api-error" role="alert">
              {companyScoresError}
            </p>
          )}
          <CompanyAverageScores
            scores={companyScores ?? { nutrition: 0, fitness: 0, lifestyle: 0 }}
            loading={companyScoresLoading}
          />
        </>
      )}

      <div className="section-title">Risk & lifestyle</div>
      {riskLifestyleError && (
        <p className="dashboard-api-error" role="alert">
          {riskLifestyleError}
        </p>
      )}
      <div className="grid-2 grid-2--stretch">
        <TopHighRiskDiseasesList
          diseases={riskLifestyle?.topHighRiskDiseases ?? []}
          loading={riskLifestyleLoading}
        />
        <DiseaseDeepDive
          diseases={riskLifestyle?.diseases ?? []}
          loading={riskLifestyleLoading}
        />
      </div>

      <div className="section-title">Oxidative stress</div>
      {oxidativeError && (
        <p className="dashboard-api-error" role="alert">
          {oxidativeError}
        </p>
      )}
      <OxidativeStressChart
        data={oxidativeData.length > 0 ? oxidativeData : d.oxidativeStress}
        departments={d.departments}
        totalHeadcount={oxidativeHeadcount}
        loading={oxidativeLoading}
      />

      {SHOW_EXTENDED_DASHBOARD_SECTIONS && (
        <>
          <div className="section-title">Blood & lab intelligence</div>
          {bloodPanelsError && (
            <p className="dashboard-api-error" role="alert">
              {bloodPanelsError}
            </p>
          )}
          <BloodParameterPanels panels={bloodPanels ?? []} loading={bloodPanelsLoading} />
        </>
      )}

      <div className="section-title">Positive wins</div>
      {positiveWinsError && (
        <p className="dashboard-api-error" role="alert">
          {positiveWinsError}
        </p>
      )}
      <PositiveWinsPanel
        data={
          positiveWins ?? { lowRisk: [], healthyHabits: [], healthyProfiles: [] }
        }
        loading={positiveWinsLoading}
      />

      <LeadershipTakeawaysSection />
    </>
  );
}
