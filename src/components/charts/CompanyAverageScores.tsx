import { CHART_INFO } from '../../content/chartInfo';
import type { CompanyAverageScores as CompanyScores } from '../../types';
import { ChartCard } from '../ui/ChartCard';

interface CompanyAverageScoresProps {
  scores: CompanyScores;
  title?: string;
  subtitle?: string;
  info?: string;
}

function scoreBand(value: number): string {
  if (value >= 80) return 'Strong';
  if (value >= 60) return 'Moderate';
  if (value >= 40) return 'Needs improvement';
  return 'Low';
}

export function CompanyAverageScores({
  scores,
  title = 'Company average scores',
  subtitle = 'Nutrition · fitness · lifestyle (scale 0–100)',
  info = CHART_INFO.companyScores,
}: CompanyAverageScoresProps) {
  const items = [
    { label: 'Nutrition score', value: scores.nutrition },
    { label: 'Fitness', value: scores.fitness },
    { label: 'Lifestyle average', value: scores.lifestyle },
  ];

  return (
    <ChartCard title={title} subtitle={subtitle} info={info} className="company-scores-card">
      <div className="grid-3 company-scores-grid">
        {items.map((item) => (
          <div key={item.label} className="score-card">
            <div className="score-card__label">{item.label}</div>
            <div className="score-card__value">
              {Math.round(item.value)}
              <span> / 100</span>
            </div>
            <div className="score-card__sub">{scoreBand(item.value)}</div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
