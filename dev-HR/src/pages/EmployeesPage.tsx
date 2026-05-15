import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { mockDashboard } from '../data/mockDashboard';
import './EmployeesPage.css';

export function EmployeesPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockDashboard.employees;
    return mockDashboard.employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        e.department.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>All employees</h1>
          <p>{mockDashboard.employees.length} participants · contact & blood group</p>
        </div>
      </header>

      <div className="employees-toolbar">
        <Search size={18} className="employees-search-icon" />
        <input
          type="search"
          placeholder="Search by name, email, phone, or department…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search employees"
        />
      </div>

      <div className="employees-table-wrap">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Blood group</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td className="mono">{emp.phone}</td>
                <td>{emp.email}</td>
                <td><span className="blood-badge">{emp.bloodGroup}</span></td>
                <td>{emp.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="employees-empty">No employees match your search.</p>
        )}
      </div>
    </>
  );
}
