/**
 * API client aligned with dev-api routes.
 * HR aggregate endpoints are not exposed yet; the dashboard aggregates
 * per-employee overview + health-span-index shapes (see data/aggregateHrDashboard.ts).
 */

import { throwApiError } from './apiErrors';

const BASE =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throwApiError(res, body);
  return (body?.data ?? body) as T;
}

async function requestPaginated<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; meta: import('./apiTypes').ApiPaginatedMeta }> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throwApiError(res, body);
  return {
    data: (body?.data ?? []) as T,
    meta: (body?.meta ?? { page: 1, limit: 20, total: 0 }) as import('./apiTypes').ApiPaginatedMeta,
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type?: string;
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

  refreshToken: (refreshToken: string) =>
    request<{ tokens: AuthTokens }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (refreshToken: string) =>
    request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};

export type {
  ApiCampDashboardKpis,
  ApiCampDashboardOverallRiskScore,
  ApiCampDashboardOxidativeStress,
  ApiCampDashboardParticipationByAge,
  ApiCampDashboardDiseaseGenderSection,
  ApiCampDashboardDiseaseGenderItem,
  ApiCampDashboardSection,
  ApiAssessment,
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
};

/** GET /reports/camps/{camp_no}/participants */
export const campParticipantsApi = {
  list: (campNo: number, token: string, page = 1, limit = 100) =>
    requestPaginated<import('./apiTypes').ApiCampParticipant[]>(
      `/reports/camps/${campNo}/participants?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  async listAll(campNo: number, token: string) {
    const limit = 100;
    let page = 1;
    const items: import('./apiTypes').ApiCampParticipant[] = [];
    let total = 0;

    while (true) {
      const { data, meta } = await campParticipantsApi.list(campNo, token, page, limit);
      items.push(...data);
      total = meta.total;
      if (items.length >= total || data.length < limit) break;
      page += 1;
    }

    return { items, total };
  },
};

/** GET /assessments/me */
export const assessmentsApi = {
  list: (token: string, page = 1, limit = 20) =>
    requestPaginated<import('./apiTypes').ApiAssessment[]>(
      `/assessments/me?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  async listAll(token: string) {
    const limit = 20;
    let page = 1;
    const items: import('./apiTypes').ApiAssessment[] = [];
    let total = 0;

    while (true) {
      const { data, meta } = await assessmentsApi.list(token, page, limit);
      items.push(...data);
      total = meta.total;
      if (items.length >= total || data.length < limit) break;
      page += 1;
    }

    return { items, total };
  },
};

/** GET /organizations/camps, /organizations/we, /organizations/{id}/camps */
export const organizationsApi = {
  /** Camps visible to the authenticated user (permission-scoped). */
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

  get: (organizationId: number, token: string) =>
    request<import('./apiTypes').ApiMyOrganization>(`/organizations/${organizationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  async getFromMyOrganizations(organizationId: number, token: string) {
    const { items } = await organizationsApi.listAllMyOrganizations(token);
    return items.find((org) => org.organization_id === organizationId) ?? null;
  },

  /** Load org profile for the selected camp's organization_id. */
  async getForSelectedCamp(organizationId: number, token: string) {
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

  /** Resolve camps via /organizations/we then /organizations/{id}/camps. */
  async listCampsForMyOrganizations(token: string) {
    const { items: organizations } = await organizationsApi.listAllMyOrganizations(token);
    if (!organizations.length) return { items: [], total: 0 };

    const organizationId = organizations[0].organization_id;
    return organizationsApi.listAllCamps(organizationId, token);
  },

  /** Prefer permission-scoped camp list; fall back to org-specific list. */
  async listCampsForUser(token: string) {
    try {
      const visible = await organizationsApi.listAllVisibleCamps(token);
      if (visible.items.length > 0) return visible;
    } catch {
      // Fall through to organization-scoped lookup.
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
