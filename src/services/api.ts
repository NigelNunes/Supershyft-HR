/**
 * API client aligned with dev-api routes.
 * HR aggregate endpoints are not exposed yet; the dashboard aggregates
 * per-employee overview + health-span-index shapes (see data/aggregateHrDashboard.ts).
 */

import { throwApiError } from './apiErrors';
import {
  clearAuthTokens,
  getRefreshToken,
  readBearerFromHeaders,
  refreshAccessToken,
  withBearer,
} from './authStorage';

const BASE =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

/** Raw refresh call — must not go through 401 retry to avoid loops. */
async function postRefreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
  const res = await fetch(`${BASE}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throwApiError(res, body);
  return (body?.data ?? body) as { tokens: AuthTokens };
}

async function fetchJson(
  path: string,
  init?: RequestInit,
  allowRefresh = true,
): Promise<{ res: Response; body: unknown }> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);

  if (res.status === 401 && allowRefresh && readBearerFromHeaders(init?.headers)) {
    const nextToken = await refreshAccessToken(postRefreshToken);
    if (nextToken) {
      return fetchJson(
        path,
        {
          ...init,
          headers: withBearer(
            { 'Content-Type': 'application/json', ...init?.headers },
            nextToken,
          ),
        },
        false,
      );
    }
  }

  return { res, body };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { res, body } = await fetchJson(path, init);
  if (!res.ok) throwApiError(res, body as Parameters<typeof throwApiError>[1]);
  return ((body as { data?: T } | null)?.data ?? body) as T;
}

async function requestPaginated<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; meta: import('./apiTypes').ApiPaginatedMeta }> {
  const { res, body } = await fetchJson(path, init);
  if (!res.ok) throwApiError(res, body as Parameters<typeof throwApiError>[1]);
  const payload = body as { data?: T; meta?: import('./apiTypes').ApiPaginatedMeta } | null;
  return {
    data: (payload?.data ?? []) as T,
    meta: (payload?.meta ?? { page: 1, limit: 20, total: 0 }) as import('./apiTypes').ApiPaginatedMeta,
  };
}

export const authApi = {
  sendOtp: (phone: string) =>
    request<{ session_id: number }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  resendOtp: (phone: string) =>
    request<{ session_id?: number }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    request<{ user_id: number; tokens: AuthTokens }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  refreshToken: (refreshToken: string) => postRefreshToken(refreshToken),

  logout: (refreshToken: string) =>
    request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};

export { clearAuthTokens, getRefreshToken, refreshAccessToken, postRefreshToken };

export type {
  ApiCampDashboardKpis,
  ApiCampDashboardOverallRiskScore,
  ApiCampDashboardOxidativeStress,
  ApiCampDashboardParticipationByAge,
  ApiCampDashboardDiseaseGenderSection,
  ApiCampDashboardDiseaseGenderItem,
  ApiCampDashboardSection,
  ApiCampParticipant,
  ApiCurrentUser,
  ApiMyOrganization,
  ApiOrganizationCamp,
  ApiOrganizationDepartment,
  ApiDiseaseOverview,
  ApiHealthSpanIndex,
  ApiOverviewReport,
  ApiPaginatedMeta,
  ApiPositiveWins,
  ApiRiskAnalysisItem,
  ApiRiskAnalysisList,
  ApiRiskStatus,
  CampDashboardSection,
} from './apiTypes';

/** GET /reports/{assessment_id}/overview */
export const reportsApi = {
  overview: (assessmentId: number, token: string) =>
    request<import('./apiTypes').ApiOverviewReport>(`/reports/${assessmentId}/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  /** GET /reports/{assessment_id}/risk-analysis */
  riskAnalysis: (assessmentId: number, token: string, disease?: string) => {
    const q = disease ? `?disease=${encodeURIComponent(disease)}` : '';
    return request<import('./apiTypes').ApiRiskAnalysisList | import('./apiTypes').ApiDiseaseOverview>(
      `/reports/${assessmentId}/risk-analysis${q}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  /** POST /reports/{assessment_instance_id}/health-span-index */
  healthSpanIndex: (
    assessmentInstanceId: number,
    token: string,
    sourceAssessmentInstanceIds: number[],
    includeDetails = false,
  ) =>
    request<import('./apiTypes').ApiHealthSpanIndex>(
      `/reports/${assessmentInstanceId}/health-span-index`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          source_assessment_instance_ids: sourceAssessmentInstanceIds,
          include_details: includeDetails,
        }),
      },
    ),
};

/** GET /reports/camps/{camp_no}/dashboard?section=… */
export const campDashboardApi = {
  section: <T>(campNo: number, section: import('./apiTypes').CampDashboardSection, token: string) =>
    request<import('./apiTypes').ApiCampDashboardSection<T>>(
      `/reports/camps/${campNo}/dashboard?section=${section}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  /**
   * GET /reports/camps/{camp_no}/{city}/dashboard?section=…
   * Same section query param contract as the overall camp dashboard.
   */
  citySection: <T>(
    campNo: number,
    city: string,
    section: import('./apiTypes').CampDashboardSection,
    token: string,
  ) =>
    request<import('./apiTypes').ApiCampDashboardSection<T>>(
      `/reports/camps/${campNo}/${encodeURIComponent(city)}/dashboard?section=${section}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  /**
   * GET /reports/camps/{camp_no}/department/{slug}/dashboard?section=…
   * Same section query param contract as the overall camp dashboard.
   */
  departmentSection: <T>(
    campNo: number,
    slug: string,
    section: import('./apiTypes').CampDashboardSection,
    token: string,
  ) =>
    request<import('./apiTypes').ApiCampDashboardSection<T>>(
      `/reports/camps/${campNo}/department/${encodeURIComponent(slug)}/dashboard?section=${section}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  /** PUT /reports/camps/{camp_no}/refresh — returns { report_id, section: { data, … }, report_bts } */
  refresh: (campNo: number, section: import('./apiTypes').CampDashboardSection, token: string) =>
    request<Record<string, unknown>>(`/reports/camps/${campNo}/refresh`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ section }),
    }),
};

type CampParticipantsListOptions = {
  limit?: number;
  signal?: AbortSignal;
  onPage?: (accumulated: import('./apiTypes').ApiCampParticipant[], total: number) => void;
};

/** GET /reports/camps/{camp_no}/participants (+ department variant) */
export const campParticipantsApi = {
  list: (campNo: number, token: string, page = 1, limit = 20, init?: RequestInit) =>
    requestPaginated<import('./apiTypes').ApiCampParticipant[]>(
      `/reports/camps/${campNo}/participants?page=${page}&limit=${limit}`,
      { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers } },
    ),

  listByDepartment: (
    campNo: number,
    slug: string,
    token: string,
    page = 1,
    limit = 20,
    init?: RequestInit,
  ) =>
    requestPaginated<import('./apiTypes').ApiCampParticipant[]>(
      `/reports/camps/${campNo}/department/${encodeURIComponent(slug)}/participants?page=${page}&limit=${limit}`,
      { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers } },
    ),

  /**
   * GET /reports/camps/{camp_no}/{city}/participants
   * Same pagination contract as the overall camp participants list.
   */
  listByCity: (
    campNo: number,
    city: string,
    token: string,
    page = 1,
    limit = 20,
    init?: RequestInit,
  ) =>
    requestPaginated<import('./apiTypes').ApiCampParticipant[]>(
      `/reports/camps/${campNo}/${encodeURIComponent(city)}/participants?page=${page}&limit=${limit}`,
      { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers } },
    ),

  async listAll(campNo: number, token: string, options?: CampParticipantsListOptions) {
    const limit = options?.limit ?? 100;
    let page = 1;
    const items: import('./apiTypes').ApiCampParticipant[] = [];
    let total = 0;
    const init = options?.signal ? { signal: options.signal } : undefined;

    while (true) {
      if (options?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const { data, meta } = await campParticipantsApi.list(campNo, token, page, limit, init);
      items.push(...data);
      total = meta.total;
      options?.onPage?.(items, total || items.length);
      if (items.length >= total || data.length < limit) break;
      page += 1;
    }

    return { items, total };
  },

  async listAllByDepartment(
    campNo: number,
    slug: string,
    token: string,
    options?: CampParticipantsListOptions,
  ) {
    const limit = options?.limit ?? 100;
    let page = 1;
    const items: import('./apiTypes').ApiCampParticipant[] = [];
    let total = 0;
    const init = options?.signal ? { signal: options.signal } : undefined;

    while (true) {
      if (options?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const { data, meta } = await campParticipantsApi.listByDepartment(
        campNo,
        slug,
        token,
        page,
        limit,
        init,
      );
      items.push(...data);
      total = meta.total;
      options?.onPage?.(items, total || items.length);
      if (items.length >= total || data.length < limit) break;
      page += 1;
    }

    return { items, total };
  },
};

/** GET /organizations/we, /organizations/camps, /organizations/{id}/camps */
export const organizationsApi = {
  /** Admin-scoped camp list. */
  listVisibleCamps: (token: string, page = 1, limit = 20) =>
    requestPaginated<import('./apiTypes').ApiOrganizationCamp[]>(
      `/organizations/camps?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  listMyOrganizations: (token: string, page = 1, limit = 20) =>
    requestPaginated<import('./apiTypes').ApiMyOrganization[]>(
      `/organizations/we?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  /** Current user's organization (includes department names). */
  getMe: (token: string) =>
    request<import('./apiTypes').ApiMyOrganization>('/organizations/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  get: (organizationId: number, token: string) =>
    request<import('./apiTypes').ApiMyOrganization>(`/organizations/${organizationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  async getFromMyOrganizations(organizationId: number, token: string) {
    const { items } = await organizationsApi.listAllMyOrganizations(token);
    return items.find((org) => org.organization_id === organizationId) ?? null;
  },

  /** Load org profile (prefer /organizations/me) for the selected camp's organization_id. */
  async getForSelectedCamp(organizationId: number, token: string) {
    try {
      const me = await organizationsApi.getMe(token);
      if (me && (me.organization_id == null || me.organization_id === organizationId)) {
        return me;
      }
    } catch {
      // Fall through to /organizations/we and /organizations/{id}.
    }

    const fromWe = await organizationsApi.getFromMyOrganizations(organizationId, token);
    if (fromWe) return fromWe;

    try {
      return await organizationsApi.get(organizationId, token);
    } catch {
      return null;
    }
  },

  async listAllMyOrganizations(token: string) {
    const limit = 20;
    let page = 1;
    const items: import('./apiTypes').ApiMyOrganization[] = [];
    let total = 0;

    while (true) {
      const { data, meta } = await organizationsApi.listMyOrganizations(token, page, limit);
      items.push(...data);
      total = meta.total;
      if (items.length >= total || data.length < limit) break;
      page += 1;
    }

    return { items, total };
  },

  listCamps: (organizationId: number, token: string, page = 1, limit = 20) =>
    requestPaginated<import('./apiTypes').ApiOrganizationCamp[]>(
      `/organizations/${organizationId}/camps?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  async listAllVisibleCamps(token: string) {
    const limit = 20;
    let page = 1;
    const items: import('./apiTypes').ApiOrganizationCamp[] = [];
    let total = 0;

    while (true) {
      const { data, meta } = await organizationsApi.listVisibleCamps(token, page, limit);
      items.push(...data);
      total = meta.total;
      if (items.length >= total || data.length < limit) break;
      page += 1;
    }

    return { items, total };
  },

  async listAllCamps(organizationId: number, token: string) {
    const limit = 20;
    let page = 1;
    const items: import('./apiTypes').ApiOrganizationCamp[] = [];
    let total = 0;

    while (true) {
      const { data, meta } = await organizationsApi.listCamps(organizationId, token, page, limit);
      items.push(...data);
      total = meta.total;
      if (items.length >= total || data.length < limit) break;
      page += 1;
    }

    return { items, total };
  },

  /** Non-admin: GET /organizations/we → camps for every accessible org */
  async listCampsForMyOrganizations(token: string) {
    const { items: organizations } = await organizationsApi.listAllMyOrganizations(token);
    if (!organizations.length) return { items: [], total: 0 };

    const results = await Promise.all(
      organizations.map((org) =>
        organizationsApi.listAllCamps(org.organization_id, token).catch(() => ({
          items: [] as import('./apiTypes').ApiOrganizationCamp[],
          total: 0,
        })),
      ),
    );

    const byCampNo = new Map<number, import('./apiTypes').ApiOrganizationCamp>();
    for (const { items } of results) {
      for (const camp of items) {
        byCampNo.set(camp.camp_no, camp);
      }
    }

    const items = Array.from(byCampNo.values());
    return { items, total: items.length };
  },

  /**
   * Camp picker loader — role branching must match product rules:
   * - admin     → GET /organizations/camps (paginate)
   * - non-admin → GET /organizations/we → camps for each organization_id
   * Do not use /organizations/we for admin camp lists.
   */
  async listCampsForUser(token: string, role?: string | null) {
    let resolvedRole = role ?? null;
    if (!resolvedRole) {
      const user = await request<import('./apiTypes').ApiCurrentUser>('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      resolvedRole = user.employee?.role ?? null;
    }

    if (resolvedRole === 'admin') {
      return organizationsApi.listAllVisibleCamps(token);
    }

    return organizationsApi.listCampsForMyOrganizations(token);
  },
};

/** GET /users/me */
export const usersApi = {
  me: (token: string) =>
    request<import('./apiTypes').ApiCurrentUser>('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
