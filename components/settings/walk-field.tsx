import { MAX_WALK_MINUTES } from '@/lib/constants/departures';

const MINUTES = Array.from({ length: MAX_WALK_MINUTES + 1 }, (_, minutes) => minutes);

export function WalkField({ label, value, onChange }: { label: string; value: number; onChange: (walk: number) => void }) {
  return (
    <select
      aria-label={label}
      className="field focusable"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {MINUTES.map((minutes) => (
        <option key={minutes} value={minutes}>
          {minutes} min
        </option>
      ))}
    </select>
  );
}
