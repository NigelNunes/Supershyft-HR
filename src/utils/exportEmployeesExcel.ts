import * as XLSX from 'xlsx';
import type { EmployeeRecord, JourneyStepStatus } from '../types';

function statusLabel(status: JourneyStepStatus): string {
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'In progress';
  return 'Pending';
}

function employeeToRow(employee: EmployeeRecord): Record<string, string | number> {
  return {
    Name: employee.name || '',
    'Employee ID': employee.employeeId || '',
    Department: employee.department || '',
    Gender: employee.gender || '',
    Age: employee.age ?? '',
    Phone: employee.phone && employee.phone !== '-' ? employee.phone : '',
    Email: employee.email || '',
    'Blood Group':
      employee.bloodGroup && employee.bloodGroup !== '-' ? employee.bloodGroup : '',
    Anthropometry: statusLabel(employee.journey.anthropometry),
    Vitals: statusLabel(employee.journey.vitals),
    Lifestyle: statusLabel(employee.journey.dietLifestyle),
    'Blood Report': statusLabel(employee.journey.bloodReport),
    'Blood Report Sent': statusLabel(employee.journey.bloodReportAi),
    'Bio-AI Report': statusLabel(employee.journey.bioAiReport),
    'Bio-AI Report Sent': statusLabel(employee.journey.bioAiShared),
    Consultations: statusLabel(employee.journey.consultations),
  };
}

/** Download camp participants as an `.xlsx` workbook. */
export function downloadEmployeesExcel(
  employees: EmployeeRecord[],
  options?: { campNo?: number | null; year?: string },
): void {
  const rows = employees.map(employeeToRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  const campPart = options?.campNo != null ? `-camp-${options.campNo}` : '';
  const yearPart = options?.year ? `-${options.year}` : '';
  const filename = `employees${campPart}${yearPart}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
