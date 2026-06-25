import type { ApiCurrentUser } from '../services/apiTypes';

export function formatUserDisplayName(user: ApiCurrentUser): string {
  const name = [user.first_name, user.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  return name || user.email?.trim() || user.phone?.trim() || 'User';
}

export function formatUserPhone(phone: string | null | undefined): string {
  if (!phone?.trim()) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return phone.trim();
}

export function userInitial(user: ApiCurrentUser | null): string {
  if (!user) return '?';
  const name = formatUserDisplayName(user);
  return name.charAt(0).toUpperCase() || '?';
}
