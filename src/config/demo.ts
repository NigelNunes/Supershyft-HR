/**
 * Demo-login branch: offline fake auth + dashboard.
 * Disabled while using live phone OTP + camp picker APIs.
 */
export const DEMO_MODE = false;

export const DEMO_PHONE = '0000000000';
export const DEMO_OTP = '0000';

export const DEMO_CAMP_NO = 1001;
export const DEMO_ORG_ID = 1;
export const DEMO_ORG_NAME = 'ABC';
export const DEMO_CAMP_NAME = 'ABC Wellness Camp 2026';

export const DEMO_TOKEN = 'demo-access-token';
export const DEMO_REFRESH_TOKEN = 'demo-refresh-token';

export function isDemoCredentials(phone: string, otp: string): boolean {
  const normalizedPhone = phone.replace(/\D/g, '');
  const normalizedOtp = otp.replace(/\D/g, '');
  return normalizedPhone === DEMO_PHONE && normalizedOtp === DEMO_OTP;
}

export function isDemoPhone(phone: string): boolean {
  return phone.replace(/\D/g, '') === DEMO_PHONE;
}
