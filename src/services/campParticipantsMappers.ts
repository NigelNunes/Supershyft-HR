import type { ApiCampParticipant } from './apiTypes';
import type { EmployeeRecord, JourneyStepId, JourneyStepStatus } from '../types';

const JOURNEY_STEPS: JourneyStepId[] = [
  'anthropometry',
  'vitals',
  'dietLifestyle',
  'bloodReport',
  'bloodReportAi',
  'bioAiReport',
  'bioAiShared',
  'consultations',
];

function normalizeGender(value: string | null | undefined): EmployeeRecord['gender'] {
  const raw = (value ?? '').trim().toLowerCase();
  if (raw === 'male' || raw === 'm') return 'Male';
  if (raw === 'female' || raw === 'f') return 'Female';
  if (raw === 'other') return 'Other';
  return 'Other';
}

function displayName(participant: ApiCampParticipant): string {
  const explicit = participant.name?.trim();
  if (explicit) return explicit;

  const full = [participant.first_name, participant.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  return full || '—';
}

/** Deterministic 0–1 from string — TEMPORARY until journey API exists. */
function hashUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function statusFromRoll(roll: number): JourneyStepStatus {
  if (roll < 0.55) return 'completed';
  return 'pending';
}

/**
 * TEMPORARY — synthesize journey + age for table UI.
 * Replace with API fields when participant progress endpoints are available.
 */
export function buildTemporaryJourney(seed: string): EmployeeRecord['journey'] {
  const journey = {} as EmployeeRecord['journey'];
  let forcePending = false;
  for (const step of JOURNEY_STEPS) {
    if (forcePending) {
      journey[step] = 'pending';
      continue;
    }
    const status = statusFromRoll(hashUnit(`${seed}:${step}`));
    journey[step] = status;
    if (status !== 'completed') forcePending = true;
  }
  return journey;
}

export function temporaryAge(_seed: string): number {
  // TEMPORARY — fixed dummy age until participant age API is wired.
  return 999;
}

export function mapCampParticipantToEmployee(
  participant: ApiCampParticipant,
  index: number,
): EmployeeRecord {
  const baseId =
    participant.user_id != null ? String(participant.user_id) : `participant-${index + 1}`;
  const id = `${baseId}-${index}`;

  return {
    id,
    name: displayName(participant),
    phone: participant.phone?.trim() ?? '—',
    email: participant.email?.trim() ?? '',
    bloodGroup:
      participant.blood_group?.trim() ||
      participant.participant_blood_group?.trim() ||
      '—',
    department:
      participant.department?.trim() ||
      participant.participant_department?.trim() ||
      '—',
    gender: normalizeGender(participant.gender),
    age: temporaryAge(id),
    journey: buildTemporaryJourney(id),
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
    normalize(employee.department),
  ].join('|');
}

/** Keep the first row when name, phone, gender, blood group, and department all match. */
export function dedupeEmployeesByDisplayColumns(employees: EmployeeRecord[]): EmployeeRecord[] {
  const seen = new Set<string>();
  return employees.filter((employee) => {
    const key = employeeDisplayKey(employee);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mapCampParticipantsToEmployees(participants: ApiCampParticipant[]): EmployeeRecord[] {
  return dedupeEmployeesByDisplayColumns(
    participants.map((participant, index) => mapCampParticipantToEmployee(participant, index)),
  );
}
