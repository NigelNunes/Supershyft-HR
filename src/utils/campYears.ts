import type { ApiOrganizationCamp } from '../services/apiTypes';

export type CampYearOption = string; // e.g. '2026' | 'all'

export interface CampYearChoice {
  value: CampYearOption;
  label: string;
  campNo: number | null;
}

/** Extract calendar year from camp start_date (ISO or YYYY-MM-DD). */
export function yearFromCampStartDate(startDate: string | null | undefined): string | null {
  if (!startDate?.trim()) return null;
  const trimmed = startDate.trim();
  const isoYear = /^(\d{4})/.exec(trimmed);
  if (isoYear) return isoYear[1];
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return String(parsed.getFullYear());
  return null;
}

/**
 * One camp per calendar year (newest start_date wins when duplicates exist).
 * Years sorted newest → oldest.
 */
export function buildCampYearChoices(camps: ApiOrganizationCamp[]): CampYearChoice[] {
  const byYear = new Map<string, ApiOrganizationCamp>();

  const sorted = [...camps].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
  );

  for (const camp of sorted) {
    const year = yearFromCampStartDate(camp.start_date);
    if (!year || byYear.has(year)) continue;
    byYear.set(year, camp);
  }

  const years = [...byYear.keys()].sort((a, b) => Number(b) - Number(a));
  const choices: CampYearChoice[] = years.map((year) => ({
    value: year,
    label: year,
    campNo: byYear.get(year)!.camp_no,
  }));

  if (years.length > 1) {
    choices.push({ value: 'all', label: 'All Years', campNo: null });
  }

  return choices;
}

export function campForYear(
  camps: ApiOrganizationCamp[],
  year: string,
): ApiOrganizationCamp | null {
  if (!year || year === 'all') return null;
  const choices = buildCampYearChoices(camps);
  const match = choices.find((c) => c.value === year);
  if (!match?.campNo) return null;
  return camps.find((c) => c.camp_no === match.campNo) ?? null;
}
