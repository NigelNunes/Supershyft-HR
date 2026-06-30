import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Tent } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCamp } from '../../contexts/CampContext';
import { organizationsApi } from '../../services/api';
import type { ApiOrganizationCamp } from '../../services/apiTypes';
import { formatCampDate } from '../../utils/campDisplay';

interface SidebarCampsSectionProps {
  showLabels: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarCampsSection({
  showLabels,
  collapsed,
  onNavigate,
}: SidebarCampsSectionProps) {
  const { accessToken, user, userLoading } = useAuth();
  const { selectedCampNo, selectedCampOrganizationId, selectCamp } = useCamp();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [camps, setCamps] = useState<ApiOrganizationCamp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectingCampNo, setSelectingCampNo] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken || userLoading) {
      if (!accessToken) setCamps([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    organizationsApi
      .listCampsForUser(accessToken, {
        organizationId: selectedCampOrganizationId,
        role: user?.employee?.role ?? null,
      })
      .then(({ items }) => {
        if (cancelled) return;
        setCamps(items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load camps');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, selectedCampOrganizationId, user, userLoading]);

  const selectedCamp = camps.find((camp) => camp.camp_no === selectedCampNo);

  const handleToggle = () => {
    setOpen((value) => !value);
    setError('');
  };

  const handleSelectCamp = async (camp: ApiOrganizationCamp) => {
    if (camp.camp_no === selectedCampNo) {
      setOpen(false);
      return;
    }

    setSelectingCampNo(camp.camp_no);
    setError('');

    const result = await selectCamp(camp.camp_no, camp.organization_id, camp.organization_name);
    setSelectingCampNo(null);

    if (result.ok) {
      setOpen(false);
      navigate('/', { replace: true });
      onNavigate?.();
      return;
    }

    setError(result.error ?? 'Unable to access this camp.');
  };

  return (
    <div
      className={[
        'sidebar__camps',
        open ? 'sidebar__camps--open' : '',
        collapsed ? 'sidebar__camps--collapsed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="sidebar__camps-toggle"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls="sidebar-camps-list"
        title={collapsed ? 'Camps' : undefined}
      >
        <Tent size={20} />
        {showLabels && (
          <>
            <span className="sidebar__camps-toggle-text">
              <span className="sidebar__camps-label">Camps</span>
              {selectedCamp && (
                <span className="sidebar__camps-current">{selectedCamp.camp_name}</span>
              )}
            </span>
            <ChevronDown
              size={16}
              className={`sidebar__camps-chevron${open ? ' sidebar__camps-chevron--open' : ''}`}
              aria-hidden
            />
          </>
        )}
      </button>

      {open && (
        <div id="sidebar-camps-list" className="sidebar__camps-panel" role="region" aria-label="Camps">
          {loading && <p className="sidebar__camps-status">Loading camps…</p>}

          {!loading && camps.length > 0 && (
            <ul className="sidebar__camps-list">
              {camps.map((camp) => {
                const isSelected = camp.camp_no === selectedCampNo;
                const isSelecting = selectingCampNo === camp.camp_no;

                return (
                  <li key={camp.camp_no}>
                    <button
                      type="button"
                      className={`sidebar__camp-item${isSelected ? ' sidebar__camp-item--active' : ''}`}
                      onClick={() => void handleSelectCamp(camp)}
                      disabled={selectingCampNo !== null}
                      aria-current={isSelected ? 'true' : undefined}
                    >
                      <span className="sidebar__camp-item-name">{camp.camp_name}</span>
                      <span className="sidebar__camp-item-meta">
                        {camp.organization_name} · {formatCampDate(camp.start_date)}
                      </span>
                      {isSelecting && (
                        <span className="sidebar__camp-item-loading">Opening…</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && !error && camps.length === 0 && (
            <p className="sidebar__camps-status">No camps found.</p>
          )}

          {error && (
            <p className="sidebar__camps-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
