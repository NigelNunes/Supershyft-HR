import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { campParticipantsApi } from '../services/api';
import type { ApiCampParticipant } from '../services/apiTypes';
import { mapCampParticipantsToEmployees } from '../services/campParticipantsMappers';
import type { EmployeeRecord } from '../types';
import { isOverallLocation } from '../utils/campCities';

export const PARTICIPANTS_PAGE_SIZE = 10;

interface CampParticipantsState {
  employees: EmployeeRecord[];
  /** Raw API participant rows for the current page. */
  participants: ApiCampParticipant[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  /** Fetch every participant page (e.g. Excel download). */
  fetchAll: (signal?: AbortSignal) => Promise<ApiCampParticipant[]>;
}

function matchesDepartment(employee: EmployeeRecord, slug: string): boolean {
  const needle = slug.trim().toLowerCase();
  if (!needle) return true;
  return (
    employee.departmentSlug?.trim().toLowerCase() === needle ||
    employee.department.trim().toLowerCase() === needle
  );
}

type FetchArgs = {
  campNo: number;
  token: string;
  city: string;
  departmentSlug?: string | null;
  page: number;
  limit: number;
  signal?: AbortSignal;
};

async function fetchParticipantsPage({
  campNo,
  token,
  city,
  departmentSlug,
  page,
  limit,
  signal,
}: FetchArgs) {
  const slug = departmentSlug?.trim() && departmentSlug !== 'all' ? departmentSlug.trim() : null;
  const cityScoped = !isOverallLocation(city);
  const init = signal ? { signal } : undefined;

  if (cityScoped) {
    return campParticipantsApi.listByCity(campNo, city, token, page, limit, init);
  }
  if (slug) {
    return campParticipantsApi.listByDepartment(campNo, slug, token, page, limit, init);
  }
  return campParticipantsApi.list(campNo, token, page, limit, init);
}

/**
 * Load a single camp participants page from the API.
 * - city selected → GET /reports/camps/{camp_no}/{city}/participants
 * - overall + department → GET /reports/camps/{camp_no}/department/{slug}/participants
 * - overall → GET /reports/camps/{camp_no}/participants
 */
export function useCampParticipants(
  departmentSlug?: string | null,
  page = 1,
  limit = PARTICIPANTS_PAGE_SIZE,
): CampParticipantsState {
  const { accessToken } = useAuth();
  const { selectedCampNo, selectedCity } = useCamp();
  const { departments } = useOrganization();
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({
    employees: [] as EmployeeRecord[],
    participants: [] as ApiCampParticipant[],
    total: 0,
    loading: true,
    error: null as string | null,
  });

  // Labels for mapping only — must not restart the fetch when org departments arrive.
  const departmentLabelsRef = useRef(
    new Map(departments.map((d) => [d.slug.trim().toLowerCase(), d.department])),
  );
  departmentLabelsRef.current = new Map(
    departments.map((d) => [d.slug.trim().toLowerCase(), d.department]),
  );
  const filterRef = useRef({ departmentSlug, selectedCity });
  filterRef.current = { departmentSlug, selectedCity };

  useEffect(() => {
    setState((prev) => {
      if (prev.participants.length === 0) return prev;
      const slug =
        filterRef.current.departmentSlug?.trim() && filterRef.current.departmentSlug !== 'all'
          ? filterRef.current.departmentSlug.trim()
          : null;
      const cityScoped = !isOverallLocation(filterRef.current.selectedCity);
      let employees = mapCampParticipantsToEmployees(
        prev.participants,
        departmentLabelsRef.current,
      );
      if (cityScoped && slug) {
        employees = employees.filter((employee) => matchesDepartment(employee, slug));
      }
      return {
        ...prev,
        employees,
      };
    });
  }, [departments]);

  useEffect(() => {
    if (!accessToken || !selectedCampNo) {
      setState({
        employees: [],
        participants: [],
        total: 0,
        loading: false,
        error: 'Not authenticated',
      });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    const slug = departmentSlug?.trim() && departmentSlug !== 'all' ? departmentSlug.trim() : null;
    const cityScoped = !isOverallLocation(selectedCity);

    void (async () => {
      try {
        const { data, meta } = await fetchParticipantsPage({
          campNo: selectedCampNo,
          token: accessToken,
          city: selectedCity,
          departmentSlug,
          page,
          limit,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        let employees = mapCampParticipantsToEmployees(data, departmentLabelsRef.current);
        if (cityScoped && slug) {
          employees = employees.filter((employee) => matchesDepartment(employee, slug));
        }

        setState({
          employees,
          participants: data,
          total: meta.total || data.length,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load employees',
        }));
      }
    })();

    return () => {
      controller.abort();
    };
  }, [accessToken, selectedCampNo, selectedCity, departmentSlug, page, limit, refreshKey]);

  const fetchAll = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken || !selectedCampNo) {
        throw new Error('Not authenticated');
      }

      const items: ApiCampParticipant[] = [];
      let nextPage = 1;
      const batchLimit = 100;

      while (true) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const { data, meta } = await fetchParticipantsPage({
          campNo: selectedCampNo,
          token: accessToken,
          city: selectedCity,
          departmentSlug,
          page: nextPage,
          limit: batchLimit,
          signal,
        });
        items.push(...data);
        const total = meta.total || items.length;
        if (items.length >= total || data.length < batchLimit) break;
        nextPage += 1;
      }

      return items;
    },
    [accessToken, selectedCampNo, selectedCity, departmentSlug],
  );

  return {
    ...state,
    page,
    limit,
    refresh: () => setRefreshKey((key) => key + 1),
    fetchAll,
  };
}
