/**
 * API client aligned with dev-api routes.
 * HR aggregate endpoints are not yet exposed; dashboard uses mock data
 * and will call these when backend HR routes ship.
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

/** Individual report shape from dev-api IndividualHealthReport.reports JSON */
export interface IndividualReportPayload {
  metabolic_age?: number;
  diseases?: Array<{
    code: string;
    name: string;
    risk_status: string;
    risk_score_scaled: number;
    healthy_percentile?: number;
  }>;
}

export const reportsApi = {
  overview: (assessmentId: number, token: string) =>
    request<{ metabolic_age: number; risk_analysis: unknown[] }>(`/reports/${assessmentId}/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  riskAnalysis: (assessmentId: number, token: string, disease?: string) => {
    const q = disease ? `?disease=${encodeURIComponent(disease)}` : '';
    return request<unknown>(`/reports/${assessmentId}/risk-analysis${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
