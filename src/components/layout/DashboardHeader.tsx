import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import './DashboardHeader.css';

export const YEAR_OPTIONS = [
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: 'all', label: 'All Years' },
] as const;

export type YearOption = (typeof YEAR_OPTIONS)[number]['value'];

interface DashboardHeaderProps {
  onRefresh: () => void;
  updatedLabel?: string;
  selectedYear: YearOption;
  onYearChange: (year: YearOption) => void;
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({
  onRefresh,
  updatedLabel = 'Updated 2 hrs ago',
  selectedYear,
  onYearChange,
  title = 'HR health intelligence dashboard',
  subtitle = 'Workforce wellness analysis',
}: DashboardHeaderProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    window.setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__titles">
        <h1 className="dashboard-header__title">{title}</h1>
        <p className="dashboard-header__subtitle">{subtitle}</p>
      </div>

      <div className="dashboard-header__actions">
        <div className="dashboard-header__status-row">
          <button
            type="button"
            className="dashboard-header__refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={14}
              className={`dashboard-header__refresh-icon${refreshing ? ' dashboard-header__refresh-icon--spin' : ''}`}
              aria-hidden
            />
            <span>Refresh</span>
          </button>
          <div className="dashboard-header__updated">
            <span className="dashboard-header__updated-dot" aria-hidden />
            <span>{updatedLabel}</span>
          </div>
        </div>

        <div className="dashboard-header__years" role="tablist" aria-label="Year filter">
          {YEAR_OPTIONS.map((opt) => {
            const isActive = opt.value === selectedYear;
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`dashboard-header__year${isActive ? ' dashboard-header__year--active' : ''}`}
                onClick={() => onYearChange(opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
