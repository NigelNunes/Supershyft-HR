import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginLayout } from '../components/auth/LoginLayout';
import { DEMO_OTP, isDemoPhone } from '../config/demo';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import './LoginPage.css';

export function VerifyOtpPage() {
  const { isAuthenticated, login } = useAuth();
  const { selectedCampNo } = useCamp();
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string } | null)?.phone ?? '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={selectedCampNo ? '/' : '/'} replace />;
  }
  if (!phone || !isDemoPhone(phone)) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(phone, otp);
    setLoading(false);
    if (result.ok) {
      navigate('/', { replace: true });
      return;
    }
    setError(result.error ?? 'Verification failed');
  };

  return (
    <LoginLayout>
      <p className="login-verify-phone">
        Enter demo password for <span>{phone}</span>
      </p>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Password
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
              setOtp(digits);
              setError('');
            }}
            placeholder={DEMO_OTP}
            maxLength={4}
            autoComplete="one-time-code"
            required
          />
        </label>
        {error && <p className="login-form__error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <button type="button" className="login-back" onClick={() => navigate('/login')}>
        Change mobile number
      </button>
    </LoginLayout>
  );
}
