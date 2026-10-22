import { useCallback, useEffect, useState } from "react";

/**
 * Runs an async loader and tracks loading / error state.
 * `reload()` re-runs it (e.g. after posting something).
 */
export default function useAsync(loader, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    loader()
      .then((d) => !cancelled && setData(d))
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError(e instanceof Error ? e.message : "Couldn't load this.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload, setData };
}