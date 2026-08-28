import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { CampYearChoice, CampYearOption } from '../../utils/campYears';
import { LocationDropdown, type LocationOption } from '../ui/LocationDropdown';
import './DashboardHeader.css';

/** @deprecated Kept for DepartmentDetailPage fallback only */
export const YEAR_OPTIONS = [
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: 'all', label: 'All Years' },
] as const;

export type YearOption = CampYearOption;

interface DashboardHeaderProps {
  onRefresh: () => void | Promise<void>;
  selectedYear: YearOption;
  onYearChange: (year: YearOption) => void;
  yearOptions?: CampYearChoice[];
  title?: string;
  subtitle?: string;
  locationOptions?: LocationOption[];
  selectedLocation?: string;
  onLocationChange?: (locationId: string) => void;
  showLocationFilter?: boolean;
  showRefresh?: boolean;
}

export function DashboardHeader({
  onRefresh,
  selectedYear,
  onYearChange,
  yearOptions,
  title = 'HR health intelligence dashboard',
  subtitle = 'Workforce wellness analysis',
  locationOptions,
  selectedLocation,
  onLocationChange,
  showLocationFilter = true,
  showRefresh = true,
}: DashboardHeaderProps) {
  const [refreshing, setRefreshing] = useState(false);

  const options =
    yearOptions && yearOptions.length > 0
      ? yearOptions
      : selectedYear && selectedYear !== 'all'
        ? [{ value: selectedYear, label: selectedYear, campNo: null }]
        : [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch {
      // still stop the spinner on failure
    } finally {
      setRefreshing(false);
    }
  };

  // Options always include "Overall" + cities; hide when ≤1 city (no meaningful choice).
  const showLocation =
    showLocationFilter &&
    (locationOptions?.length ?? 0) > 2 &&
    selectedLocation != null &&
    onLocationChange != null;

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__titles">
        <h1 className="dashboard-header__title">{title}</h1>
        <div className="dashboard-header__subtitle-row">
          <p className="dashboard-header__subtitle">{subtitle}</p>
          {showLocation && (
            <LocationDropdown
              options={locationOptions}
              value={selectedLocation}
              onChange={onLocationChange}
              aria-label="City filter"
            />
          )}
        </div>
      </div>

      <div className="dashboard-header__actions">
        <div className="dashboard-header__status-row">
          {options.length > 0 && (
            <div className="dashboard-header__years" role="tablist" aria-label="Year filter">
              {options.map((opt) => {
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
          )}

          {showRefresh && (
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
          )}
        </div>
      </div>
    </header>
  );
}
