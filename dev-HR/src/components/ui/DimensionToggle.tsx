import type { ToggleDimension } from '../../types';

interface DimensionToggleProps {
  value: ToggleDimension;
  onChange: (v: ToggleDimension) => void;
}

export function DimensionToggle({ value, onChange }: DimensionToggleProps) {
  return (
    <div className="toggle-group" role="group" aria-label="Split data by">
      <button type="button" className={value === 'gender' ? 'active' : ''} onClick={() => onChange('gender')}>
        Gender
      </button>
      <button type="button" className={value === 'department' ? 'active' : ''} onClick={() => onChange('department')}>
        Department
      </button>
    </div>
  );
}
