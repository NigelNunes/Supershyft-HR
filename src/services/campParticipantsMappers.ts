import type { ApiCampParticipant } from './apiTypes';
import type { EmployeeRecord, JourneyStepId, JourneyStepStatus } from '../types';

function normalizeGender(value: string | null | undefined): EmployeeRecord['gender'] {
  const raw = (value ?? '').trim().toLowerCase();
  if (raw === 'male' || raw === 'm') return 'Male';
  if (raw === 'female' || raw === 'f') return 'Female';
  if (raw === 'other') return 'Other';
  return 'Other';
}

function optionalApiText(...candidates: Array<string | number | null | undefined>): string | undefined {
  for (const raw of candidates) {
    if (raw == null) continue;
    const value = String(raw).trim();
    if (value) return value;
  }
  return undefined;
}

function displayName(participant: ApiCampParticipant): string {
  const explicit = participant.name?.trim();
  if (explicit) return explicit;

  return [participant.first_name, participant.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}

function apiEmployeeId(participant: ApiCampParticipant): string | undefined {
  return optionalApiText(
    participant.employee_id,
    participant.employee_code,
    participant.user_id,
  );
}

function boolStatus(value: boolean | null | undefined): JourneyStepStatus {
  return value === true ? 'completed' : 'pending';
}

/** Humanize API department slug when org label is unavailable. */
export function formatDepartmentLabel(slugOrName: string | null | undefined): string {
  const raw = (slugOrName ?? '').trim();
  if (!raw) return '-';
  if (raw.includes(' ') && !raw.includes('_')) return raw;
  return raw
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildJourneyFromParticipant(
  participant: ApiCampParticipant,
): EmployeeRecord['journey'] {
  const q = participant.questionnaires ?? {};
  const reports = participant.reports ?? {};

  return {
    anthropometry: boolStatus(q['physical-measurement']),
    vitals: boolStatus(q.vitals),
    dietLifestyle: boolStatus(q['diet-lifestyle-parameters']),
    bloodReport: boolStatus(reports.blood_report_generated),
    bloodReportAi: boolStatus(reports.blood_report_sent),
    bioAiReport: boolStatus(reports.bio_ai_report_generated),
    bioAiShared: boolStatus(reports.bio_ai_report_sent),
    consultations: boolStatus(participant.consultations),
  };
}

export function mapCampParticipantToEmployee(
  participant: ApiCampParticipant,
  index: number,
  departmentLabels?: Map<string, string>,
): EmployeeRecord {
  const baseId =
    participant.engagement_participant_id != null
      ? String(participant.engagement_participant_id)
      : participant.user_id != null
        ? String(participant.user_id)
        : `participant-${index + 1}`;
  const id = `${baseId}-${index}`;

  const departmentSlug = (
    participant.participant_department?.trim() ||
    participant.department?.trim() ||
    ''
  ).toLowerCase();

  const rawDepartment = participant.participant_department || participant.department || '';
  const department =
    (departmentSlug && departmentLabels?.get(departmentSlug)) ||
    (rawDepartment.trim() ? formatDepartmentLabel(rawDepartment) : '');

  const employeeId = apiEmployeeId(participant);

  return {
    id,
    employeeId,
    name: displayName(participant),
    phone: participant.phone?.trim() || '-',
    email: participant.email?.trim() || '',
    bloodGroup:
      participant.participant_blood_group?.trim() ||
      participant.blood_group?.trim() ||
      '-',
    department,
    departmentSlug: departmentSlug || undefined,
    gender: normalizeGender(participant.gender),
    age: typeof participant.age === 'number' && Number.isFinite(participant.age)
      ? participant.age
      : undefined,
    journey: buildJourneyFromParticipant(participant),
  };
}

function employeeDisplayKey(employee: EmployeeRecord): string {
  const normalize = (value: string) => value.trim().toLowerCase();
  const phoneDigits = employee.phone.replace(/\D/g, '');
  return [
    normalize(employee.name),
    phoneDigits,
    normalize(employee.gender),
    normalize(employee.bloodGroup),
    normalize(employee.departmentSlug || employee.department),
  ].join('|');
}

/** Keep the first row when identity columns match. */
export function dedupeEmployeesByDisplayColumns(employees: EmployeeRecord[]): EmployeeRecord[] {
  const seen = new Set<string>();
  return employees.filter((employee) => {
    const key = employeeDisplayKey(employee);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mapCampParticipantsToEmployees(
  participants: ApiCampParticipant[],
  departmentLabels?: Map<string, string>,
): EmployeeRecord[] {
  return dedupeEmployeesByDisplayColumns(
    participants.map((participant, index) =>
      mapCampParticipantToEmployee(participant, index, departmentLabels),
    ),
  );
}

/** Used by offline aggregate helpers — maps simple flags into journey columns. */
export function buildAlignedJourney(
  _seed: string,
  flags: { bloodTestDone: boolean; doctorConsultation: boolean; bioAiDone?: boolean },
): EmployeeRecord['journey'] {
  const blood = flags.bloodTestDone;
  const bioAi = flags.bioAiDone === true;
  return {
    anthropometry: blood ? 'completed' : 'pending',
    vitals: blood ? 'completed' : 'pending',
    dietLifestyle: blood ? 'completed' : 'pending',
    bloodReport: blood ? 'completed' : 'pending',
    bloodReportAi: blood ? 'completed' : 'pending',
    bioAiReport: bioAi ? 'completed' : 'pending',
    bioAiShared: bioAi ? 'completed' : 'pending',
    consultations: flags.doctorConsultation ? 'completed' : 'pending',
  };
}

export type { JourneyStepId };
