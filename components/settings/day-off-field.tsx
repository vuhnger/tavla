import { DEFAULT_DAY_OFF, LAST_HOUR } from '@/lib/constants/screen';
import { hourLabel } from '@/lib/time';
import type { DayOff } from '@/lib/types';

const HOURS = Array.from({ length: LAST_HOUR + 1 }, (_, hour) => hour);
const OFF = 'off';

const HourOptions = ({ hours }: { hours: number[] }) =>
  hours.map((hour) => (
    <option key={hour} value={hour}>
      {hourLabel(hour)}:00
    </option>
  ));

export function DayOffField({ label, value, onChange }: { label: string; value: DayOff | null; onChange: (dayOff: DayOff | null) => void }) {
  return (
    <div className="flex items-center gap-6">
      <select
        aria-label={label}
        className="field focusable"
        value={value ? value.from : OFF}
        onChange={(event) => {
          const from = Number(event.target.value);
          if (event.target.value === OFF) onChange(null);
          else onChange({ from, to: value ? Math.max(value.to, from + 1) : Math.max(DEFAULT_DAY_OFF.to, from + 1) });
        }}
      >
        <option value={OFF}>av</option>
        <HourOptions hours={HOURS.slice(0, LAST_HOUR)} />
      </select>
      {value && (
        <>
          <span className="text-soft">til</span>
          <select
            aria-label="til"
            className="field focusable"
            value={value.to}
            onChange={(event) => onChange({ ...value, to: Number(event.target.value) })}
          >
            <HourOptions hours={HOURS.filter((hour) => hour > value.from)} />
          </select>
        </>
      )}
    </div>
  );
}
