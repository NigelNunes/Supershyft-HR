import type { ComponentType } from 'react';
import {
  Crosshair,
  Footprints,
  HeartPlus,
  ShieldAlert,
  type LucideProps,
} from 'lucide-react';
import { useCampLeadershipTakeaways } from '../../hooks/useCampDashboard';
import { useCamp } from '../../contexts/CampContext';
import { ComingSoonPanel } from '../ui/ComingSoonPanel';
import { shouldShowComingSoon } from '../../utils/comingSoon';
import {
  hasLeadershipTakeawaysData,
  type LeadershipTakeaway,
  type LeadershipTakeawayId,
} from '../../utils/leadershipTakeaways';
import './LeadershipTakeawaysSection.css';

const CARD_ICONS: Record<LeadershipTakeawayId, ComponentType<LucideProps>> = {
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
          <p className="leadership-takeaway-card__statement">{takeaway.text}</p>
        </div>
      </div>
    </article>
  );
}

export function LeadershipTakeawaysSection() {
  const { selectedYear } = useCamp();
  const { data: takeaways, loading } = useCampLeadershipTakeaways();

  const comingSoon = shouldShowComingSoon(
    selectedYear,
    loading,
    hasLeadershipTakeawaysData(takeaways),
  );

  if (comingSoon) {
    return <ComingSoonPanel variant="card" />;
  }

  return (
    <div className="leadership-takeaways">
      {loading ? (
        <p className="leadership-takeaways__loading">Loading leadership takeaways…</p>
      ) : (
        (takeaways ?? []).map((takeaway) => (
          <TakeawayCard key={takeaway.id} takeaway={takeaway} />
        ))
      )}
    </div>
  );
}
