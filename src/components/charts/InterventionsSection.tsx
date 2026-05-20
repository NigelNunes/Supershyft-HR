import { Activity, Heart, Moon, Pill, Salad } from 'lucide-react';
import { CHART_INFO } from '../../content/chartInfo';
import type { Intervention } from '../../types';
import { ChartCard } from '../ui/ChartCard';
import { InsightFooter } from '../ui/InsightFooter';
import './InterventionsSection.css';

const icons = {
  activity: Activity,
  pill: Pill,
  heart: Heart,
  moon: Moon,
  salad: Salad,
};

interface InterventionsSectionProps {
  interventions: Intervention[];
}

export function InterventionsSection({ interventions }: InterventionsSectionProps) {
  return (
    <ChartCard
      title="Recommended"
      subtitle="Prioritised actions for HR and wellness teams"
      info={CHART_INFO.interventions}
      insight={
        <InsightFooter
          tone="positive"
          text="Implementing the top 3 high-priority interventions could address ~60% of identified high-risk employees within one quarter."
        />
      }
      className="interventions-section"
    >
      <div className="interventions-grid">
        {interventions.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons] ?? Activity;
          return (
            <article key={item.id} className={`intervention-card intervention-card--${item.priority}`}>
              <div className="intervention-card__icon">
                <Icon size={22} />
              </div>
              <div>
                <h4>{item.title}</h4>
                <p className="intervention-card__desc">{item.description}</p>
                <p className="intervention-card__impact">
                  <strong>Impact:</strong> {item.impact}
                </p>
              </div>
              <span className="intervention-card__badge">{item.priority}</span>
            </article>
          );
        })}
      </div>
    </ChartCard>
  );
}
