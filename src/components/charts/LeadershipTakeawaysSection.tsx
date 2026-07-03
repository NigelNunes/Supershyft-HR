import { useMemo } from 'react';
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

const CARD_EMOJIS: Record<string, string> = {
  'workforce-health': '🩺',
  'lifestyle-priority': '🏃‍♂️',
  'disease-focus': '🫀',
  'strategic-next-step': '🎯',
};

function TakeawayCard({ takeaway }: { takeaway: LeadershipTakeaway }) {
  const emoji = CARD_EMOJIS[takeaway.id] ?? '💡';

  return (
    <article className={`leadership-takeaway-card leadership-takeaway-card--${takeaway.id}`}>
      <div className="leadership-takeaway-card__header">
        <span className="leadership-takeaway-card__emoji" aria-hidden>
          {emoji}
        </span>
        <span className="leadership-takeaway-card__category">{takeaway.title}</span>
      </div>

      <div className="leadership-takeaway-card__content">
        <h3 className="leadership-takeaway-card__headline">{takeaway.headline}</h3>
        <p className="leadership-takeaway-card__body">{takeaway.body}</p>
      </div>
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
    <>
      <div className="section-title">Leadership takeaways</div>
      <div className="leadership-takeaways">
        {loading ? (
          <p className="leadership-takeaways__loading">Loading leadership takeaways…</p>
        ) : (
          takeaways.map((takeaway) => <TakeawayCard key={takeaway.id} takeaway={takeaway} />)
        )}
      </div>
    </>
  );
}
