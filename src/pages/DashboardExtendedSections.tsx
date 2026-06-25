import { useMemo, useState } from 'react';
import { getDashboardForToggle, mockDashboard } from '../data/mockDashboard';
import { DimensionToggle } from '../components/ui/DimensionToggle';
import { DiseaseDeepDive } from '../components/charts/DiseaseDeepDive';
import { OxidativeStressChart } from '../components/charts/OxidativeStressChart';
import { BloodParameterPanels } from '../components/charts/BloodParameterPanels';
import { TopHighRiskDiseasesList } from '../components/charts/TopHighRiskDiseasesList';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';
import { PositiveWinsPanel } from '../components/charts/PositiveWinsPanel';
import type { ToggleDimension } from '../types';

/** Company average scores and all dashboard sections below it. */
export function DashboardExtendedSections() {
  const [dimension, setDimension] = useState<ToggleDimension>('gender');
  const toggled = useMemo(() => getDashboardForToggle(dimension), [dimension]);
  const d = mockDashboard;

  return (
    <>
      <CompanyAverageScores scores={d.companyScores} />

      <div className="section-title">Risk & lifestyle</div>
      <div className="dashboard-toolbar">
        <DimensionToggle value={dimension} onChange={setDimension} />
      </div>
      <div className="grid-2 grid-2--stretch">
        <TopHighRiskDiseasesList diseases={d.topHighRiskDiseases} />
        <DiseaseDeepDive diseases={toggled.diseases} dimension={dimension} />
      </div>

      <div className="section-title">Oxidative stress</div>
      <OxidativeStressChart data={d.oxidativeStress} departments={d.departments} />

      <div className="section-title">Blood & lab intelligence</div>
      <BloodParameterPanels panels={d.bloodPanels} />

      <div className="section-title">Positive wins</div>
      <PositiveWinsPanel data={d.positiveWins} />
    </>
  );
}
