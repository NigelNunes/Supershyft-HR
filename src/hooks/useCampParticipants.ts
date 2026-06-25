import { useEffect, useState } from 'react';
import { DEFAULT_CAMP_NO } from '../config/camp';
import { useAuth } from '../contexts/AuthContext';
import { campParticipantsApi } from '../services/api';
import { mapCampParticipantsToEmployees } from '../services/campParticipantsMappers';
import type { EmployeeRecord } from '../types';

interface CampParticipantsState {
  employees: EmployeeRecord[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function useCampParticipants(): CampParticipantsState {
  const { accessToken } = useAuth();
  const [state, setState] = useState<CampParticipantsState>({
    employees: [],
    total: 0,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!accessToken) {
      setState({ employees: [], total: 0, loading: false, error: 'Not authenticated' });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    campParticipantsApi
      .listAll(DEFAULT_CAMP_NO, accessToken)
      .then(({ items, total }) => {
        if (cancelled) return;
        setState({
          employees: mapCampParticipantsToEmployees(items),
          total,
          loading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Request failed';
        setState({ employees: [], total: 0, loading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return state;
}
