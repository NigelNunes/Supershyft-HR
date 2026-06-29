import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginLayout } from '../components/auth/LoginLayout';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import { authApi } from '../services/api';
import './LoginPage.css';

const RESEND_SECONDS = 30;

function formatCountdown(seconds: number) {
  return `00:${String(seconds).padStart(2, '0')}`;
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
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);

  const canResend = resendSeconds === 0 && !resending;

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setResendSeconds((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;
    setError('');
    setOtp('');
    setResending(true);
    try {
      await authApi.resendOtp(phone);
      setResendSeconds(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  }, [canResend, phone]);

  if (isAuthenticated) {
    return <Navigate to={selectedCampNo ? '/' : '/login/select-camp'} replace />;
  }
  if (!phone) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(phone, otp);
    setLoading(false);
    if (result.ok) {
      navigate('/login/select-camp', { replace: true });
      return;
    }
    setError(result.error ?? 'Verification failed');
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
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying…' : 'Sign in'}
        </button>
      </form>
      <div className="login-resend">
        {canResend ? (
          <button type="button" className="login-resend__action" onClick={handleResend}>
            Resend OTP
          </button>
        ) : (
          <span className="login-resend__countdown">
            {resending ? 'Resending…' : `Resend OTP in ${formatCountdown(resendSeconds)}`}
          </span>
        )}
      </div>
      <button type="button" className="login-back" onClick={() => navigate('/login')}>
        Change mobile number
      </button>
    </LoginLayout>
  );
}
