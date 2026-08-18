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
import { useAuth } from '../../contexts/AuthContext';
import { useCamp } from '../../contexts/CampContext';
import { useOrganization } from '../../contexts/OrganizationContext';
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
  const { user, userLoading, logout } = useAuth();
  const { selectedCampName, selectedCampOrganizationName } = useCamp();
  const { organizationName, organizationLogo, departments, loading: orgLoading } =
    useOrganization();
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
  const campsRef = useRef<HTMLDivElement>(null);
  const departmentsRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    onNavigate?.();
  };

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
              role="region"
              aria-label="Current camp"
            >
              <ul className="sidebar__camps-list">
                <li>
                  <button
                    type="button"
                    className="sidebar__camp-item sidebar__camp-item--active"
                    onClick={() => setCampsOpen(false)}
                    aria-current="true"
                  >
                    <span className="sidebar__camp-item-name">{campSubtitle}</span>
                    <span className="sidebar__camp-item-meta">{companyLabel}</span>
                  </button>
                </li>
              </ul>
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

                {!orgLoading && departments.length > 0 && (
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

                {!orgLoading && departments.length === 0 && (
                  <p className="sidebar__camps-status">No departments found.</p>
                )}
              </div>
            )}
          </div>

          {navItems.slice(2).map((item) => (
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
          ))}
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
