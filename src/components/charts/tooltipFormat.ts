export function pctTooltip(value: unknown, name: unknown): [string, string] {
  const v = typeof value === 'number' ? value : Number(value);
  const label = String(name ?? '').trim();
  const formatted = Number.isFinite(v) ? `${v}%` : '—';
  return [formatted, label || 'Value'];
}

export function numTooltip(value: unknown, name: unknown): [string | number, string] {
  const v = typeof value === 'number' ? value : Number(value);
  return [Number.isFinite(v) ? v : 0, String(name ?? '')];
}
