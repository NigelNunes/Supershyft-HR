import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CHART_INFO } from '../content/chartInfo';
import { mockDashboard } from '../data/mockDashboard';
import { ChartCard } from '../components/ui/ChartCard';
import { InsightFooter } from '../components/ui/InsightFooter';
import './DepartmentsPage.css';

export function DepartmentsPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Departments</h1>
          <p>Select a department for detailed health insights</p>
        </div>
      </header>

      <div className="dept-grid">
        {mockDashboard.departments.map((dept) => (
          <Link key={dept.id} to={`/departments/${dept.id}`} className="dept-card">
            <div className="dept-card__header">
              <h3>{dept.name}</h3>
              <ChevronRight size={18} />
            </div>
            <div className="dept-card__stats">
              <div>
                <span className="dept-card__val">{dept.headcount}</span>
                <span className="dept-card__lbl">Employees</span>
              </div>
              <div>
                <span className="dept-card__val">{dept.enrolledPercent}%</span>
                <span className="dept-card__lbl">Enrolled</span>
              </div>
              <div>
                <span className="dept-card__val dept-card__val--risk">{dept.highRiskPercent}%</span>
                <span className="dept-card__lbl">High risk</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <ChartCard
        title="Department overview"
        info={CHART_INFO.departmentsOverview}
        insight={
          <InsightFooter
            tone="concern"
            text="Sales and Operations show the highest metabolic risk rates — consider targeted wellness programmes."
          />
        }
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Click any department card to view 4–5 detailed charts and insights for that team.
        </p>
      </ChartCard>
    </>
  );
}
