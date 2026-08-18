import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { campParticipantsApi } from '../services/api';
import { mapCampParticipantsToEmployees } from '../services/campParticipantsMappers';
import type { EmployeeRecord } from '../types';

interface CampParticipantsState {
  employees: EmployeeRecord[];
  total: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Load camp participants.
 * - departmentSlug omitted / 'all' → GET /reports/camps/{camp_no}/participants
 * - otherwise → GET /reports/camps/{camp_no}/department/{slug}/participants
 */
export function useCampParticipants(departmentSlug?: string | null): CampParticipantsState {
  const { accessToken } = useAuth();
  const { selectedCampNo } = useCamp();
  const { departments } = useOrganization();
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState<Omit<CampParticipantsState, 'refresh'>>({
    employees: [],
    total: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!accessToken || !selectedCampNo) {
      setState({ employees: [], total: 0, loading: false, error: 'Not authenticated' });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const slug = departmentSlug?.trim() && departmentSlug !== 'all' ? departmentSlug.trim() : null;
    const departmentLabels = new Map(
      departments.map((d) => [d.slug.trim().toLowerCase(), d.department]),
    );

    const load = slug
      ? campParticipantsApi.listAllByDepartment(selectedCampNo, slug, accessToken)
      : campParticipantsApi.listAll(selectedCampNo, accessToken);

    void load
      .then(({ items, total }) => {
        if (cancelled) return;
        const employees = mapCampParticipantsToEmployees(items, departmentLabels);
        setState({
          employees,
          total: total || employees.length,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          employees: [],
          total: 0,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load employees',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, selectedCampNo, departmentSlug, departments, refreshKey]);

  return {
    ...state,
    refresh: () => setRefreshKey((key) => key + 1),
  };
}
