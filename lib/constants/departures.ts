export const DEFAULT_STOP = { id: 'NSR:StopPlace:59520', name: 'Røa' };
export const DEFAULT_QUAY = 'NSR:Quay:11729';
export const ALL_QUAYS = 'all';

export const DEFAULT_WALK_MINUTES = 16;
export const MAX_WALK_MINUTES = 30;

export const STOP_ID_PATTERN = /^NSR:StopPlace:\d{1,10}$/;
export const QUAY_ID_PATTERN = /^NSR:Quay:\d{1,10}$/;
export const RAIL_MODES = ['metro', 'rail'];
export const STATION_CATEGORIES = 'metroStation,railStation';
export const SEARCH_RESULTS = 6;
export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 50;
export const SEARCH_DELAY_MS = 250;

export const DEPARTURE_COUNT = 100;
export const BOARD_ROWS = 6;
export const SOON_MINUTES = 60;
export const DEPARTURES_REFRESH_MS = 60_000;
export const DEPARTURES_CACHE = 's-maxage=30, stale-while-revalidate=60';
export const SEARCH_CACHE = 's-maxage=86400';
