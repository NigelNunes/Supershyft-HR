import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCamp } from '../contexts/CampContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { campParticipantsApi } from '../services/api';
import type { ApiCampParticipant } from '../services/apiTypes';
import { mapCampParticipantsToEmployees } from '../services/campParticipantsMappers';
import type { EmployeeRecord } from '../types';
import { isOverallLocation } from '../utils/campCities';

const PAGE_LIMIT = 20;

interface CampParticipantsState {
  employees: EmployeeRecord[];
  /** Raw API participant rows for the current camp/city/department fetch. */
  participants: ApiCampParticipant[];
  total: number;
  /** True until the first page of employees is available. */
  loading: boolean;
  /** True while later pages are still being fetched in the background. */
  loadingMore: boolean;
  /** True only after every participant page has been fetched successfully. */
  allLoaded: boolean;
  error: string | null;
  refresh: () => void;
}

function matchesDepartment(employee: EmployeeRecord, slug: string): boolean {
  const needle = slug.trim().toLowerCase();
  if (!needle) return true;
  return (
    employee.departmentSlug?.trim().toLowerCase() === needle ||
    employee.department.trim().toLowerCase() === needle
  );
}

/**
 * Load camp participants page-by-page so the table can render as soon as
 * the first API page returns; remaining pages continue in the background.
 * - city selected → GET /reports/camps/{camp_no}/{city}/participants
 * - overall + department → GET /reports/camps/{camp_no}/department/{slug}/participants
 * - overall → GET /reports/camps/{camp_no}/participants
 */
export function useCampParticipants(departmentSlug?: string | null): CampParticipantsState {
  const { accessToken } = useAuth();
  const { selectedCampNo, selectedCity } = useCamp();
  const { departments } = useOrganization();
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState<Omit<CampParticipantsState, 'refresh'>>({
    employees: [],
    participants: [],
    total: 0,
    loading: true,
    loadingMore: false,
    allLoaded: false,
    error: null,
  });

  useEffect(() => {
    if (!accessToken || !selectedCampNo) {
      setState({
        employees: [],
        participants: [],
        total: 0,
        loading: false,
        loadingMore: false,
        allLoaded: false,
        error: 'Not authenticated',
      });
      return;
    }

    let cancelled = false;
    setState({
      employees: [],
      participants: [],
      total: 0,
      loading: true,
      loadingMore: false,
      allLoaded: false,
      error: null,
    });

    const slug = departmentSlug?.trim() && departmentSlug !== 'all' ? departmentSlug.trim() : null;
    const cityScoped = !isOverallLocation(selectedCity);
    const departmentLabels = new Map(
      departments.map((d) => [d.slug.trim().toLowerCase(), d.department]),
    );

    const fetchPage = (page: number) => {
      if (cityScoped) {
        return campParticipantsApi.listByCity(
          selectedCampNo,
          selectedCity,
          accessToken,
          page,
          PAGE_LIMIT,
        );
      }
      if (slug) {
        return campParticipantsApi.listByDepartment(
          selectedCampNo,
          slug,
          accessToken,
          page,
          PAGE_LIMIT,
        );
      }
      return campParticipantsApi.list(selectedCampNo, accessToken, page, PAGE_LIMIT);
    };

    void (async () => {
      const items: ApiCampParticipant[] = [];
      let page = 1;

      try {
        while (true) {
          const { data, meta } = await fetchPage(page);
          if (cancelled) return;

          items.push(...data);
          let employees = mapCampParticipantsToEmployees(items, departmentLabels);
          if (cityScoped && slug) {
            employees = employees.filter((employee) => matchesDepartment(employee, slug));
          }
          const total = cityScoped && slug ? employees.length : meta.total || employees.length;
          const done = items.length >= (meta.total || items.length) || data.length < PAGE_LIMIT;

          setState({
            employees,
            participants: items,
            total,
            loading: false,
            loadingMore: !done,
            allLoaded: done,
            error: null,
          });

          if (done) return;
          page += 1;
        }
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          employees: prev.employees,
          participants: prev.participants,
          total: prev.total,
          loading: false,
          loadingMore: false,
          allLoaded: false,
          error: err instanceof Error ? err.message : 'Failed to load employees',
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, selectedCampNo, selectedCity, departmentSlug, departments, refreshKey]);

  return {
    ...state,
    refresh: () => setRefreshKey((key) => key + 1),
  };
}
