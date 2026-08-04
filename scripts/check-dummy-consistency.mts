import {
  DEPARTMENT_HEADCOUNTS,
  DISPLAY_ENROLLED,
  COHORT_2026_TARGETS,
  DEPARTMENTS,
  departmentSlug,
} from '../src/data/participantPool.ts';
import { mockDashboard, getDepartmentDetail } from '../src/data/mockDashboard.ts';
import {
  getDummyYearKpis,
  getDummyYearParticipationByAge,
  getDummyYearOverallRisk,
  getDummyYearMetabolicAge,
} from '../src/data/dummyAllYearsMetrics.ts';

const k2026 = getDummyYearKpis(2026);
const k = mockDashboard.kpis;
const issues: string[] = [];

function check(label: string, a: number, b: number) {
  if (a !== b) issues.push(`${label}: pool/agg=${a} vs dummy=${b}`);
}

console.log('DISPLAY_ENROLLED', DISPLAY_ENROLLED, 'targets', COHORT_2026_TARGETS.enrolled);
console.log(
  'headcount sum',
  Object.values(DEPARTMENT_HEADCOUNTS).reduce((a, b) => a + b, 0),
);

check('enrolled', k.employeesEnrolled, k2026.employeesEnrolled);
check('male', k.maleEnrolled ?? -1, k2026.maleEnrolled ?? -1);
check('female', k.femaleEnrolled ?? -1, k2026.femaleEnrolled ?? -1);
check('blood', k.totalBloodTest, k2026.totalBloodTest);
check('bioAi', k.totalBioAiReports ?? -1, k2026.totalBioAiReports ?? -1);
check('doctor', k.doctorConsultation, k2026.doctorConsultation);
check('nutritionist', k.nutritionistConsultation, k2026.nutritionistConsultation);
check('highRisk', k.highRiskGroup, k2026.highRiskGroup);

console.log('=== Age bands ===');
const ageDummy = getDummyYearParticipationByAge(2026);
for (const row of mockDashboard.participationByAge) {
  const key = row.ageGroup.replace(/\u2013/g, '-');
  const d = ageDummy.find((x) => x.ageGroup === key || x.ageGroup === row.ageGroup);
  console.log(row.ageGroup, 'pool', row.enrolled, 'dummy', d?.enrolled);
  if (d && d.enrolled !== row.enrolled) {
    issues.push(`age ${row.ageGroup}: ${row.enrolled} vs ${d.enrolled}`);
  }
}

console.log('=== Overall risk ===');
const riskDummy = getDummyYearOverallRisk(2026);
for (const row of mockDashboard.overallRiskScore) {
  const d = riskDummy.find((x) => x.band === row.band);
  console.log(row.band, 'pool', row.count, 'dummy', d?.count);
  if (d && d.count !== row.count) issues.push(`risk ${row.band}: ${row.count} vs ${d.count}`);
}

console.log('=== Metabolic ===');
const met = mockDashboard.metabolicAge;
const metDummy = getDummyYearMetabolicAge(2026);
console.log(
  'pool',
  met?.buckets?.map((b) => `${b.label}:${b.count}/${b.percent}`),
);
console.log(
  'dummy',
  metDummy.map((b) => `${b.key}:${b.count}/${b.percent}`),
);

let sumEnr = 0;
let sumBlood = 0;
let sumBio = 0;
let sumDoc = 0;
let sumHigh = 0;
let sumMale = 0;
let sumFemale = 0;
for (const name of DEPARTMENTS) {
  const d = getDepartmentDetail(departmentSlug(name));
  if (!d) {
    issues.push('missing dept ' + name);
    continue;
  }
  sumEnr += d.kpis.employeesEnrolled;
  sumBlood += d.kpis.totalBloodTest;
  sumBio += d.kpis.totalBioAiReports ?? 0;
  sumDoc += d.kpis.doctorConsultation;
  sumHigh += d.kpis.highRiskGroup;
  sumMale += d.kpis.maleEnrolled ?? 0;
  sumFemale += d.kpis.femaleEnrolled ?? 0;
}
check('dept sum enrolled', sumEnr, k2026.employeesEnrolled);
check('dept sum blood', sumBlood, k2026.totalBloodTest);
check('dept sum bio', sumBio, k2026.totalBioAiReports ?? -1);
check('dept sum doctor', sumDoc, k2026.doctorConsultation);
check('dept sum highRisk', sumHigh, k2026.highRiskGroup);
check('dept sum male', sumMale, k2026.maleEnrolled ?? -1);
check('dept sum female', sumFemale, k2026.femaleEnrolled ?? -1);

console.log('employees', mockDashboard.employees.length);
console.log('blood% bio%', k.bloodTestPercent, k.bioAiPercent);

if (issues.length) {
  console.log('\nISSUES:');
  issues.forEach((i) => console.log(' -', i));
  process.exit(1);
}
console.log('\nALL CHECKS PASSED');
