import { useEffect, useRef, useState } from 'react';

/** Wait this long after the last keystroke or filter change before calling the backend. */
const DEBOUNCE_MS = 350;

type SearchState<T> = { query: string; results: T[]; error: string | null };

/**
 * Runs a backend search for `query` (from buildSearchQuery), debounced, keeping only the latest answer.
 *
 * `results` is null while there is no query, so screens can show their full list instead.
 * Change `reloadKey` (e.g. pass the screen's freshly loaded list) to search again with the same query.
 */
export function useItemSearch<T>(search: (query: string) => Promise<T[]>, query: string | null, reloadKey?: unknown) {
  const [state, setState] = useState<SearchState<T> | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const latestRequest = useRef(0);

  useEffect(() => {
    const request = ++latestRequest.current;
    if (!query) return;

    const timer = setTimeout(() => {
      search(query).then(
        (results) => {
          if (request === latestRequest.current) setState({ query, results, error: null });
        },
        (error: unknown) => {
          if (request !== latestRequest.current) return;
          const message = error instanceof Error ? error.message : 'Search failed. Please try again.';
          setState((previous) => ({ query, results: previous?.query === query ? previous.results : [], error: message }));
        },
      );
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, query, reloadKey, retryCount]);

  const current = query && state?.query === query ? state : null;
  return {
    results: query ? (current?.results ?? null) : null,
    // True from the first change until the answer for the current query arrives.
    isLoading: Boolean(query) && !current,
    error: current?.error ?? null,
    retry: () => setRetryCount((count) => count + 1),
  };
}
