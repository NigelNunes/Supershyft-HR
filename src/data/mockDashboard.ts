/**
 * HR dashboard data derived by aggregating simulated dev-api report payloads
 * (GET /reports/{id}/overview + POST /reports/{id}/health-span-index shapes).
 */

import type { DashboardData, DepartmentDetail, ToggleDimension } from '../types';
import {
  buildDashboardData,
  buildDepartmentDetail,
  getDashboardForToggle as toggleFromPool,
} from './aggregateHrDashboard';
import { CAMP_PARTICIPANTS } from './participantPool';

export const mockDashboard: DashboardData = buildDashboardData(CAMP_PARTICIPANTS);

export function getDashboardForToggle(
  dimension: ToggleDimension,
): Pick<DashboardData, 'diseases' | 'lifestyle'> {
  return toggleFromPool(dimension, CAMP_PARTICIPANTS);
}

export function getDepartmentDetail(id: string): DepartmentDetail | null {
  return buildDepartmentDetail(id, CAMP_PARTICIPANTS);
}

export { DEMO_PHONE, DEMO_OTP } from '../config/demo';
