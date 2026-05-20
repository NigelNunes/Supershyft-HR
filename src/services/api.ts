/**
 * API client aligned with dev-api routes.
 * HR aggregate endpoints are not exposed yet; the dashboard aggregates
 * per-employee overview + health-span-index shapes (see data/aggregateHrDashboard.ts).
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message || body?.detail || 'Request failed');
  return (body?.data ?? body) as T;
}

export const authApi = {
  sendOtp: (phone: string) =>
    request<{ session_id: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ user_id: number; tokens: { access_token: string; refresh_token: string } }>(
      '/auth/verify-otp',
      { method: 'POST', body: JSON.stringify({ phone, otp }) },
    ),
};

export type {
  ApiDiseaseOverview,
  ApiHealthSpanIndex,
  ApiOverviewReport,
  ApiPositiveWins,
  ApiRiskAnalysisItem,
  ApiRiskAnalysisList,
  ApiRiskStatus,
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
