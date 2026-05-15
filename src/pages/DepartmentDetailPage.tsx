import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_INFO } from '../content/chartInfo';
import { getDepartmentDetail } from '../data/mockDashboard';
import { ChartCard } from '../components/ui/ChartCard';
import { InsightFooter } from '../components/ui/InsightFooter';
import { KpiCard } from '../components/ui/KpiCard';
import { OxidativeStressChart } from '../components/charts/OxidativeStressChart';
import { useChartTheme } from '../components/charts/chartTheme';
import { pctTooltip } from '../components/charts/tooltipFormat';
import { Activity, AlertTriangle, Moon, Stethoscope } from 'lucide-react';

export function DepartmentDetailPage() {
  const chart = useChartTheme();
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

  const riskChartData = detail.riskHighlights.map((r) => ({
    name: r.disease,
    percent: r.percent,
  }));

  const oxSingle = [detail.oxidativeStress];

  return (
    <>
      <header className="page-header">
        <div>
          <Link to="/departments" className="back-link">
            <ArrowLeft size={16} /> Departments
          </Link>
          <h1>{detail.name}</h1>
          <p>{detail.headcount} employees · department health profile</p>
        </div>
      </header>

      <div className="kpi-grid">
        <KpiCard label="Enrolled" value={detail.kpis[0]?.value ?? '—'} sub={detail.kpis[0]?.sub} icon={Activity} variant="blue" />
        <KpiCard label="High risk" value={detail.kpis[1]?.value ?? '—'} sub={detail.kpis[1]?.sub} icon={AlertTriangle} variant="red" />
        <KpiCard label="Consults" value={detail.kpis[2]?.value ?? '—'} sub={detail.kpis[2]?.sub} icon={Stethoscope} variant="amber" />
        <KpiCard label="Sleep" value={detail.kpis[3]?.value ?? '—'} sub={detail.kpis[3]?.sub} icon={Moon} variant="green" />
      </div>

      <div className="grid-2">
        <ChartCard
          title="Top disease risks"
          info={CHART_INFO.deptTopRisks}
          insight={<InsightFooter tone="neutral" text={detail.lifestyleInsight} />}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
              <XAxis dataKey="name" tick={chart.tick(10)} />
              <YAxis tick={chart.tick(11)} />
              <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
              <Bar dataKey="percent" fill={chart.colors.danger} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Enrollment vs high-risk"
          info={CHART_INFO.deptEnrollmentVsRisk}
          insight={
            <InsightFooter
              tone={detail.highRiskPercent > 25 ? 'concern' : 'positive'}
              text={`${detail.enrolledPercent}% enrolled; ${detail.highRiskPercent}% in high metabolic risk.`}
            />
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                { label: 'Enrolled', value: detail.enrolledPercent },
                { label: 'High risk', value: detail.highRiskPercent },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
              <XAxis dataKey="label" tick={chart.tick(12)} />
              <YAxis domain={[0, 100]} tick={chart.tick(11)} />
              <Tooltip {...chart.tooltipProps} formatter={pctTooltip} />
              <Bar dataKey="value" fill={chart.colors.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <OxidativeStressChart data={oxSingle} />
      </div>
    </>
  );
}
