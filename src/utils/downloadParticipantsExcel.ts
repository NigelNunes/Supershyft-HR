import * as XLSX from 'xlsx';
import type { ApiCampParticipant } from '../services/apiTypes';

type CellValue = string | number | boolean;

const PREFERRED_COLUMNS = [
  'participants_employee_id',
  'first_name',
  'last_name',
  'name',
  'phone',
  'email',
  'gender',
  'age',
  'questionnaires.physical-measurement',
  'questionnaires.vitals',
  'questionnaires.diet-lifestyle-parameters',
  'reports.blood_report_generated',
  'reports.blood_report_sent',
  'reports.bio_ai_report_generated',
  'reports.bio_ai_report_sent',
  'consultations',
] as const;

const EXCLUDED_COLUMNS = new Set([
  'engagement_participant_id',
  'engagement_id',
  'user_id',
  'blood_group',
  'participant_blood_group',
  'department',
  'participant_department',
  'questionnaires.blood-parameters',
  'questionnaires.advanced-blood-parameters',
]);

const COLUMN_LABELS: Record<string, string> = {
  consultations: 'Consultation Requested',
};

function toCellValue(value: unknown): CellValue {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return JSON.stringify(value);
}

function flattenRecord(value: unknown, prefix = ''): Record<string, CellValue> {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? { [prefix]: toCellValue(value) } : {};
  }

  const out: Record<string, CellValue> = {};
  for (const [key, nested] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (nested != null && typeof nested === 'object' && !Array.isArray(nested)) {
      Object.assign(out, flattenRecord(nested, path));
    } else {
      out[path] = toCellValue(nested);
    }
  }
  return out;
}

function columnOrder(rows: Record<string, CellValue>[]): string[] {
  const seen = new Set<string>();
  const extra: string[] = [];

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (seen.has(key) || EXCLUDED_COLUMNS.has(key)) continue;
      seen.add(key);
      extra.push(key);
    }
  }

  const preferred = PREFERRED_COLUMNS.filter((key) => seen.has(key));
  const preferredSet = new Set<string>(preferred);
  extra.sort((a, b) => a.localeCompare(b));
  return [...preferred, ...extra.filter((key) => !preferredSet.has(key))];
}

function sanitizeFilePart(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export function participantsExcelFileName(campName?: string | null): string {
  const date = new Date().toISOString().slice(0, 10);
  const camp = sanitizeFilePart(campName ?? '') || 'camp';
  return `${camp}-participants-${date}.xlsx`;
}

/** Download the camp participants API payload as an .xlsx workbook. */
export function downloadParticipantsExcel(
  participants: ApiCampParticipant[],
  fileName: string,
): void {
  const rows = participants.map((participant) => flattenRecord(participant));
  const headers = columnOrder(rows);
  const headerLabels = headers.map((header) => COLUMN_LABELS[header] ?? header);
  const sheetData = [
    headerLabels,
    ...rows.map((row) => headers.map((header) => row[header] ?? '')),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  worksheet['!cols'] = headerLabels.map((label) => ({
    wch: Math.min(40, Math.max(12, label.length + 2)),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
  XLSX.writeFile(workbook, fileName, { bookType: 'xlsx' });
}
