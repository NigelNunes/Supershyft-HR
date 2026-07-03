import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useCampParticipants } from '../hooks/useCampParticipants';
import './EmployeesPage.css';

function normalizeNameSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function matchesEmployeeName(name: string, query: string): boolean {
  const normalizedQuery = normalizeNameSearch(query);
  if (!normalizedQuery) return true;

  const normalizedName = normalizeNameSearch(name);
  if (!normalizedName || normalizedName === '—') return false;

  if (normalizedName.includes(normalizedQuery)) return true;

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return tokens.every((token) => normalizedName.includes(token));
}

export function EmployeesPage() {
  const [query, setQuery] = useState('');
  const { employees, loading, error } = useCampParticipants();

  const filtered = useMemo(
    () => employees.filter((employee) => matchesEmployeeName(employee.name, query)),
    [employees, query],
  );

  const isSearching = query.trim().length > 0;
  const participantCount = employees.length;

  return (
    <div className="employees-page">
      <header className="page-header">
        <div>
          <h1>All employees</h1>
          <p>
            {loading
              ? 'Loading participants…'
              : isSearching
                ? `${filtered.length} of ${participantCount} shown`
                : `${participantCount.toLocaleString()} participants · contact & blood group`}
          </p>
        </div>
      </header>

      {error && (
        <p className="dashboard-api-error" role="alert">
          {error}
        </p>
      )}

      <label className="employees-search">
        <Search size={18} className="employees-search__icon" aria-hidden />
        <input
          type="text"
          placeholder="Search by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search employees by name"
          disabled={loading}
        />
      </label>

      <div className="employees-table-wrap">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Blood group</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody key={query.trim().toLowerCase()}>
            {loading ? (
              <tr>
                <td colSpan={5} className="employees-loading">
                  Loading employees…
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td className="mono">{emp.phone}</td>
                  <td>{emp.gender}</td>
                  <td>
                    <span className="blood-badge">{emp.bloodGroup}</span>
                  </td>
                  <td>{emp.department}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="employees-empty">No employees match that name.</p>
        )}
      </div>
    </div>
  );
}
