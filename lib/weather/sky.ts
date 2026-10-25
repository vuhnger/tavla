export type Sky = 'clear' | 'partly' | 'overcast';

export function skyOf(symbol: string): Sky {
  if (symbol.startsWith('clearsky') || symbol.startsWith('fair')) return 'clear';
  if (symbol.startsWith('partlycloudy')) return 'partly';
  return 'overcast';
}
