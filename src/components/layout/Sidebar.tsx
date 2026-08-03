import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Network,
  Sun,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCamp } from '../../contexts/CampContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { organizationsApi } from '../../services/api';
import type { ApiOrganizationCamp } from '../../services/apiTypes';
import { formatCampDate } from '../../utils/campDisplay';
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
  { to: '/departments', label: 'Departments', icon: Network, hasChevron: true as const },
  { to: '/employees', label: 'All Employees', icon: Users },
];

export function Sidebar({
  collapsed,
  onToggle,
  isMobile = false,
  mobileOpen = false,
  onNavigate,
}: SidebarProps) {
  const { user, userLoading, accessToken, logout } = useAuth();
  const { selectedCampNo, selectedCampOrganizationId, selectCamp } = useCamp();
  const { organizationName, organizationLogo, loading: orgLoading } = useOrganization();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const showLabels = isMobile || !collapsed;
  const sidebarCollapsed = !isMobile && collapsed;
  const displayName = user ? formatUserDisplayName(user) : userLoading ? 'Loading…' : '—';
  const displayPhone = user ? formatUserPhone(user.phone) : '';
  const companyLabel = orgLoading ? 'Loading…' : organizationName;
  const companyInitial = companyLabel.charAt(0).toUpperCase() || '?';

  const [campsOpen, setCampsOpen] = useState(false);
  const [camps, setCamps] = useState<ApiOrganizationCamp[]>([]);
  const [campsLoading, setCampsLoading] = useState(false);
  const [campsError, setCampsError] = useState('');
  const [selectingCampNo, setSelectingCampNo] = useState<number | null>(null);
  const campsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accessToken || userLoading) {
      if (!accessToken) setCamps([]);
      return;
    }

    let cancelled = false;
    setCampsLoading(true);
    setCampsError('');

    organizationsApi
      .listCampsForUser(accessToken, {
        organizationId: selectedCampOrganizationId,
        role: user?.employee?.role ?? null,
      })
      .then(({ items }) => {
        if (cancelled) return;
        setCamps(items);
        setCampsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setCampsError(err instanceof Error ? err.message : 'Failed to load camps');
        setCampsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, selectedCampOrganizationId, user, userLoading]);

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
    setCampsOpen(false);
  }, [collapsed, mobileOpen]);

  const selectedCamp = camps.find((camp) => camp.camp_no === selectedCampNo);
  const campSubtitle = selectedCamp?.camp_name ?? 'Select camp';

  const handleSelectCamp = async (camp: ApiOrganizationCamp) => {
    if (camp.camp_no === selectedCampNo) {
      setCampsOpen(false);
      return;
    }

    setSelectingCampNo(camp.camp_no);
    setCampsError('');

    const result = await selectCamp(camp.camp_no, camp.organization_id, camp.organization_name);
    setSelectingCampNo(null);

    if (result.ok) {
      setCampsOpen(false);
      navigate('/', { replace: true });
      onNavigate?.();
      return;
    }

    setCampsError(result.error ?? 'Unable to access this camp.');
  };

  const handleLogout = () => {
    logout();
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
                onClick={() => setCampsOpen((open) => !open)}
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
              aria-label="Camps"
            >
              {campsLoading && <p className="sidebar__camps-status">Loading camps…</p>}

              {!campsLoading && camps.length > 0 && (
                <ul className="sidebar__camps-list">
                  {camps.map((camp) => {
                    const isSelected = camp.camp_no === selectedCampNo;
                    const isSelecting = selectingCampNo === camp.camp_no;

                    return (
                      <li key={camp.camp_no}>
                        <button
                          type="button"
                          className={`sidebar__camp-item${isSelected ? ' sidebar__camp-item--active' : ''}`}
                          onClick={() => void handleSelectCamp(camp)}
                          disabled={selectingCampNo !== null}
                          aria-current={isSelected ? 'true' : undefined}
                        >
                          <span className="sidebar__camp-item-name">{camp.camp_name}</span>
                          <span className="sidebar__camp-item-meta">
                            {camp.organization_name} · {formatCampDate(camp.start_date)}
                          </span>
                          {isSelecting && (
                            <span className="sidebar__camp-item-loading">Opening…</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!campsLoading && !campsError && camps.length === 0 && (
                <p className="sidebar__camps-status">No camps found.</p>
              )}

              {campsError && (
                <p className="sidebar__camps-error" role="alert">
                  {campsError}
                </p>
              )}
            </div>
          )}
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
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
              {showLabels && 'hasChevron' in item && item.hasChevron && (
                <ChevronDown size={16} className="sidebar__link-chevron" aria-hidden />
              )}
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
          onClick={toggleTheme}
          title={sidebarCollapsed ? (theme === 'light' ? 'Dark mode' : 'Light mode') : undefined}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={20} strokeWidth={1.75} /> : <Sun size={20} strokeWidth={1.75} />}
          {showLabels && <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>}
        </button>

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
