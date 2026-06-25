import type { ReactNode } from 'react';
import { BRANDING } from '../../content/branding';
import '../../pages/LoginPage.css';

export function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="login-page">
      <div className="login-card">
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
