import type { LifestyleGenderView } from '../../types';

interface GenderViewToggleProps {
  value: LifestyleGenderView;
  onChange: (v: LifestyleGenderView) => void;
}

export function GenderViewToggle({ value, onChange }: GenderViewToggleProps) {
  return (
    <div className="toggle-group" role="group" aria-label="Show charts for">
      <button type="button" className={value === 'both' ? 'active' : ''} onClick={() => onChange('both')}>
        Both
      </button>
      <button type="button" className={value === 'male' ? 'active' : ''} onClick={() => onChange('male')}>
        Male
      </button>
      <button type="button" className={value === 'female' ? 'active' : ''} onClick={() => onChange('female')}>
        Female
      </button>
    </div>
  );
}
