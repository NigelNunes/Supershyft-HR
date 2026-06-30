import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LoginLayout } from '../components/auth/LoginLayout';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import { organizationsApi } from '../services/api';
import type { ApiOrganizationCamp } from '../services/apiTypes';
import './CampSelectPage.css';
import { formatCampDate } from '../utils/campDisplay';

export function CampSelectPage() {
  const { isAuthenticated, accessToken, user, userLoading, logout } = useAuth();
  const { selectedCampNo, selectCamp } = useCamp();
  const navigate = useNavigate();

  const [camps, setCamps] = useState<ApiOrganizationCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingCampNo, setSelectingCampNo] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken || !isAuthenticated || selectedCampNo || userLoading) return;

    const token = accessToken;
    const role = user?.employee?.role ?? null;
    let cancelled = false;

    async function loadCamps() {
      setLoading(true);
      setError('');

      try {
        const { items: campList } = await organizationsApi.listCampsForUser(token, { role });
        if (cancelled) return;

        if (campList.length === 0) {
          setError('No camps found for your account.');
          setLoading(false);
          return;
        }

        if (campList.length === 1) {
          const result = await selectCamp(
            campList[0].camp_no,
            campList[0].organization_id,
            campList[0].organization_name,
          );
          if (cancelled) return;
          if (result.ok) {
            navigate('/', { replace: true });
            return;
          }
          setError(result.error ?? 'Unable to access this camp.');
          setLoading(false);
          return;
        }

        setCamps(campList);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load camps');
        setLoading(false);
      }
    }

    void loadCamps();

    return () => {
      cancelled = true;
    };
  }, [accessToken, isAuthenticated, selectedCampNo, user, userLoading, navigate, selectCamp]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (selectedCampNo) return <Navigate to="/" replace />;

  const handleSelectCamp = async (camp: ApiOrganizationCamp) => {
    setSelectingCampNo(camp.camp_no);
    setError('');

    const result = await selectCamp(camp.camp_no, camp.organization_id, camp.organization_name);
    setSelectingCampNo(null);

    if (result.ok) {
      navigate('/', { replace: true });
      return;
    }

    setError(result.error ?? 'Unable to access this camp.');
  };

  return (
    <LoginLayout variant="camp-select">
      <p className="camp-select-intro">Select a camp to view the HR health dashboard.</p>

      {loading && <p className="camp-select-status">Loading camps…</p>}

      {!loading && camps.length > 0 && (
        <ul className="camp-select-list">
          {camps.map((camp) => (
            <li key={camp.camp_no}>
              <button
                type="button"
                className="camp-select-card"
                onClick={() => void handleSelectCamp(camp)}
                disabled={selectingCampNo !== null}
              >
                <span className="camp-select-card__name">{camp.camp_name}</span>
                <span className="camp-select-card__meta">
                  {camp.organization_name} · {formatCampDate(camp.start_date)}
                </span>
                {selectingCampNo === camp.camp_no && (
                  <span className="camp-select-card__loading">Opening…</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="login-form__error camp-select-error" role="alert">
          {error}
        </p>
      )}

      {!loading && error && (
        <button type="button" className="login-back" onClick={() => logout()}>
          Sign out
        </button>
      )}
    </LoginLayout>
  );
}
