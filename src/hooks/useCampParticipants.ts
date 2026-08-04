import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import { mockDashboard } from '../data/mockDashboard';
import type { EmployeeRecord } from '../types';

interface CampParticipantsState {
  employees: EmployeeRecord[];
  total: number;
  loading: boolean;
  error: string | null;
}

/** Offline demo employees — never calls participants API. */
export function useCampParticipants(): CampParticipantsState {
  const { accessToken } = useAuth();
  const { selectedCampNo } = useCamp();
  const [state, setState] = useState<CampParticipantsState>({
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

    const employees = mockDashboard.employees;
    setState({
      employees,
      total: employees.length,
      loading: false,
      error: null,
    });
  }, [accessToken, selectedCampNo]);

  return state;
}
