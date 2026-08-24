import type { ApiOrganizationCamp, ApiOrganizationCampCities } from '../services/apiTypes';

export const OVERALL_LOCATION_ID = 'overall';

export interface CampLocationOption {
  id: string;
  label: string;
  description?: string;
}

function isCitiesBlock(value: unknown): value is ApiOrganizationCampCities {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Exact city strings from GET /organizations/{id}/camps — preserve API spelling
 * and order (e.g. "Bengaluru", not ranking's "Bangalore").
 */
export function citiesFromCamp(camp: ApiOrganizationCamp | null | undefined): string[] {
  if (!camp) return [];

  const names: string[] = [];
  const seen = new Set<string>();

  const push = (value: unknown) => {
    if (typeof value !== 'string') return;
    const name = value.trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    names.push(name);
  };

  const { cities } = camp;
  if (Array.isArray(cities)) {
    for (const item of cities) push(item);
  } else if (isCitiesBlock(cities) && Array.isArray(cities.cities)) {
    for (const item of cities.cities) push(item);
  }

  if (typeof camp.city === 'string') push(camp.city);

  return names;
}

/**
 * Cities for the location dropdown: prefer the selected camp, otherwise union
 * across org camps (first-seen order).
 */
export function citiesForSelectedCamp(
  camps: ApiOrganizationCamp[],
  selectedCampNo: number | null,
): string[] {
  if (selectedCampNo != null) {
    const match = camps.find((camp) => camp.camp_no === selectedCampNo);
    const fromSelected = citiesFromCamp(match);
    if (fromSelected.length > 0) return fromSelected;
  }

  const names: string[] = [];
  const seen = new Set<string>();
  for (const camp of camps) {
    for (const city of citiesFromCamp(camp)) {
      if (seen.has(city)) continue;
      seen.add(city);
      names.push(city);
    }
  }
  return names;
}

export function buildLocationOptions(cities: string[]): CampLocationOption[] {
  return [
    {
      id: OVERALL_LOCATION_ID,
      label: 'Overall',
      description: 'All cities combined',
    },
    ...cities.map((city) => ({
      id: city,
      label: city,
      description: 'City dashboard',
    })),
  ];
}

export function isOverallLocation(city: string | null | undefined): boolean {
  return !city || city === OVERALL_LOCATION_ID;
}
