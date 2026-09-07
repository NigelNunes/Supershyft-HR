import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseMedical,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Droplets,
  FileText,
  RefreshCw,
  Search,
  Share2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import {
  PARTICIPANTS_PAGE_SIZE,
  useCampParticipants,
} from '../hooks/useCampParticipants';
import { useCampKpis } from '../hooks/useCampDashboard';
import { useCamp } from '../contexts/CampContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { LocationDropdown } from '../components/ui/LocationDropdown';
import { EMPLOYEES_CAMP_YEAR } from '../config/camp';
import { formatDepartmentLabel, formatEmployeeIdLabel, hasDisplayDepartment } from '../services/campParticipantsMappers';
import {
  downloadParticipantsExcel,
  participantsExcelFileName,
} from '../utils/downloadParticipantsExcel';
import type { EmployeeRecord, JourneyStepId, JourneyStepStatus } from '../types';
import anthropometryIconUrl from '../assets/icons/journey-anthropometry.png';
import vitalsIconUrl from '../assets/icons/journey-vitals.png';
import dietLifestyleIconUrl from '../assets/icons/journey-diet-lifestyle.png';
import './EmployeesPage.css';

const PAGE_SIZE = PARTICIPANTS_PAGE_SIZE;

const INTAKE_ICON_URLS: Partial<Record<JourneyStepId, string>> = {
  anthropometry: anthropometryIconUrl,
  vitals: vitalsIconUrl,
  dietLifestyle: dietLifestyleIconUrl,
};

const JOURNEY_COLUMNS: {
  id: JourneyStepId;
  label: string;
  group: 'intake' | 'blood' | 'bioai' | 'consult';
  badge?: 'blood' | 'blood-ai' | 'bioai' | 'bioai-ai';
}[] = [
  { id: 'anthropometry', label: 'Anthropometry', group: 'intake' },
  { id: 'vitals', label: 'Vital', group: 'intake' },
  { id: 'dietLifestyle', label: 'Lifestyle', group: 'intake' },
  { id: 'bloodReport', label: 'Blood Report', group: 'blood', badge: 'blood' },
  { id: 'bloodReportAi', label: 'Blood Report Sent', group: 'blood', badge: 'blood-ai' },
  { id: 'bioAiReport', label: 'Bio-Ai Report', group: 'bioai', badge: 'bioai' },
  { id: 'bioAiShared', label: 'Bio-Ai Report Sent', group: 'bioai', badge: 'bioai-ai' },
  { id: 'consultations', label: 'Consultations', group: 'consult' },
];

type FilterStep = {
  id: JourneyStepId;
  label: string;
  iconUrl?: string;
  Icon?: typeof Droplets;
};

const FILTER_STEPS: FilterStep[] = [
  { id: 'anthropometry', label: 'Anthropometry', iconUrl: anthropometryIconUrl },
  { id: 'vitals', label: 'Vitals', iconUrl: vitalsIconUrl },
  { id: 'dietLifestyle', label: 'Diet & Lifestyle', iconUrl: dietLifestyleIconUrl },
  { id: 'bloodReport', label: 'Blood Tests', Icon: Droplets },
  { id: 'bioAiReport', label: 'Bio-AI Reports', Icon: FileText },
  { id: 'consultations', label: 'Consultations', Icon: BriefcaseMedical },
];

const SUMMARY_FILTER_STEPS: { id: JourneyStepId; cardLabel: string }[] = [
  { id: 'bloodReport', cardLabel: 'Blood Tests' },
  { id: 'dietLifestyle', cardLabel: 'Questionnaires' },
  { id: 'bioAiReport', cardLabel: 'Bio-AI Reports' },
  { id: 'consultations', cardLabel: 'Consultations' },
];

function filterStepLabel(stepId: string): string {
  return FILTER_STEPS.find((s) => s.id === stepId)?.label
    ?? SUMMARY_FILTER_STEPS.find((s) => s.id === stepId)?.cardLabel
    ?? stepId;
}

function JourneyAssetIcon({
  src,
  label,
  className = 'emp-journey-asset',
}: {
  src: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      role="img"
      aria-label={label}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}

type StepFilterValue = 'any' | 'completed' | 'pending';

function normalizeNameSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function matchesEmployeeName(name: string, query: string): boolean {
  const normalizedQuery = normalizeNameSearch(query);
  if (!normalizedQuery) return true;
  const normalizedName = normalizeNameSearch(name);
  if (!normalizedName || normalizedName === '-' || normalizedName === '—') return false;
  if (normalizedName.includes(normalizedQuery)) return true;
  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return tokens.every((token) => normalizedName.includes(token));
}

function StatusIcon({ status }: { status: JourneyStepStatus }) {
  if (status === 'completed') {
    return <Check className="emp-status emp-status--done" size={18} strokeWidth={2.5} aria-label="Completed" />;
  }
  return <X className="emp-status emp-status--pending" size={18} strokeWidth={2.5} aria-label="Pending" />;
}

function DepartmentCell({ employee }: { employee: EmployeeRecord }) {
  const department = hasDisplayDepartment(employee.department) ? employee.department : null;
  const employeeId = employee.employeeId?.trim()
    ? formatEmployeeIdLabel(employee.employeeId)
    : null;

  if (department && employeeId) {
    return (
      <div className="emp-dept-stack">
        <span className="emp-dept-pill">{department}</span>
        <span className="emp-dept-id">{employeeId}</span>
      </div>
    );
  }

  if (department) {
    return <span className="emp-dept-pill">{department}</span>;
  }

  if (employeeId) {
    return <span className="emp-dept-id emp-dept-id--solo">{employeeId}</span>;
  }

  return <span className="emp-dept-empty">—</span>;
}

function HeaderStepIcon({
  step,
}: {
  step: (typeof JOURNEY_COLUMNS)[number];
}) {
  const intakeIcon = INTAKE_ICON_URLS[step.id];
  const icon = intakeIcon ? (
    <JourneyAssetIcon src={intakeIcon} label={step.label} />
  ) : step.id === 'consultations' ? (
    <BriefcaseMedical size={20} strokeWidth={1.75} />
  ) : (
    <FileText size={20} strokeWidth={1.75} />
  );

  return (
    <span className="emp-table__step-icon" title={step.label}>
      {icon}
      {step.badge === 'blood' || step.badge === 'blood-ai' ? (
        <span className="emp-table__step-badge emp-table__step-badge--blood" aria-hidden>
          <Droplets size={10} strokeWidth={2} />
        </span>
      ) : null}
      {step.badge === 'bioai' || step.badge === 'bioai-ai' ? (
        <span className="emp-table__step-badge emp-table__step-badge--bioai" aria-hidden>
          BIO-AI
        </span>
      ) : null}
    </span>
  );
}

export function EmployeesPage() {
  const { departments, loading: orgLoading } = useOrganization();
  const {
    selectedYear,
    campsLoading,
    selectedCampName,
    selectedCity,
    setSelectedCity,
    locationOptions,
  } = useCamp();
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shareFor, setShareFor] = useState<EmployeeRecord | null>(null);
  const [shareBlood, setShareBlood] = useState(false);
  const [shareBioAi, setShareBioAi] = useState(false);
  const [stepFilters, setStepFilters] = useState<Record<string, StepFilterValue>>({});

  const hasDepartments = departments.length > 0;
  const {
    employees,
    total,
    loading,
    error,
    refresh,
    fetchAll,
  } = useCampParticipants(hasDepartments ? department : 'all', page, PAGE_SIZE);
  const { data: kpis, loading: kpisLoading, refresh: refreshKpis } = useCampKpis();
  const initialLoading = loading && employees.length === 0;
  const showLocation = locationOptions.length > 2;

  useEffect(() => {
    setPage(1);
  }, [selectedCity]);

  const departmentOptions = useMemo(() => {
    const fromOrg = departments
      .filter((d) => d.slug || d.department)
      .map((d) => ({
        value: (d.slug || d.department).trim().toLowerCase(),
        label: d.department || formatDepartmentLabel(d.slug),
      }));

    const fromEmployees = employees
      .filter((e) => e.departmentSlug || (e.department && e.department !== '-'))
      .map((e) => ({
        value: (e.departmentSlug || e.department).trim().toLowerCase(),
        label: e.department,
      }));

    const byValue = new Map<string, string>();
    for (const option of [...fromOrg, ...fromEmployees]) {
      if (!option.value) continue;
      if (!byValue.has(option.value)) byValue.set(option.value, option.label);
    }

    return [...byValue.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [departments, employees]);

  const departmentFilterDisabled = !orgLoading && departments.length === 0;

  useEffect(() => {
    if (!departmentFilterDisabled || department === 'all') return;
    setDepartment('all');
    setPage(1);
  }, [departmentFilterDisabled, department]);

  const departmentColumnLabel = useMemo(() => {
    const anyDepartment = employees.some((employee) => hasDisplayDepartment(employee.department));
    const anyEmployeeId = employees.some((employee) => Boolean(employee.employeeId?.trim()));
    if (!anyDepartment && anyEmployeeId) return 'Employee ID';
    return 'Department';
  }, [employees]);

  const pageRows = useMemo(() => {
    return employees.filter((employee) => {
      if (!matchesEmployeeName(employee.name, query)) return false;
      for (const [stepId, value] of Object.entries(stepFilters)) {
        if (value === 'any') continue;
        const status = employee.journey[stepId as JourneyStepId];
        if (value === 'completed' && status !== 'completed') return false;
        if (value === 'pending' && status === 'completed') return false;
      }
      return true;
    });
  }, [employees, query, stepFilters]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Same camp dashboard KPIs API (`section=kpis`) as the main dashboard.
  // Independent of participant list load so cards paint as soon as KPIs return.
  const summary = useMemo(() => {
    return {
      bloodDone: kpis?.totalBloodTest ?? 0,
      qDone: kpis?.questionnaireCompleted ?? 0,
      bioDone: kpis?.totalBioAiReports ?? 0,
      consultDoctor: kpis?.doctorConsultation ?? 0,
      consultNutritionist: kpis?.nutritionistConsultation ?? 0,
    };
  }, [kpis]);

  const summaryLoading = kpisLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshKpis();
    } catch {
      // still re-fetch participants even if kpis refresh fails
    }
    refresh();
    setRefreshing(false);
  };

  const downloadReady = !refreshing && !downloading && !initialLoading && total > 0;

  const handleDownload = async () => {
    if (!downloadReady) return;
    setDownloading(true);
    try {
      const allParticipants = await fetchAll();
      if (allParticipants.length === 0) return;
      downloadParticipantsExcel(allParticipants, participantsExcelFileName(selectedCampName));
    } catch {
      // leave table state intact; user can retry
    } finally {
      setDownloading(false);
    }
  };

  const setStepFilter = (stepId: JourneyStepId, value: StepFilterValue) => {
    setStepFilters((prev) => {
      const next = { ...prev };
      if (value === 'any') delete next[stepId];
      else next[stepId] = value;
      return next;
    });
    if (value !== 'any') setFiltersOpen(false);
    setPage(1);
  };

  const clearStepFilters = () => {
    setStepFilters({});
    setFiltersOpen(false);
    setPage(1);
  };

  const applySummaryFilter = (stepId: JourneyStepId) => {
    setStepFilters({ [stepId]: 'pending' });
    setFiltersOpen(false);
    setPage(1);
  };

  const activeFilterChips = useMemo(() => {
    return Object.entries(stepFilters)
      .filter(([, value]) => value === 'completed' || value === 'pending')
      .map(([stepId, value]) => ({
        stepId: stepId as JourneyStepId,
        label: filterStepLabel(stepId),
        status: value as 'completed' | 'pending',
        statusLabel: value === 'completed' ? 'Completed' : 'Pending',
      }));
  }, [stepFilters]);

  const hasActiveStepFilters = activeFilterChips.length > 0;

  const showingFrom = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, total);

  const pageButtons = useMemo(() => {
    const pages: number[] = [];
    const maxShown = Math.min(3, totalPages);
    let start = Math.max(1, safePage - 1);
    if (start + maxShown - 1 > totalPages) start = Math.max(1, totalPages - maxShown + 1);
    for (let i = 0; i < maxShown; i += 1) pages.push(start + i);
    return pages;
  }, [safePage, totalPages]);

  if (!campsLoading && selectedYear !== EMPLOYEES_CAMP_YEAR) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="employees-page">
      <header className="emp-header">
        <div className="emp-header__titles">
          <h1 className="emp-header__title">All Employees</h1>
          <div className="emp-header__subtitle-row">
            <p className="emp-header__subtitle">
              Track employee progress across the preventive healthcare journey.
            </p>
            {showLocation && (
              <LocationDropdown
                options={locationOptions}
                value={selectedCity}
                onChange={setSelectedCity}
                aria-label="City filter"
              />
            )}
          </div>
        </div>
        <div className="emp-header__actions">
          <div className="emp-header__status-row">
            <button
              type="button"
              className="emp-header__download"
              onClick={() => void handleDownload()}
              disabled={!downloadReady}
              aria-label={
                downloadReady
                  ? 'Download all employees as Excel'
                  : downloading
                    ? 'Preparing Excel download'
                    : 'Download available when employees have loaded'
              }
              title={
                downloadReady
                  ? 'Download Excel'
                  : downloading
                    ? 'Preparing download…'
                    : 'Download available when employees have loaded'
              }
            >
              <Download size={14} aria-hidden />
              <span>{downloading ? 'Preparing…' : 'Download'}</span>
            </button>
            <button
              type="button"
              className="emp-header__refresh"
              onClick={handleRefresh}
              disabled={refreshing || initialLoading}
            >
              <RefreshCw
                size={14}
                className={refreshing ? 'emp-header__spin' : undefined}
                aria-hidden
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {error && (
        <p className="dashboard-api-error" role="alert">
          {error}
        </p>
      )}

      <div className="emp-toolbar">
        <label className="emp-search">
          <Search size={16} className="emp-search__icon" aria-hidden />
          <input
            type="search"
            placeholder="Search employees..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            autoComplete="off"
            spellCheck={false}
            aria-label="Search employees by name"
            disabled={initialLoading}
          />
        </label>

        <div className="emp-toolbar__filters">
          <label className={`emp-dept-select${departmentFilterDisabled ? ' emp-dept-select--disabled' : ''}`}>
            <span className="visually-hidden">Department</span>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by department"
              disabled={departmentFilterDisabled}
            >
              <option value="all">Department</option>
              {departmentOptions.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="emp-dept-select__chevron" aria-hidden />
          </label>

          <button
            type="button"
            className={`emp-filter-btn${filtersOpen ? ' emp-filter-btn--active' : ''}`}
            aria-label="Open filters"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {hasActiveStepFilters ? (
        <div className="emp-active-filters" role="status">
          <button
            type="button"
            className="emp-active-filters__back"
            aria-label="Clear filters and go back"
            onClick={clearStepFilters}
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <div className="emp-active-filters__chips">
            {activeFilterChips.map((chip) => (
              <div key={chip.stepId} className="emp-active-filters__group">
                <span className="emp-chip emp-chip--category">{chip.label}</span>
                <span
                  className={`emp-chip emp-chip--status emp-chip--status-${chip.status}`}
                >
                  {chip.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="emp-summary">
          <article className="emp-summary-card">
            <div className="emp-summary-card__top">
              <span className="emp-summary-card__label">Blood Tests</span>
              <span className="emp-summary-card__icon emp-summary-card__icon--blood">
                <Droplets size={14} strokeWidth={2} aria-hidden />
              </span>
            </div>
            <span className="emp-summary-card__sublabel" aria-hidden>
              &nbsp;
            </span>
            <span className="emp-summary-card__number">{summaryLoading ? '…' : summary.bloodDone}</span>
            <div className="emp-summary-card__foot">
              <span className="emp-summary-card__unit">Completed</span>
              <button
                type="button"
                className="emp-summary-card__view"
                onClick={() => applySummaryFilter('bloodReport')}
              >
                View →
              </button>
            </div>
          </article>

          <article className="emp-summary-card">
            <div className="emp-summary-card__top">
              <span className="emp-summary-card__label">Questionnaires</span>
              <span className="emp-summary-card__icon emp-summary-card__icon--quest">
                <ClipboardList size={14} strokeWidth={2} aria-hidden />
              </span>
            </div>
            <span className="emp-summary-card__sublabel" aria-hidden>
              &nbsp;
            </span>
            <span className="emp-summary-card__number">{summaryLoading ? '…' : summary.qDone}</span>
            <div className="emp-summary-card__foot">
              <span className="emp-summary-card__unit">Submitted</span>
              <button
                type="button"
                className="emp-summary-card__view"
                onClick={() => applySummaryFilter('dietLifestyle')}
              >
                View →
              </button>
            </div>
          </article>

          <article className="emp-summary-card">
            <div className="emp-summary-card__top">
              <span className="emp-summary-card__label">Bio-AI Reports</span>
              <span className="emp-summary-card__icon emp-summary-card__icon--bio">
                <FileText size={14} strokeWidth={2} aria-hidden />
              </span>
            </div>
            <span className="emp-summary-card__sublabel" aria-hidden>
              &nbsp;
            </span>
            <span className="emp-summary-card__number">{summaryLoading ? '…' : summary.bioDone}</span>
            <div className="emp-summary-card__foot">
              <span className="emp-summary-card__unit">Ready</span>
              <button
                type="button"
                className="emp-summary-card__view"
                onClick={() => applySummaryFilter('bioAiReport')}
              >
                View →
              </button>
            </div>
          </article>

          <article className="emp-summary-card">
            <div className="emp-summary-card__top">
              <span className="emp-summary-card__label">Consultations</span>
              <span className="emp-summary-card__icon emp-summary-card__icon--consult">
                <BriefcaseMedical size={14} strokeWidth={2} aria-hidden />
              </span>
            </div>
            <span className="emp-summary-card__sublabel emp-summary-card__sublabel--accent">
              Doctor / Nutritionist
            </span>
            <span className="emp-summary-card__number">
              {summaryLoading
                ? '…'
                : `${summary.consultDoctor} / ${summary.consultNutritionist}`}
            </span>
            <div className="emp-summary-card__foot">
              <span className="emp-summary-card__unit">Requested</span>
              <button
                type="button"
                className="emp-summary-card__view"
                onClick={() => applySummaryFilter('consultations')}
              >
                View →
              </button>
            </div>
          </article>
        </div>
      )}

      <div className="emp-table-card">
        <div className="emp-table-scroll">
          <table className="emp-table">
            <thead>
              <tr>
                <th className="emp-table__col-participant">Participant</th>
                <th className="emp-table__col-dept">{departmentColumnLabel}</th>
                <th className="emp-table__col-contact">Contact</th>
                <th className="emp-table__col-steps">
                  <div className="emp-table__steps-head">
                    {(['intake', 'blood', 'bioai', 'consult'] as const).map((group) => (
                      <div key={group} className={`emp-table__steps-group emp-table__steps-group--${group}`}>
                        {JOURNEY_COLUMNS.filter((s) => s.group === group).map((step) => (
                          <HeaderStepIcon key={step.id} step={step} />
                        ))}
                      </div>
                    ))}
                  </div>
                </th>
                <th className="emp-table__col-share" aria-label="Share" />
              </tr>
            </thead>
            <tbody>
              {initialLoading ? (
                <tr>
                  <td colSpan={5} className="emp-table__empty">
                    Loading employees…
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="emp-table__empty">
                    No employees match your filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((emp) => (
                  <tr key={emp.id}>
                    <td className="emp-table__col-participant">
                      <div className="emp-participant">
                        <span className="emp-participant__name">{emp.name}</span>
                        <span className="emp-participant__meta">
                          {emp.gender}
                          {emp.age != null ? ` • ${emp.age}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="emp-table__col-dept">
                      <DepartmentCell employee={emp} />
                    </td>
                    <td className="emp-table__col-contact">
                      <div className="emp-contact">
                        <span className="emp-contact__phone">{emp.phone}</span>
                        <span className="emp-contact__email">
                          {emp.email || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="emp-table__col-steps">
                      <div className="emp-table__steps-row">
                        {(['intake', 'blood', 'bioai', 'consult'] as const).map((group) => (
                          <div
                            key={group}
                            className={`emp-table__steps-group emp-table__steps-group--${group}`}
                          >
                            {JOURNEY_COLUMNS.filter((s) => s.group === group).map((step) => (
                              <StatusIcon key={step.id} status={emp.journey[step.id]} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="emp-table__col-share">
                      <button
                        type="button"
                        className="emp-share-btn"
                        aria-label={`Share report for ${emp.name}`}
                        onClick={() => {
                          setShareFor(emp);
                          setShareBlood(false);
                          setShareBioAi(false);
                        }}
                      >
                        <Share2 size={16} strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="emp-table-footer">
          <span className="emp-table-footer__count">
            Showing {showingFrom}-{showingTo} of {total} Employees
            {loading ? (
              <span className="emp-table-footer__loading"> · Loading…</span>
            ) : null}
          </span>
          <div className="emp-pagination" role="navigation" aria-label="Pagination">
            <button
              type="button"
              className="emp-pagination__btn"
              disabled={safePage <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            {pageButtons.map((n) => (
              <button
                key={n}
                type="button"
                className={`emp-pagination__btn${n === safePage ? ' emp-pagination__btn--active' : ''}`}
                onClick={() => setPage(n)}
                disabled={loading && n !== safePage}
                aria-current={n === safePage ? 'page' : undefined}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="emp-pagination__btn"
              disabled={safePage >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </div>

      {filtersOpen && (
        <div className="emp-overlay" role="presentation" onClick={() => setFiltersOpen(false)}>
          <aside
            className="emp-panel emp-panel--filters"
            role="dialog"
            aria-label="Filters"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="emp-panel__header">
              <h2 className="emp-panel__title">Filters</h2>
              <button
                type="button"
                className="emp-panel__close"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </header>
            <div className="emp-panel__body">
              {FILTER_STEPS.map(({ id, label, Icon, iconUrl }) => {
                const value = stepFilters[id] ?? 'any';
                return (
                  <div key={id} className="emp-filter-row">
                    <div className="emp-filter-row__label">
                      {iconUrl ? (
                        <JourneyAssetIcon
                          src={iconUrl}
                          label={label}
                          className="emp-journey-asset emp-journey-asset--filter"
                        />
                      ) : Icon ? (
                        <Icon size={20} strokeWidth={1.75} aria-hidden />
                      ) : null}
                      <span>{label}</span>
                    </div>
                    <div className="emp-filter-row__toggles">
                      <button
                        type="button"
                        className={`emp-filter-toggle emp-filter-toggle--ok${value === 'completed' ? ' emp-filter-toggle--active' : ''}`}
                        aria-pressed={value === 'completed'}
                        aria-label={`${label} completed only`}
                        onClick={() =>
                          setStepFilter(id, value === 'completed' ? 'any' : 'completed')
                        }
                      >
                        <Check size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        className={`emp-filter-toggle emp-filter-toggle--no${value === 'pending' ? ' emp-filter-toggle--active' : ''}`}
                        aria-pressed={value === 'pending'}
                        aria-label={`${label} pending only`}
                        onClick={() =>
                          setStepFilter(id, value === 'pending' ? 'any' : 'pending')
                        }
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {shareFor && (
        <div className="emp-overlay" role="presentation" onClick={() => setShareFor(null)}>
          <div
            className="emp-panel emp-panel--share"
            role="dialog"
            aria-label="Share Report"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="emp-panel__header">
              <h2 className="emp-panel__title">Share Report</h2>
              <button
                type="button"
                className="emp-panel__close"
                aria-label="Close share dialog"
                onClick={() => setShareFor(null)}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </header>
            <div className="emp-panel__body">
              <label className="emp-share-option">
                <input
                  type="checkbox"
                  checked={shareBlood}
                  onChange={(e) => setShareBlood(e.target.checked)}
                />
                <span>Blood Report</span>
              </label>
              <label className="emp-share-option">
                <input
                  type="checkbox"
                  checked={shareBioAi}
                  onChange={(e) => setShareBioAi(e.target.checked)}
                />
                <span>Bio-AI Report</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
