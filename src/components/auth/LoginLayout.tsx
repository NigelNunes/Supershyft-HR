import type { ReactNode } from 'react';
import { BRANDING } from '../../content/branding';
import '../../pages/LoginPage.css';

interface LoginLayoutProps {
  children: ReactNode;
  variant?: 'default' | 'camp-select';
}

export function LoginLayout({ children, variant = 'default' }: LoginLayoutProps) {
  const cardClass =
    variant === 'camp-select' ? 'login-card login-card--camp-select' : 'login-card';

  return (
    <div className="login-page">
      <div className={cardClass}>
        <div className="login-card__brand">
          <div className="login-card__platform-brand" aria-label={BRANDING.platformName}>
            <img src={BRANDING.platformLogo} alt="" className="login-card__platform-logo" />
            <span className="login-card__platform-name">{BRANDING.platformName}</span>
          </div>
          <p className="login-card__brand-tagline">HR health intelligence · sign in to continue</p>
        </div>
        {children}
      </div>
    </div>
  );
}
