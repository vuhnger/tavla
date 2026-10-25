import { SOON_MINUTES } from '@/lib/constants/departures';
import { type Leave, minutesUntil } from '@/lib/departures/leave';
import { hhmm } from '@/lib/format';

const HEADING = 'w-[18.125rem] pb-[1.125rem] text-left font-normal';

export function Departures({ leaves, now }: { leaves: Leave[]; now: Date }) {
  return (
    <table className="absolute left-24 top-[15.625rem] w-[56.25rem] border-collapse text-[3.25rem]">
      <thead className="text-[2.25rem] text-soft">
        <tr>
          <th className={HEADING}>gå</th>
          <th className={HEADING}>tog</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {leaves.map(({ leaveAt, departAt }, i) => {
          const minutes = minutesUntil(leaveAt, now);
          return (
            <tr key={i} className="border-t-2 border-rule">
              <td className="py-[0.875rem]">{hhmm(leaveAt)}</td>
              <td>{hhmm(departAt)}</td>
              <td className="text-[2.5rem] text-soft">{minutes < SOON_MINUTES && `om ${minutes} min`}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
