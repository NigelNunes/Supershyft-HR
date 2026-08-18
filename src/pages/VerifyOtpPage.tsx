import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginLayout } from '../components/auth/LoginLayout';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import { authApi } from '../services/api';
import './LoginPage.css';

const RESEND_COOLDOWN_SECONDS = 30;

function formatCountdown(seconds: number) {
  const safe = Math.max(0, seconds);
  return `00:${String(safe).padStart(2, '0')}`;
}

export function VerifyOtpPage() {
  const { isAuthenticated, login } = useAuth();
  const { selectedCampNo } = useCamp();
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string } | null)?.phone ?? '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  if (isAuthenticated) {
    return <Navigate to={selectedCampNo ? '/' : '/login/select-camp'} replace />;
  }
  if (!phone || phone.replace(/\D/g, '').length !== 10) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedOtp = otp.replace(/\D/g, '').slice(0, 6);
    if (!normalizedOtp) {
      setError('Enter the OTP sent to your phone.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await login(phone, normalizedOtp);
    setLoading(false);
    if (result.ok) {
      navigate('/login/select-camp', { replace: true });
      return;
    }
    setError(result.error ?? 'Verification failed');
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await authApi.resendOtp(phone.replace(/\D/g, ''));
      setOtp('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <LoginLayout>
      <p className="login-verify-phone">
        OTP sent to <span>{phone}</span>
      </p>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          OTP
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(digits);
              setError('');
            }}
            placeholder="6-digit OTP"
            maxLength={6}
            autoComplete="one-time-code"
            required
          />
        </label>
        {error && <p className="login-form__error" role="alert">{error}</p>}
        <button type="submit" disabled={loading || otp.replace(/\D/g, '').length === 0}>
          {loading ? 'Verifying…' : 'Sign in'}
        </button>
      </form>

      <div className="login-resend">
        {cooldown > 0 ? (
          <p className="login-resend__countdown">Resend OTP in {formatCountdown(cooldown)}</p>
        ) : (
          <button
            type="button"
            className="login-resend__action"
            onClick={() => void handleResend()}
            disabled={resending}
          >
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
        )}
      </div>

      <button type="button" className="login-back" onClick={() => navigate('/login')}>
        Change mobile number
      </button>
    </LoginLayout>
  );
}
