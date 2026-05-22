import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Users, AlertTriangle, Gauge } from 'lucide-react';
import { getDepartmentDetail } from '../data/mockDashboard';
import { CHART_INFO } from '../content/chartInfo';
import { KpiCard } from '../components/ui/KpiCard';
import { DeptLifestylePieCharts } from '../components/charts/DeptLifestylePieCharts';
import { OxidativeStressPieChart } from '../components/charts/OxidativeStressPieChart';
import { CompanyAverageScores } from '../components/charts/CompanyAverageScores';

function formatDeptGender(male: number, female: number): string {
  return `M: ${male.toLocaleString()} · F: ${female.toLocaleString()}`;
}

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const detail = id ? getDepartmentDetail(id) : null;

  if (!detail) {
    return (
      <div className="page-header">
        <h1>Department not found</h1>
        <Link to="/departments">← Back to departments</Link>
      </div>
    );
  }

  const { genderBreakdown } = detail;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <Link to="/departments" className="back-link">
            <ArrowLeft size={16} /> Departments
          </Link>
          <h1>{detail.name}</h1>
          <p>Department health profile</p>
        </div>
      </header>

      <div className="kpi-grid kpi-grid--3">
        <KpiCard
          label="Employees"
          value={detail.headcount.toLocaleString()}
          sub={formatDeptGender(genderBreakdown.male, genderBreakdown.female)}
          icon={Users}
          variant="green"
        />
        <KpiCard
          label="High risk"
          value={`${detail.highRiskPercent}%`}
          sub="Metabolic age ≥3 yrs above actual"
          icon={AlertTriangle}
          variant="red"
        />
        <KpiCard
          label="Average risk score"
          value={Math.round(detail.avgRiskScore).toString()}
          sub="Composite score (scale 0–100)"
          icon={Gauge}
          variant="amber"
        />
      </div>

      <CompanyAverageScores
        scores={detail.companyScores}
        title="Department average scores"
        subtitle="Nutrition · fitness · lifestyle (scale 0–100)"
        info={CHART_INFO.deptCompanyScores}
      />

      <DeptLifestylePieCharts data={detail.lifestyleDistribution} departmentName={detail.name} />

      <OxidativeStressPieChart data={detail.oxidativeStress} headcount={detail.headcount} />
    </div>
  );
}
