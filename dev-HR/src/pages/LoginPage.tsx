import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BRANDING } from '../content/branding';
import { DEMO_OTP, DEMO_PHONE } from '../data/mockDashboard';
import './LoginPage.css';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(phone.replace(/\D/g, ''), otp);
    setLoading(false);
    if (!result.ok) setError(result.error ?? 'Login failed');
  };

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
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Mobile number
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(digits);
              }}
              placeholder="10-digit mobile"
              autoComplete="tel"
              maxLength={10}
              required
            />
          </label>
          <label>
            OTP
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              maxLength={6}
              autoComplete="one-time-code"
              required
            />
          </label>
          {error && <p className="login-form__error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Sign in'}
          </button>
        </form>
        <p className="login-demo">
          Demo: <code>{DEMO_PHONE}</code> · OTP <code>{DEMO_OTP}</code>
        </p>
      </div>
    </div>
  );
}
