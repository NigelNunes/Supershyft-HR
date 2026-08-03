import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './AppLayout.css';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const location = useLocation();

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
      {isMobile && !mobileNavOpen && (
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}
      <Sidebar
        collapsed={sidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileNavOpen}
        onToggle={() => (isMobile ? setMobileNavOpen((o) => !o) : setCollapsed((c) => !c))}
        onNavigate={() => isMobile && setMobileNavOpen(false)}
      />
      <div
        className={`main-area${!isMobile && collapsed ? ' sidebar-collapsed' : ''}${isMobile ? ' main-area--mobile' : ''}`}
      >
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
