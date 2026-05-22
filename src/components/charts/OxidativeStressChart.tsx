import { useMemo } from 'react';
import { CHART_INFO } from '../../content/chartInfo';
import type { DepartmentSummary, OxidativeStressByDept } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import { OxidativeStressPanelBody } from './OxidativeStressPanelBody';
import { oxidativeElevatedPercent } from './oxidativeStressBands';
import './OxidativeStressChart.css';

interface OxidativeStressChartProps {
  data: OxidativeStressByDept[];
  departments?: DepartmentSummary[];
}

function weightedCompanyRollup(
  rows: OxidativeStressByDept[],
  headcounts: Map<string, number>,
): OxidativeStressByDept {
  let weightSum = 0;
  let low = 0;
  let moderate = 0;
  let high = 0;
  let veryHigh = 0;

  for (const row of rows) {
    const w = headcounts.get(row.department) ?? 1;
    weightSum += w;
    low += row.low * w;
    moderate += row.moderate * w;
    high += row.high * w;
    veryHigh += row.veryHigh * w;
  }

  if (weightSum === 0) weightSum = 1;

  return {
    department: 'Company-wide',
    low: Math.round((low / weightSum) * 10) / 10,
    moderate: Math.round((moderate / weightSum) * 10) / 10,
    high: Math.round((high / weightSum) * 10) / 10,
    veryHigh: Math.round((veryHigh / weightSum) * 10) / 10,
  };
}

export function OxidativeStressChart({ data, departments = [] }: OxidativeStressChartProps) {
  const headcounts = useMemo(
    () => new Map(departments.map((d) => [d.name, d.headcount])),
    [departments],
  );

  const company = useMemo(() => weightedCompanyRollup(data, headcounts), [data, headcounts]);
  const companyElevated = oxidativeElevatedPercent(company);

  const totalEmployees = useMemo(() => {
    const fromDepts = departments.reduce((sum, d) => sum + d.headcount, 0);
    return fromDepts > 0 ? fromDepts : 0;
  }, [departments]);

  return (
    <ChartCard
      title="Oxidative stress"
      subtitle="Company-wide severity distribution"
      info={CHART_INFO.oxidativeStress}
      insight={
        <InsightFooter
          tone={companyElevated > 20 ? 'concern' : 'neutral'}
          text={`${companyElevated}% of employees are in elevated oxidative stress bands (High + Very High) — use for wellness programme prioritisation.`}
        />
      }
      className="oxidative-stress-card"
    >
      <OxidativeStressPanelBody data={company} headcount={totalEmployees} />
    </ChartCard>
  );
}
