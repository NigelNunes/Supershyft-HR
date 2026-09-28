import { isOverallLocation } from './campCities';

/** Nvidia camp that starts on 31 August 2026. Other camps are unchanged. */
const NVIDIA_CAMP_DATE = '2026-08-31';

const CONSULTATIONS_BY_CITY: Record<string, number> = {
  overall: 1184,
  gurugram: 27,
  gurgaon: 27,
  hyderabad: 127,
  bengaluru: 818,
  bangalore: 818,
  pune: 212,
};

function calendarDate(startDate: string | null | undefined): string | null {
  if (!startDate?.trim()) return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(startDate.trim());
  return match?.[1] ?? null;
}

function isNvidiaName(value: string | null | undefined): boolean {
  const name = value?.trim().toLowerCase() ?? '';
  return name.includes('nvidia') || name.includes('nvida');
}

export function isNvidia31August2026Camp(camp: {
  campName?: string | null;
  organizationName?: string | null;
  startDate?: string | null;
}): boolean {
  if (calendarDate(camp.startDate) !== NVIDIA_CAMP_DATE) return false;
  return isNvidiaName(camp.campName) || isNvidiaName(camp.organizationName);
}

/** Dashboard-only consultations count. Null for every other camp or city. */
export function nvidiaDashboardConsultationCount(
  camp: {
    campName?: string | null;
    organizationName?: string | null;
    startDate?: string | null;
  },
  city: string,
): number | null {
  if (!isNvidia31August2026Camp(camp)) return null;
  const key = isOverallLocation(city) ? 'overall' : city.trim().toLowerCase();
  return CONSULTATIONS_BY_CITY[key] ?? null;
}
