import { NavLink } from 'react-router-dom';
import {
  Building2,
  History,
  LayoutDashboard,
  Lock,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BRANDING } from '../../content/branding';
import { mockDashboard } from '../../data/mockDashboard';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/departments', label: 'Department', icon: Building2 },
  { to: '/employees', label: 'All Employees', icon: Users },
  {
    to: '/history',
    label: 'History',
    icon: History,
    locked: !mockDashboard.org.hasHistory,
  },
];

export function Sidebar({
  collapsed,
  onToggle,
  isMobile = false,
  mobileOpen = false,
  onNavigate,
}: SidebarProps) {
  const { hr } = useAuth();
  const showLabels = isMobile || !collapsed;

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
      <button
        type="button"
        className="sidebar__brand"
        onClick={onToggle}
        aria-label={isMobile ? (mobileOpen ? 'Close menu' : 'Open menu') : collapsed ? 'Expand menu' : 'Collapse menu'}
      >
        <span className="sidebar__logo">
          <img src={BRANDING.companyLogo} alt="" className="sidebar__logo-img" />
        </span>
        {showLabels && <span className="sidebar__company">{BRANDING.companyName}</span>}
      </button>

      <nav className="sidebar__nav">
        {navItems.map(({ to, label, icon: Icon, end, locked }) =>
          locked ? (
            <span key={to} className="sidebar__link sidebar__link--locked" title="Available after multiple camps">
              <Icon size={20} />
              {showLabels && (
                <>
                  <span>{label}</span>
                  <Lock size={14} className="sidebar__lock" />
                </>
              )}
            </span>
          ) : (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
              }
            >
              <Icon size={20} />
              {showLabels && <span>{label}</span>}
            </NavLink>
          ),
        )}
      </nav>

      <div className="sidebar__profile">
        <div className="sidebar__avatar">{hr.name.charAt(0)}</div>
        {showLabels && (
          <div className="sidebar__profile-text">
            <span className="sidebar__profile-name">{hr.name}</span>
            <span className="sidebar__profile-phone">{hr.phone}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
