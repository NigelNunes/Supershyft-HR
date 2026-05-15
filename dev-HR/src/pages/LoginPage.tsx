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
          <img src={BRANDING.companyLogo} alt="" className="login-card__logo-img" />
          <h1>{BRANDING.companyName}</h1>
          <p>Corporate wellness dashboard for HR teams</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Mobile number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile"
              autoComplete="tel"
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
