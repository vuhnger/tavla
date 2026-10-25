export const pad = (n: number) => String(n).padStart(2, '0');

export const hhmm = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const DATE_PARTS = new Intl.DateTimeFormat('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' });

export function dateLabel(date: Date) {
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    DATE_PARTS.formatToParts(date).find((p) => p.type === type)?.value.replace('.', '') ?? '';
  return `${part('weekday')} ${part('day')}. ${part('month')}`;
}
