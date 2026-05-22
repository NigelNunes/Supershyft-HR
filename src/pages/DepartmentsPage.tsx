import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { mockDashboard } from '../data/mockDashboard';
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

      <button type="button" className="dept-leaders-card" onClick={() => {}}>
        <div className="dept-leaders-card__header">
          <h2>Leaders</h2>
          <ChevronRight size={20} aria-hidden />
        </div>
      </button>

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
                <span className="dept-card__val dept-card__val--risk">{dept.highRiskPercent}%</span>
                <span className="dept-card__lbl">High risk</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
