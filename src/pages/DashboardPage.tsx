import { useMemo, useState } from 'react';
import { Stethoscope, Users, AlertTriangle, Droplets } from 'lucide-react';
import { getDashboardForToggle, mockDashboard } from '../data/mockDashboard';
import { KpiCard } from '../components/ui/KpiCard';
import { DimensionToggle } from '../components/ui/DimensionToggle';
import { DiseaseDeepDive } from '../components/charts/DiseaseDeepDive';
import { OxidativeStressChart } from '../components/charts/OxidativeStressChart';
import { BloodParameterPanels } from '../components/charts/BloodParameterPanels';
import { GenderComparisonChart } from '../components/charts/GenderComparisonChart';
import { MetabolicAgeChart } from '../components/charts/MetabolicAgeChart';
import { BloodGroupHeatmap } from '../components/charts/BloodGroupHeatmap';
import { KeyInsightsSection } from '../components/charts/KeyInsightsSection';
import { ParticipationCharts } from '../components/charts/ParticipationCharts';
import { TopHighRiskDiseasesChart } from '../components/charts/TopHighRiskDiseasesChart';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';
import { OverallRiskScoreChart } from '../components/charts/OverallRiskScoreChart';
import { PhysicalSleepPieCharts } from '../components/charts/PhysicalSleepPieCharts';
import { PositiveWinsPanel } from '../components/charts/PositiveWinsPanel';
import type { ToggleDimension } from '../types';

export function DashboardPage() {
  const [dimension, setDimension] = useState<ToggleDimension>('gender');
  const toggled = useMemo(() => getDashboardForToggle(dimension), [dimension]);
  const d = mockDashboard;
  const { kpis, org } = d;

  return (
    <div className="dashboard-page">
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
          label="Employees Enrolled"
          value={kpis.employeesEnrolled.toLocaleString()}
          sub="Completed wellness camp enrollment"
          icon={Users}
          variant="green"
        />
        <KpiCard
          label="Total Blood test"
          value={kpis.totalBloodTest.toLocaleString()}
          sub={`${Math.round((kpis.totalBloodTest / kpis.employeesEnrolled) * 100)}% of enrolled`}
          icon={Droplets}
          variant="blue"
        />
        <KpiCard
          label="Doctor consultation"
          value={kpis.doctorConsultation.toLocaleString()}
          sub="Enrolled for consultation"
          icon={Stethoscope}
          variant="amber"
        />
        <KpiCard
          label="High Risk Group"
          value={kpis.highRiskGroup.toLocaleString()}
          sub="Metabolic age ≥3 years above actual"
          icon={AlertTriangle}
          variant="red"
        />
      </div>

      <ParticipationCharts byAge={d.participationByAge} byGender={d.participationByGender} />

      <div className="grid-2">
        <MetabolicAgeChart data={d.metabolicAge} />
        <TopHighRiskDiseasesChart diseases={d.topHighRiskDiseases} />
      </div>

      <CompanyAverageScores scores={d.companyScores} />

      <OverallRiskScoreChart buckets={d.overallRiskScore} />

      <PhysicalSleepPieCharts
        physical={d.physicalActivityByGender}
        sleep={d.sleepQualityByGender}
      />

      <div className="section-title">Risk & lifestyle</div>
      <div className="dashboard-toolbar">
        <DimensionToggle value={dimension} onChange={setDimension} />
      </div>
      <DiseaseDeepDive diseases={toggled.diseases} dimension={dimension} />

      <div className="section-title">Oxidative stress</div>
      <OxidativeStressChart data={d.oxidativeStress} />

      <div className="section-title">Blood & lab intelligence</div>
      <BloodGroupHeatmap rows={d.bloodGroupHeatmap} groupNames={d.bloodGroupNames} />
      <BloodParameterPanels panels={d.bloodPanels} />

      <div className="section-title">Gender comparison</div>
      <GenderComparisonChart data={d.genderComparison} />

      <div className="section-title">Positive wins</div>
      <PositiveWinsPanel data={d.positiveWins} />

      <KeyInsightsSection data={d.keyInsights} />
    </div>
  );
}
