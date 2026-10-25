export const departuresUrl = (stopId: string) => `/api/departures?stop=${encodeURIComponent(stopId)}`;

export const stopSearchUrl = (query: string) => `/api/stops/search?q=${encodeURIComponent(query)}`;
