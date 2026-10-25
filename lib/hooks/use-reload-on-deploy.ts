import { useEffect } from 'react';
import { VERSION_POLL_MS } from '@/lib/constants/deploy';
import { isNewDeploy } from '@/lib/deploy';

export function useReloadOnDeploy() {
  useEffect(() => {
    const current = process.env.NEXT_PUBLIC_DEPLOYMENT_ID;
    if (!current) return;
    const check = () =>
      fetch('/api/version', { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { id?: string } | null) => isNewDeploy(current, body?.id) && location.reload())
        .catch(() => undefined);
    const id = setInterval(check, VERSION_POLL_MS);
    return () => clearInterval(id);
  }, []);
}
