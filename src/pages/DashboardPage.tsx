import { useMemo, useState } from 'react';
import { Stethoscope, Users, AlertTriangle, Droplets } from 'lucide-react';
import { getDashboardForToggle, mockDashboard } from '../data/mockDashboard';
import { KpiCard } from '../components/ui/KpiCard';
import { DimensionToggle } from '../components/ui/DimensionToggle';
import { DiseaseDeepDive } from '../components/charts/DiseaseDeepDive';
import { OxidativeStressChart } from '../components/charts/OxidativeStressChart';
import { BloodParameterPanels } from '../components/charts/BloodParameterPanels';
import { ParticipationCharts } from '../components/charts/ParticipationCharts';
import { TopHighRiskDiseasesList } from '../components/charts/TopHighRiskDiseasesList';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';
import { OverallRiskScoreChart } from '../components/charts/OverallRiskScoreChart';
import { PhysicalSleepPieCharts } from '../components/charts/PhysicalSleepPieCharts';
import { PositiveWinsPanel } from '../components/charts/PositiveWinsPanel';
import type { ToggleDimension } from '../types';

function formatGenderBreakdown(
  byGender: { gender: string; enrolled: number }[],
): string {
  const male = byGender.find((g) => g.gender === 'Male')?.enrolled;
  const female = byGender.find((g) => g.gender === 'Female')?.enrolled;
  if (male == null || female == null) return 'Completed wellness camp enrollment';
  return `M: ${male.toLocaleString()} · F: ${female.toLocaleString()}`;
}

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
          sub={formatGenderBreakdown(d.participationByGender)}
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

      <div className="grid-2 distribution-pair-row">
        <ParticipationCharts byAge={d.participationByAge} />
        <OverallRiskScoreChart buckets={d.overallRiskScore} />
      </div>

      <CompanyAverageScores scores={d.companyScores} />

      <PhysicalSleepPieCharts
        physical={d.physicalActivityByGender}
        sleep={d.sleepQualityByGender}
      />

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
    </div>
  );
}
