import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LoginLayout } from '../components/auth/LoginLayout';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import './LoginPage.css';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = phone.replace(/\D/g, '');
    if (normalized.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.sendOtp(normalized);
      navigate('/login/verify', { state: { phone: normalized } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
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
              setError('');
            }}
            placeholder="10-digit mobile"
            autoComplete="tel"
            maxLength={10}
            required
          />
        </label>
        {error && <p className="login-form__error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send OTP'}
        </button>
      </form>
    </LoginLayout>
  );
}
