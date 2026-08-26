import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Network,
  Users,
} from 'lucide-react';
import { EMPLOYEES_ENABLED_YEAR } from '../../config/dashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useCamp } from '../../contexts/CampContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { organizationsApi } from '../../services/api';
import type { ApiOrganizationCamp } from '../../services/apiTypes';
import { yearFromCampStartDate } from '../../utils/campYears';
import { formatUserDisplayName, formatUserPhone, userInitial } from '../../utils/userDisplay';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true as const },
  { to: '/insights', label: 'Camp Report', icon: BarChart3 },
  { to: '/employees', label: 'All Employees', icon: Users },
];

export function Sidebar({
  collapsed,
  onToggle,
  isMobile = false,
  mobileOpen = false,
  onNavigate,
}: SidebarProps) {
  const { accessToken, user, userLoading, logout } = useAuth();
  const {
    selectedCampNo,
    selectedCampName,
    selectedCampOrganizationName,
    selectedYear,
    selectCamp,
  } = useCamp();
  const employeesEnabled = selectedYear === EMPLOYEES_ENABLED_YEAR;
  const { organizationName, organizationLogo, departments, loading: orgLoading } =
    useOrganization();
  const hasDepartments = departments.length > 0;
  const navigate = useNavigate();
  const location = useLocation();

  const showLabels = isMobile || !collapsed;
  const sidebarCollapsed = !isMobile && collapsed;
  const displayName = user ? formatUserDisplayName(user) : userLoading ? 'Loading…' : '-';
  const displayPhone = user ? formatUserPhone(user.phone) : '';
  // Prefer live /organizations/we name; fall back to the org name saved at camp select.
  const companyLabel = orgLoading
    ? 'Loading…'
    : organizationName !== '-'
      ? organizationName
      : selectedCampOrganizationName?.trim() || '-';
  const companyInitial =
    companyLabel && companyLabel !== '-' && companyLabel !== 'Loading…'
      ? companyLabel.charAt(0).toUpperCase()
      : '?';
  const campSubtitle = selectedCampName?.trim() || '-';
  const activeDepartmentSlug = location.pathname.startsWith('/departments/')
    ? location.pathname.slice('/departments/'.length).split('/')[0]
    : null;
  const departmentsActive = Boolean(activeDepartmentSlug);

  const [campsOpen, setCampsOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [accessibleCamps, setAccessibleCamps] = useState<ApiOrganizationCamp[]>([]);
  const [campsListLoading, setCampsListLoading] = useState(false);
  const [campsListError, setCampsListError] = useState<string | null>(null);
  const [selectingCampNo, setSelectingCampNo] = useState<number | null>(null);
  const campsRef = useRef<HTMLDivElement>(null);
  const departmentsRef = useRef<HTMLDivElement>(null);
  const campsLoadedForTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      campsLoadedForTokenRef.current = null;
      setAccessibleCamps([]);
      setCampsListError(null);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!campsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!campsRef.current?.contains(event.target as Node)) {
        setCampsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [campsOpen]);

  useEffect(() => {
    if (!campsOpen || !accessToken || userLoading) return;
    if (campsLoadedForTokenRef.current === accessToken) return;

    const token = accessToken;
    const role = user?.employee?.role ?? null;
    let cancelled = false;

    async function loadAccessibleCamps() {
      setCampsListLoading(true);
      setCampsListError(null);
      try {
        const { items } = await organizationsApi.listCampsForUser(token, role);
        if (cancelled) return;
        const sorted = [...items].sort((a, b) =>
          a.camp_name.localeCompare(b.camp_name, undefined, { sensitivity: 'base' }),
        );
        setAccessibleCamps(sorted);
        campsLoadedForTokenRef.current = token;
      } catch (err) {
        if (cancelled) return;
        setCampsListError(err instanceof Error ? err.message : 'Failed to load camps');
      } finally {
        if (!cancelled) setCampsListLoading(false);
      }
    }

    void loadAccessibleCamps();
    return () => {
      cancelled = true;
    };
  }, [campsOpen, accessToken, user, userLoading]);

  useEffect(() => {
    if (!departmentsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!departmentsRef.current?.contains(event.target as Node)) {
        setDepartmentsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [departmentsOpen]);

  useEffect(() => {
    setCampsOpen(false);
    setDepartmentsOpen(false);
  }, [collapsed, mobileOpen]);

  useEffect(() => {
    if (!hasDepartments) setDepartmentsOpen(false);
  }, [hasDepartments]);

  const handleToggleDepartments = () => {
    if (sidebarCollapsed) {
      onToggle();
      setDepartmentsOpen(true);
      return;
    }
    setCampsOpen(false);
    setDepartmentsOpen((open) => !open);
  };

  const handleSelectDepartment = (slug: string) => {
    setDepartmentsOpen(false);
    navigate(`/departments/${slug}`);
    onNavigate?.();
  };

  const handleSelectCamp = async (camp: ApiOrganizationCamp) => {
    if (camp.camp_no === selectedCampNo) {
      setCampsOpen(false);
      return;
    }

    setSelectingCampNo(camp.camp_no);
    setCampsListError(null);
    const result = await selectCamp(
      camp.camp_no,
      camp.organization_id,
      camp.organization_name,
      camp.camp_name,
      camp.start_date,
    );
    setSelectingCampNo(null);

    if (result.ok) {
      setCampsOpen(false);
      onNavigate?.();
      return;
    }

    setCampsListError(result.error ?? 'Unable to access this camp.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    onNavigate?.();
  };

  const showOrgInCampMeta = accessibleCamps.some(
    (camp) => camp.organization_id !== accessibleCamps[0]?.organization_id,
  );

  const logoEl = (
    <span className="sidebar__logo">
      {organizationLogo ? (
        <img src={organizationLogo} alt="" className="sidebar__logo-img" />
      ) : (
        <span className="sidebar__logo-initial" aria-hidden>
          {companyInitial}
        </span>
      )}
    </span>
  );

  return (
    <aside
      className={[
        'sidebar',
        !isMobile && collapsed ? 'sidebar--collapsed' : '',
        isMobile ? 'sidebar--mobile' : '',
        isMobile && mobileOpen ? 'sidebar--mobile-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="sidebar__glow" aria-hidden />

      <div className="sidebar__top">
        <div
          className={[
            'sidebar__brand-wrap',
            campsOpen ? 'sidebar__brand-wrap--open' : '',
            sidebarCollapsed ? 'sidebar__brand-wrap--collapsed' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          ref={campsRef}
        >
          {sidebarCollapsed ? (
            <button
              type="button"
              className="sidebar__logo-btn"
              onClick={onToggle}
              aria-label="Expand menu"
            >
              {logoEl}
            </button>
          ) : (
            <div className="sidebar__brand">
              <button
                type="button"
                className="sidebar__logo-btn"
                onClick={onToggle}
                aria-label="Collapse menu"
                title="Collapse menu"
              >
                {logoEl}
              </button>
              <button
                type="button"
                className="sidebar__brand-picker"
                onClick={() => {
                  setDepartmentsOpen(false);
                  setCampsOpen((open) => !open);
                }}
                aria-expanded={campsOpen}
                aria-controls="sidebar-camps-list"
              >
                <span className="sidebar__brand-text">
                  <span className="sidebar__company">{companyLabel}</span>
                  <span className="sidebar__camp-subtitle">{campSubtitle}</span>
                </span>
                <ChevronDown
                  size={16}
                  className={`sidebar__brand-chevron${campsOpen ? ' sidebar__brand-chevron--open' : ''}`}
                  aria-hidden
                />
              </button>
            </div>
          )}

          {campsOpen && !sidebarCollapsed && (
            <div
              id="sidebar-camps-list"
              className="sidebar__camps-panel"
              role="listbox"
              aria-label="Available camps"
            >
              {campsListLoading && (
                <p className="sidebar__camps-status">Loading camps…</p>
              )}

              {!campsListLoading && accessibleCamps.length === 0 && !campsListError && (
                <p className="sidebar__camps-status">No camps available.</p>
              )}

              {!campsListLoading && accessibleCamps.length > 0 && (
                <ul className="sidebar__camps-list">
                  {accessibleCamps.map((camp) => {
                    const isActive = camp.camp_no === selectedCampNo;
                    const isSelecting = selectingCampNo === camp.camp_no;
                    const year = yearFromCampStartDate(camp.start_date);
                    const metaParts = [
                      showOrgInCampMeta ? camp.organization_name : null,
                      year,
                    ].filter(Boolean);

                    return (
                      <li key={camp.camp_no}>
                        <button
                          type="button"
                          role="option"
                          className={`sidebar__camp-item${
                            isActive ? ' sidebar__camp-item--active' : ''
                          }`}
                          aria-selected={isActive}
                          aria-current={isActive ? 'true' : undefined}
                          disabled={selectingCampNo != null}
                          onClick={() => void handleSelectCamp(camp)}
                        >
                          <span className="sidebar__camp-item-name">{camp.camp_name}</span>
                          {(metaParts.length > 0 || isSelecting) && (
                            <span
                              className={
                                isSelecting
                                  ? 'sidebar__camp-item-loading'
                                  : 'sidebar__camp-item-meta'
                              }
                            >
                              {isSelecting ? 'Switching…' : metaParts.join(' · ')}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!campsListLoading && campsListError && (
                <p className="sidebar__camps-error">{campsListError}</p>
              )}
            </div>
          )}
        </div>

        <nav className="sidebar__nav">
          {navItems.slice(0, 2).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : undefined}
              onClick={onNavigate}
              title={sidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
              }
            >
              <item.icon size={20} strokeWidth={1.75} />
              {showLabels && <span>{item.label}</span>}
            </NavLink>
          ))}

          {hasDepartments && (
            <div
              className={[
                'sidebar__nav-dropdown',
                departmentsOpen ? 'sidebar__nav-dropdown--open' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              ref={departmentsRef}
            >
              <button
                type="button"
                className={`sidebar__link sidebar__link--button${
                  departmentsActive || departmentsOpen ? ' sidebar__link--active' : ''
                }`}
                onClick={handleToggleDepartments}
                aria-expanded={departmentsOpen}
                aria-controls="sidebar-departments-list"
                title={sidebarCollapsed ? 'Departments' : undefined}
              >
                <Network size={20} strokeWidth={1.75} />
                {showLabels && <span>Departments</span>}
                {showLabels && (
                  <ChevronDown
                    size={16}
                    className={`sidebar__link-chevron${
                      departmentsOpen ? ' sidebar__link-chevron--open' : ''
                    }`}
                    aria-hidden
                  />
                )}
              </button>

              {departmentsOpen && !sidebarCollapsed && (
                <div
                  id="sidebar-departments-list"
                  className="sidebar__camps-panel sidebar__nav-dropdown-panel"
                  role="region"
                  aria-label="Departments"
                >
                  {orgLoading && <p className="sidebar__camps-status">Loading departments…</p>}

                  {!orgLoading && (
                    <ul className="sidebar__camps-list">
                      {departments.map((dept) => {
                        const isSelected = dept.slug === activeDepartmentSlug;
                        return (
                          <li key={dept.slug}>
                            <button
                              type="button"
                              className={`sidebar__camp-item${
                                isSelected ? ' sidebar__camp-item--active' : ''
                              }`}
                              onClick={() => handleSelectDepartment(dept.slug)}
                              aria-current={isSelected ? 'true' : undefined}
                            >
                              <span className="sidebar__camp-item-name">{dept.department}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {navItems.slice(2).map((item) => {
            const employeesLocked = item.to === '/employees' && !employeesEnabled;
            if (employeesLocked) {
              return (
                <span
                  key={item.to}
                  className="sidebar__link sidebar__link--disabled"
                  aria-disabled="true"
                  title="All Employees is available for 2026"
                >
                  <item.icon size={20} strokeWidth={1.75} />
                  {showLabels && <span>{item.label}</span>}
                </span>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                }
              >
                <item.icon size={20} strokeWidth={1.75} />
                {showLabels && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__profile">
          <div className="sidebar__avatar">{userInitial(user)}</div>
          {showLabels && (
            <div className="sidebar__profile-text">
              <span className="sidebar__profile-name">{displayName}</span>
              {displayPhone && (
                <span className="sidebar__profile-phone">{displayPhone}</span>
              )}
            </div>
          )}
        </div>

        {showLabels && <div className="sidebar__footer-divider" />}

        <button
          type="button"
          className="sidebar__logout"
          onClick={handleLogout}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} strokeWidth={1.75} />
          {showLabels && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
