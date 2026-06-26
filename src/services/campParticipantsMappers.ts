import type { ApiCampParticipant } from './apiTypes';
import type { EmployeeRecord } from '../types';

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

export function mapCampParticipantToEmployee(
  participant: ApiCampParticipant,
  index: number,
): EmployeeRecord {
  const baseId =
    participant.user_id != null ? String(participant.user_id) : `participant-${index + 1}`;

  return {
    id: `${baseId}-${index}`,
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
  };
}

export function mapCampParticipantsToEmployees(participants: ApiCampParticipant[]): EmployeeRecord[] {
  return participants.map(mapCampParticipantToEmployee);
}
