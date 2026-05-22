import { CHART_INFO } from '../content/chartInfo';
import { mockDashboard } from '../data/mockDashboard';
import { KeyInsightsSection } from '../components/charts/KeyInsightsSection';
import { InfoTooltip } from '../components/ui/InfoTooltip';

export function KeyInsightsPage() {
  const { keyInsights, org } = mockDashboard;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1 className="page-header__title-with-info">
            Key insights & recommendations
            <InfoTooltip text={CHART_INFO.keyInsights} />
          </h1>
          <p>Evidence-based actions from {org.campYear} workforce health camp</p>
        </div>
      </header>

      <KeyInsightsSection data={keyInsights} hideHeader />
    </div>
  );
}
