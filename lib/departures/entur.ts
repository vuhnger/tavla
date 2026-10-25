import { NORWEGIAN_LANGUAGES } from '@/lib/constants/departures';
import type { Departure } from '@/lib/types';

interface EnturText {
  value: string;
  language: string;
}

export interface EnturCall {
  aimedDepartureTime: string;
  expectedDepartureTime?: string;
  destinationDisplay: { frontText: string };
  quay?: { id: string };
  cancellation?: boolean;
  situations?: { summary: EnturText[] }[];
}

const summaryOf = (texts: EnturText[]) =>
  (texts.find((text) => NORWEGIAN_LANGUAGES.includes(text.language)) ?? texts[0])?.value;

const toDeparture = (call: EnturCall): Departure => ({
  time: call.expectedDepartureTime ?? call.aimedDepartureTime,
  destination: call.destinationDisplay.frontText,
  quay: call.quay?.id ?? '',
  situations: (call.situations ?? []).map((situation) => summaryOf(situation.summary)).filter((text) => text !== undefined),
});

export const toDepartures = (calls: EnturCall[]) => calls.filter((call) => !call.cancellation).map(toDeparture);
