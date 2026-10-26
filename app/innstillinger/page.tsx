'use client';

import Link from 'next/link';
import { Foot } from '@/components/board/foot';
import { Screen } from '@/components/board/screen';
import { DayOffField } from '@/components/settings/day-off-field';
import { DirectionField } from '@/components/settings/direction-field';
import { Row } from '@/components/settings/row';
import { StationField } from '@/components/settings/station-field';
import { WalkField } from '@/components/settings/walk-field';
import { ALL_QUAYS, DEPARTURES_REFRESH_MS } from '@/lib/constants/departures';
import { directionOptions } from '@/lib/departures/directions';
import { departuresUrl } from '@/lib/departures/url';
import { usePoll } from '@/lib/hooks/use-poll';
import { useSettings } from '@/lib/hooks/use-settings';
import type { DeparturesResponse } from '@/lib/types';

export default function Settings() {
  const [settings, save] = useSettings();
  const departures = usePoll<DeparturesResponse>(settings && departuresUrl(settings.stop.id), DEPARTURES_REFRESH_MS);

  return (
    <Screen>
      {settings && (
        <div className="absolute inset-x-24 top-24 text-[3.25rem]">
          <Row label="stasjon">
            <StationField label="stasjon" stop={settings.stop} onPick={(stop) => save({ ...settings, stop, quay: ALL_QUAYS })} />
          </Row>
          <Row label="retning">
            <DirectionField
              label="retning"
              options={directionOptions(departures?.departures ?? [])}
              value={settings.quay}
              onChange={(quay) => save({ ...settings, quay })}
            />
          </Row>
          <Row label="gåtid">
            <WalkField label="gåtid" value={settings.walk} onChange={(walk) => save({ ...settings, walk })} />
          </Row>
          <Row label="hverdager">
            <DayOffField label="hverdager" value={settings.dayOff} onChange={(dayOff) => save({ ...settings, dayOff })} />
          </Row>
        </div>
      )}
      <Foot>
        <Link href="/" className="focusable">
          tilbake
        </Link>
      </Foot>
    </Screen>
  );
}
