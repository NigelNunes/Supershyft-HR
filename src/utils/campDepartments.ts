import type {
  ApiOrganizationCamp,
  ApiOrganizationCampDepartment,
  ApiOrganizationCampDepartments,
  ApiOrganizationDepartment,
} from '../services/apiTypes';

function isDepartmentsBlock(value: unknown): value is ApiOrganizationCampDepartments {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function pushDepartment(
  result: ApiOrganizationDepartment[],
  seen: Set<string>,
  name: unknown,
  slug: unknown,
) {
  const department = typeof name === 'string' ? name.trim() : '';
  const deptSlug = typeof slug === 'string' ? slug.trim() : '';
  if (!department || !deptSlug || seen.has(deptSlug)) return;
  seen.add(deptSlug);
  result.push({ department, slug: deptSlug });
}

/**
 * Exact department name/slug pairs from GET /organizations/{id}/camps —
 * preserve API spelling and order (slug used in department dashboard paths).
 */
export function departmentsFromCamp(
  camp: ApiOrganizationCamp | null | undefined,
): ApiOrganizationDepartment[] {
  if (!camp) return [];

  const result: ApiOrganizationDepartment[] = [];
  const seen = new Set<string>();

  const { departments } = camp;
  if (Array.isArray(departments)) {
    for (const item of departments) {
      pushDepartment(result, seen, item?.name, item?.slug);
    }
  } else if (isDepartmentsBlock(departments) && Array.isArray(departments.departments)) {
    for (const item of departments.departments as ApiOrganizationCampDepartment[]) {
      pushDepartment(result, seen, item?.name, item?.slug);
    }
  }

  return result;
}

/**
 * Departments for the selected camp. Prefer that camp's list; if empty, union
 * across org camps (first-seen slug order).
 */
export function departmentsForSelectedCamp(
  camps: ApiOrganizationCamp[],
  selectedCampNo: number | null,
): ApiOrganizationDepartment[] {
  if (selectedCampNo != null) {
    const match = camps.find((camp) => camp.camp_no === selectedCampNo);
    const fromSelected = departmentsFromCamp(match);
    if (fromSelected.length > 0) return fromSelected;
  }

  const result: ApiOrganizationDepartment[] = [];
  const seen = new Set<string>();
  for (const camp of camps) {
    for (const dept of departmentsFromCamp(camp)) {
      if (seen.has(dept.slug)) continue;
      seen.add(dept.slug);
      result.push(dept);
    }
  }
  return result;
}
