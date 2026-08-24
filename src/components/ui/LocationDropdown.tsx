import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import './LocationDropdown.css';

export interface LocationOption {
  id: string;
  label: string;
  description?: string;
}

interface LocationDropdownProps {
  options?: LocationOption[];
  value?: string;
  onChange?: (id: string) => void;
  'aria-label'?: string;
}

export function LocationDropdown({
  options = [],
  value = 'overall',
  onChange,
  'aria-label': ariaLabel = 'Location filter',
}: LocationDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((opt) => opt.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (option: LocationOption) => {
    onChange?.(option.id);
    setOpen(false);
  };

  return (
    <div className="location-dropdown" ref={rootRef}>
      <motion.button
        type="button"
        className="location-dropdown__trigger"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={ariaLabel}
      >
        <span className="location-dropdown__trigger-label">{selected?.label ?? 'Overall'}</span>
        <motion.span
          className="location-dropdown__chevron"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          aria-hidden
        >
          <ChevronDown size={16} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="location-dropdown__menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {options.map((option, index) => {
              const isSelected = option.id === selected?.id;
              return (
                <motion.button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`location-dropdown__item${
                    isSelected ? ' location-dropdown__item--selected' : ''
                  }`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, delay: index * 0.04 }}
                  onClick={() => handleSelect(option)}
                >
                  <span className="location-dropdown__item-text">
                    <span className="location-dropdown__item-label">{option.label}</span>
                    {option.description ? (
                      <span className="location-dropdown__item-desc">{option.description}</span>
                    ) : null}
                  </span>
                  {isSelected && (
                    <motion.span
                      className="location-dropdown__check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      aria-hidden
                    >
                      <Check size={16} />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
