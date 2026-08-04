import { useMemo, type ComponentType } from 'react';
import {
  Crosshair,
  Footprints,
  HeartPlus,
  ShieldAlert,
  type LucideProps,
} from 'lucide-react';
import {
  useCampCompanyAverageScores,
  useCampOverallRiskScore,
  useCampPhysicalActivity,
  useCampRiskLifestyleByGender,
  useCampSleep,
} from '../../hooks/useCampDashboard';
import { buildLeadershipTakeaways } from '../../utils/leadershipTakeaways';
import type { LeadershipTakeaway } from '../../utils/leadershipTakeaways';
import './LeadershipTakeawaysSection.css';

const CARD_ICONS: Record<string, ComponentType<LucideProps>> = {
  'workforce-health': ShieldAlert,
  'lifestyle-priority': Footprints,
  'disease-focus': HeartPlus,
  'strategic-next-step': Crosshair,
};

function TakeawayCard({ takeaway }: { takeaway: LeadershipTakeaway }) {
  const Icon = CARD_ICONS[takeaway.id] ?? ShieldAlert;

  return (
    <article className={`leadership-takeaway-card leadership-takeaway-card--${takeaway.id}`}>
      <div className="leadership-takeaway-card__glow" aria-hidden />
      <div className="leadership-takeaway-card__main">
        <div className="leadership-takeaway-card__icon" aria-hidden>
          <Icon size={32} strokeWidth={2} />
        </div>
        <div className="leadership-takeaway-card__copy">
          <p className="leadership-takeaway-card__category">{takeaway.title}</p>
          <h3 className="leadership-takeaway-card__headline">{takeaway.headline}</h3>
        </div>
      </div>
      <ul className="leadership-takeaway-card__bullets">
        {takeaway.bullets.map((bullet) => (
          <li key={bullet}>
            <span className="leadership-takeaway-card__dot" aria-hidden />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function LeadershipTakeawaysSection() {
  const { data: overallRiskScore, loading: riskLoading } = useCampOverallRiskScore();
  const { data: companyScores, loading: scoresLoading } = useCampCompanyAverageScores();
  const { data: riskLifestyle, loading: diseaseLoading } = useCampRiskLifestyleByGender();
  const { data: physicalActivity, loading: physicalLoading } = useCampPhysicalActivity();
  const { data: sleep, loading: sleepLoading } = useCampSleep();

  const loading =
    riskLoading || scoresLoading || diseaseLoading || physicalLoading || sleepLoading;

  const takeaways = useMemo(() => {
    if (loading) return [];
    return buildLeadershipTakeaways({
      overallRiskScore: overallRiskScore ?? [],
      companyScores: companyScores ?? null,
      diseases: riskLifestyle?.diseases ?? [],
      physicalActivity: physicalActivity ?? { male: [], female: [] },
      sleep: sleep ?? { male: [], female: [] },
    });
  }, [
    loading,
    overallRiskScore,
    companyScores,
    riskLifestyle,
    physicalActivity,
    sleep,
  ]);

  return (
    <div className="leadership-takeaways">
      {loading ? (
        <p className="leadership-takeaways__loading">Loading leadership takeaways…</p>
      ) : (
        takeaways.map((takeaway) => <TakeawayCard key={takeaway.id} takeaway={takeaway} />)
      )}
    </div>
  );
}
