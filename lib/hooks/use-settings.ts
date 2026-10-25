import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '@/lib/constants/settings';
import { parseSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';

function loadSettings(): Settings {
  try {
    return parseSettings(localStorage.getItem(SETTINGS_STORAGE_KEY));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function storeSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
}

export function useSettings(): [Settings | null, (next: Settings) => void] {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => setSettings(loadSettings()), []);
  const save = useCallback((next: Settings) => {
    setSettings(next);
    storeSettings(next);
  }, []);
  return [settings, save];
}
