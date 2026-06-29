import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import './DepartmentsPage.css';

export function DepartmentsPage() {
  const { departments, loading, error, organizationName } = useOrganization();

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Departments</h1>
          <p>Select a department at {organizationName} for detailed health insights</p>
        </div>
      </header>

      <button type="button" className="dept-leaders-card" onClick={() => {}}>
        <div className="dept-leaders-card__header">
          <h2>Leaders</h2>
          <ChevronRight size={20} aria-hidden />
        </div>
      </button>

      {loading && <p className="dept-page-status">Loading departments…</p>}

      {error && (
        <p className="dept-page-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && departments.length === 0 && (
        <p className="dept-page-status">No departments configured for this organization.</p>
      )}

      <div className="dept-grid">
        {departments.map((dept) => (
          <Link key={dept.slug} to={`/departments/${dept.slug}`} className="dept-card">
            <div className="dept-card__header">
              <h3>{dept.department}</h3>
              <ChevronRight size={18} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
