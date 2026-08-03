import { mockDashboard } from '../data/mockDashboard';
import { useCampOxidativeStress } from '../hooks/useCampDashboard';
import { OxidativeStressChart } from '../components/charts/OxidativeStressChart';
import { LeadershipTakeawaysSection } from '../components/charts/LeadershipTakeawaysSection';

/** Dashboard sections below the main KPI / participation charts. */
export function DashboardExtendedSections() {
  const d = mockDashboard;
  const {
    data: oxidativeStress,
    loading: oxidativeLoading,
    error: oxidativeError,
  } = useCampOxidativeStress();

  const oxidativeData = oxidativeStress?.distribution ?? [];
  const oxidativeHeadcount = oxidativeStress?.totalEmployees;

  return (
    <>
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

      <LeadershipTakeawaysSection />
    </>
  );
}
