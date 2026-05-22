import { CHART_INFO } from '../../content/chartInfo';
import type { TopHighRiskDisease } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import './TopHighRiskDiseasesList.css';

interface TopHighRiskDiseasesListProps {
  diseases: TopHighRiskDisease[];
  title?: string;
  subtitle?: string;
  info?: string;
  insightPrefix?: string;
}

const RANK_STYLES = ['top-disease-rank--gold', 'top-disease-rank--silver', 'top-disease-rank--bronze'];

export function TopHighRiskDiseasesList({
  diseases,
  title = 'Top disease risks',
  subtitle = 'Highest elevated-risk share across the workforce',
  info = CHART_INFO.topHighRiskDiseases,
  insightPrefix = 'employees',
}: TopHighRiskDiseasesListProps) {
  const top = diseases[0];

  return (
    <ChartCard
      className="top-diseases-list-card"
      title={title}
      subtitle={subtitle}
      info={info}
      insight={
        top ? (
          <InsightFooter
            tone="concern"
            text={`${top.name} leads with ${top.highRiskPercent}% of ${insightPrefix} in elevated risk bands — prioritise screening and targeted interventions.`}
          />
        ) : undefined
      }
    >
      <ol className="top-disease-list">
        {diseases.map((disease, index) => (
          <li key={disease.name} className="top-disease-item">
            <span className={`top-disease-rank ${RANK_STYLES[index] ?? ''}`}>{index + 1}</span>
            <div className="top-disease-item__body">
              <span className="top-disease-item__name">{disease.name}</span>
              <span className="top-disease-item__meta">
                <strong>{disease.highRiskPercent}%</strong> elevated risk
              </span>
            </div>
            <div
              className="top-disease-item__bar"
              role="presentation"
              style={{ width: `${Math.min(disease.highRiskPercent * 2, 100)}%` }}
            />
          </li>
        ))}
      </ol>
    </ChartCard>
  );
}
