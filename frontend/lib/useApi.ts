'use client';

import { useCallback, useEffect, useState } from 'react';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

function message(err: unknown): string {
  const d = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  if (d) return String(d);
  if (err instanceof Error) return err.message;
  return 'Дерек жүктелмеді';
}

/** Fetch on mount (and when `deps` change); exposes data / loading / error / reload. */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): State<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (alive) setError(message(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  return { data, loading, error, reload };
}
