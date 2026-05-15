import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BRANDING } from '../../content/branding';
import './AppLayout.css';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false);
  }, [isMobile]);

  useEffect(() => {
    document.body.style.overflow = isMobile && mobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileNavOpen]);

  const sidebarCollapsed = isMobile ? false : collapsed;

  return (
    <div className="app-shell">
      {isMobile && mobileNavOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <Sidebar
        collapsed={sidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileNavOpen}
        onToggle={() => (isMobile ? setMobileNavOpen((o) => !o) : setCollapsed((c) => !c))}
        onNavigate={() => isMobile && setMobileNavOpen(false)}
      />
      <div className={`main-area${!isMobile && collapsed ? ' sidebar-collapsed' : ''}${isMobile ? ' main-area--mobile' : ''}`}>
        <header className="top-bar">
          <div className="top-bar__inner">
          <div className="top-bar__leading">
            {isMobile && (
              <button
                type="button"
                className="top-bar__menu-btn"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            )}
          </div>
          <div className="top-bar__center" aria-label={BRANDING.platformName}>
            <img src={BRANDING.platformLogo} alt="" className="top-bar__platform-logo" />
            <span className="top-bar__platform-name">{BRANDING.platformName}</span>
          </div>
          <div className="top-bar__actions">
            <button type="button" className="top-bar__btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button type="button" className="top-bar__btn top-bar__btn--text" onClick={logout}>
              Sign out
            </button>
          </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
