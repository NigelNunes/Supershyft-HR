/**
 * Dashboard GET/PUT payloads are wrapped as { data, name, description, intelligence?, meta }.
 * The API client peels one outer `data`; PUT /refresh often leaves another envelope.
 * Keep peeling while the object is only that envelope — stop on real section data
 * (KPIs, ranking city map, chart series, etc.).
 *
 * Prefer `parseDashboardSection` when the caller needs `intelligence`.
 */

const ENVELOPE_KEYS = new Set([
  'data',
  'name',
  'description',
  'meta',
  'section',
  'report_id',
  'report_bts',
  'intelligence',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isSectionEnvelope(value: unknown): value is Record<string, unknown> & { data: unknown } {
  if (!isPlainObject(value) || !('data' in value) || value.data === undefined) return false;
  return Object.keys(value).every((key) => ENVELOPE_KEYS.has(key));
}

export interface ParsedDashboardSection<T> {
  data: T;
  /** Raw `intelligence` from the section envelope (shape varies by section). */
  intelligence: unknown;
  name: string | null;
  description: string | null;
}

/**
 * Peel refresh/client wrappers and return section `data` plus sibling `intelligence`.
 */
export function parseDashboardSection<T>(payload: unknown): ParsedDashboardSection<T> {
  let current: unknown = payload;
  for (let i = 0; i < 5; i += 1) {
    if (!isPlainObject(current)) break;
    if ('section' in current && current.section !== undefined) {
      current = current.section;
      continue;
    }
    if (isSectionEnvelope(current)) {
      const name = typeof current.name === 'string' ? current.name : null;
      const description = typeof current.description === 'string' ? current.description : null;
      return {
        data: current.data as T,
        intelligence: current.intelligence ?? null,
        name,
        description,
      };
    }
    break;
  }

  return {
    data: current as T,
    intelligence: null,
    name: null,
    description: null,
  };
}

/** @deprecated Prefer parseDashboardSection when intelligence is needed. */
export function unwrapDashboardPayload<T>(payload: unknown): T {
  return parseDashboardSection<T>(payload).data;
}
