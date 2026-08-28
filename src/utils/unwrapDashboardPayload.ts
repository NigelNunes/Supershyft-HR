/**
 * Dashboard GET/PUT payloads are wrapped as { data, name, description, meta }.
 * The API client peels one `data`; PUT /refresh often leaves another envelope.
 * Keep unwrapping while the object is only that envelope — stop on real section data
 * (KPIs, ranking city map, chart series, etc.).
 */
const ENVELOPE_KEYS = new Set([
  'data',
  'name',
  'description',
  'meta',
  'section',
  'report_id',
  'report_bts',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isSectionEnvelope(value: unknown): value is Record<string, unknown> & { data: unknown } {
  if (!isPlainObject(value) || !('data' in value) || value.data === undefined) return false;
  return Object.keys(value).every((key) => ENVELOPE_KEYS.has(key));
}

export function unwrapDashboardPayload<T>(payload: unknown): T {
  let current = payload;
  for (let i = 0; i < 5; i += 1) {
    if (!isPlainObject(current)) break;
    if ('section' in current && current.section !== undefined) {
      current = current.section;
      continue;
    }
    if (isSectionEnvelope(current)) {
      current = current.data;
      continue;
    }
    break;
  }
  return current as T;
}
