import type { LucideIcon } from 'lucide-react';
import './KpiCard.css';

type KpiVariant = 'green' | 'blue' | 'red' | 'amber';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  variant: KpiVariant;
}

export function KpiCard({ label, value, sub, icon: Icon, variant }: KpiCardProps) {
  return (
    <div className={`kpi-card kpi-card--${variant}`}>
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value">{value}</div>
      {sub && <div className="kpi-card__sub">{sub}</div>}
      <div className="kpi-card__icon" aria-hidden>
        <Icon size={18} />
      </div>
    </div>
  );
}
