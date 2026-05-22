import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { mockDashboard } from '../data/mockDashboard';
import type { EmployeeRecord } from '../types';
import './EmployeesPage.css';

function matchesEmployee(employee: EmployeeRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const phoneDigits = employee.phone.replace(/\D/g, '');
  const qDigits = q.replace(/\D/g, '');

  return (
    employee.name.toLowerCase().includes(q) ||
    employee.gender.toLowerCase().includes(q) ||
    employee.department.toLowerCase().includes(q) ||
    employee.bloodGroup.toLowerCase().includes(q) ||
    employee.email.toLowerCase().includes(q) ||
    employee.id.toLowerCase().includes(q) ||
    employee.phone.includes(q) ||
    (qDigits.length > 0 && phoneDigits.includes(qDigits))
  );
}

export function EmployeesPage() {
  const [query, setQuery] = useState('');
  const employees = mockDashboard.employees;

  const filtered = useMemo(
    () => employees.filter((e) => matchesEmployee(e, query)),
    [employees, query],
  );

  const isSearching = query.trim().length > 0;

  return (
    <div className="employees-page">
      <header className="page-header">
        <div>
          <h1>All employees</h1>
          <p>
            {isSearching
              ? `${filtered.length} of ${employees.length} shown`
              : `${employees.length} participants · contact & blood group`}
          </p>
        </div>
      </header>

      <label className="employees-search">
        <Search size={18} className="employees-search__icon" aria-hidden />
        <input
          type="text"
          placeholder="Search by name, department, phone, email, blood group…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search employees"
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
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td className="mono">{emp.phone}</td>
                <td>{emp.gender}</td>
                <td>
                  <span className="blood-badge">{emp.bloodGroup}</span>
                </td>
                <td>{emp.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="employees-empty">No employees match your search.</p>
        )}
      </div>
    </div>
  );
}
