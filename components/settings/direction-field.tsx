import type { Direction } from '@/lib/departures/directions';

export function DirectionField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Direction[];
  value: string;
  onChange: (quay: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-6">
      {options.map((option) => (
        <label
          key={option.id}
          className={`cursor-pointer px-4 py-1.5 focus-within:outline focus-within:outline-[0.1875rem] focus-within:outline-offset-4 focus-within:outline-osd ${option.id === value ? 'bg-osd text-panel' : ''}`}
        >
          <input
            type="radio"
            name={label}
            className="sr-only"
            checked={option.id === value}
            onChange={() => onChange(option.id)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
