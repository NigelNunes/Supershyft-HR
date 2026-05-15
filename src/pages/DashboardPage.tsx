import { useMemo, useState } from 'react';
import { Activity, Stethoscope, Users, AlertTriangle } from 'lucide-react';
import { getDashboardForToggle, mockDashboard } from '../data/mockDashboard';
import { KpiCard } from '../components/ui/KpiCard';
import { DimensionToggle } from '../components/ui/DimensionToggle';
import { DiseaseDeepDive } from '../components/charts/DiseaseDeepDive';
import { LifestyleCharts } from '../components/charts/LifestyleCharts';
import { OxidativeStressChart } from '../components/charts/OxidativeStressChart';
import { BloodParameterPanels } from '../components/charts/BloodParameterPanels';
import { GenderComparisonChart } from '../components/charts/GenderComparisonChart';
import { MetabolicAgeChart } from '../components/charts/MetabolicAgeChart';
import { PositiveWinsPanel } from '../components/charts/PositiveWinsPanel';
import { NutritionMacroChart } from '../components/charts/NutritionMacroChart';
import { BmiWaistChart } from '../components/charts/BmiWaistChart';
import { BloodGroupHeatmap } from '../components/charts/BloodGroupHeatmap';
import { TopAbnormalMarkers } from '../components/charts/TopAbnormalMarkers';
import { KeyInsightsSection } from '../components/charts/KeyInsightsSection';
import type { ToggleDimension } from '../types';

export function DashboardPage() {
  const [dimension, setDimension] = useState<ToggleDimension>('gender');
  const toggled = useMemo(() => getDashboardForToggle(dimension), [dimension]);
  const d = mockDashboard;
  const { kpis, org } = d;

  return (
    <>
      <header className="page-header">
        <div>
          <h1>HR health intelligence dashboard</h1>
          <p>Workforce wellness analysis · {org.campYear} annual report</p>
        </div>
        <span className="badge-live">
          <span className="dot" />
          Live data
        </span>
      </header>

      <div className="kpi-grid">
        <KpiCard
          label="Total employees"
          value={kpis.totalEmployees.toLocaleString()}
          sub="Across all departments"
          icon={Users}
          variant="green"
        />
        <KpiCard
          label="Enrolled for test"
          value={kpis.enrolledForTest.toLocaleString()}
          sub={`${Math.round((kpis.enrolledForTest / kpis.totalEmployees) * 100)}% participation`}
          icon={Activity}
          variant="blue"
        />
        <KpiCard
          label="High-risk group"
          value={kpis.highRiskGroup.toLocaleString()}
          sub="Metabolic age ≥3 years above actual"
          icon={AlertTriangle}
          variant="red"
        />
        <KpiCard
          label="Doctor consultation"
          value={kpis.enrolledForDoctorConsultation.toLocaleString()}
          sub="Enrolled for consultation"
          icon={Stethoscope}
          variant="amber"
        />
      </div>

      <div className="section-title">Workforce health profile</div>
      <div className="grid-2">
        <MetabolicAgeChart data={d.metabolicAge} />
        <PositiveWinsPanel data={d.positiveWins} />
      </div>
      <div className="grid-2 stack-spacer">
        <NutritionMacroChart data={d.nutrition} />
        <BmiWaistChart data={d.bmiWaist} />
      </div>

      <div className="section-title">Risk & lifestyle</div>
      <div className="dashboard-toolbar">
        <DimensionToggle value={dimension} onChange={setDimension} />
      </div>
      <DiseaseDeepDive diseases={toggled.diseases} dimension={dimension} />
      <div className="stack-spacer">
        <LifestyleCharts indicators={toggled.lifestyle} dimension={dimension} />
      </div>

      <div className="section-title">Oxidative stress</div>
      <OxidativeStressChart data={d.oxidativeStress} />

      <div className="section-title">Blood & lab intelligence</div>
      <BloodGroupHeatmap rows={d.bloodGroupHeatmap} groupNames={d.bloodGroupNames} />
      <div className="stack-spacer">
        <TopAbnormalMarkers markers={d.abnormalMarkers} />
      </div>
      <div className="stack-spacer">
        <BloodParameterPanels panels={d.bloodPanels} />
      </div>

      <div className="section-title">Gender comparison</div>
      <GenderComparisonChart data={d.genderComparison} />

      <KeyInsightsSection data={d.keyInsights} />
    </>
  );
}
