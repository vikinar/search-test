"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { runSearch, highlightText } from "@/entities/search/lib/searchEngine";
import type { SearchResponse } from "@/entities/search/model/types";

export interface UseLocalSearchOptions {
  fuzzy?: boolean;
  perPage?: number;
  debounceMs?: number;
  initialQuery?: string;
  initialData?: SearchResponse | null;
  cacheTtlMs?: number;
  externalDebounce?: boolean; // если true - считаем что debounce уже выполнен выше
}

interface CacheEntry {
  data: SearchResponse;
  ts: number;
}

export function useLocalSearchQuery(opts: UseLocalSearchOptions = {}) {
  const {
    fuzzy = false,
    perPage = 10,
    debounceMs = 350,
    initialQuery = "",
    initialData = null,
    cacheTtlMs = 5 * 60 * 1000,
    externalDebounce = false,
  } = opts;

  const [query, setQuery] = useState(initialQuery);
  const [pages, setPages] = useState<{ page: number; data: SearchResponse }[]>(
    () => (initialData ? [{ page: 1, data: initialData }] : [])
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const lastQueryRef = useRef(initialQuery);
  // дебаунс введённой строки
  const internalDebounced = useDebouncedValue(query.trim(), debounceMs);
  const effectiveQuery = externalDebounce ? query.trim() : internalDebounced;
  const lifted = effectiveQuery.length > 0;

  const getKey = useCallback(
    (q: string, page: number) => `${q}|${page}|${fuzzy ? "1" : "0"}`,
    [fuzzy]
  );

  const loadPage = useCallback(
    async (page: number) => {
      const q = effectiveQuery;
      if (!q) return;
      const key = getKey(q, page);
      const cached = cacheRef.current.get(key);
      if (cached && Date.now() - cached.ts < cacheTtlMs) {
        setPages((prev) => {
          if (prev.some((p) => p.page === page)) return prev;
          return [...prev, { page, data: cached.data }].sort(
            (a, b) => a.page - b.page
          );
        });
        return;
      }
      setLoading(true);
      setError(null);
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const rid = ++reqIdRef.current;
      try {
        // artificial delay now cancellable
        const delayMs = page === 1 ? 120 : 400;
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(resolve, delayMs);
          // abort listener
          ac.signal.addEventListener(
            "abort",
            () => {
              clearTimeout(t);
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true }
          );
        });
        if (ac.signal.aborted || rid !== reqIdRef.current) return; // aborted during delay
        const res = runSearch({ q, page, perPage, fuzzy });
        if (ac.signal.aborted || rid !== reqIdRef.current) return; // double check before mutating state / cache
        cacheRef.current.set(key, { data: res, ts: Date.now() });
        setPages((prev) =>
          prev.some((p) => p.page === page)
            ? prev
            : [...prev, { page, data: res }].sort((a, b) => a.page - b.page)
        );
      } catch (e) {
        const err = e as { name?: string; message?: string };
        if (err?.name !== "AbortError") {
          setError(err?.message || "Ошибка загрузки");
        }
      } finally {
        if (rid === reqIdRef.current) setLoading(false);
      }
    },
    [effectiveQuery, perPage, fuzzy, cacheTtlMs, getKey]
  );

  useEffect(() => {
    const q = effectiveQuery;
    if (!q) {
      setPages([]);
      setError(null);
      lastQueryRef.current = "";
      return;
    }
    if (lastQueryRef.current === q) return;
    lastQueryRef.current = q;
    cacheRef.current.forEach((_, k) => {
      if (!k.startsWith(q)) cacheRef.current.delete(k);
    });
    setPages([]);
    loadPage(1);
  }, [effectiveQuery, loadPage]);

  const items = useMemo(() => pages.flatMap((p) => p.data.items), [pages]);
  const hasMore = pages.slice(-1)[0]?.data.meta.hasNextPage ?? false;
  type HighlightedItem = (typeof items)[number] & {
    highlightedTitle: string;
    highlightedSnippet: string;
  };
  const highlighted: HighlightedItem[] = useMemo(() => {
    if (!effectiveQuery) return [];
    return items.map((it) => ({
      ...it,
      highlightedTitle: highlightText(it.title, effectiveQuery),
      highlightedSnippet: highlightText(it.snippet, effectiveQuery),
    }));
  }, [items, effectiveQuery]);

  const loadMore = useCallback(() => {
    const last = pages.at(-1);
    if (!last) return;
    if (last.data.meta.hasNextPage && !loading)
      loadPage(last.data.meta.page + 1);
  }, [pages, loading, loadPage]);

  // periodic cache cleanup
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      cacheRef.current.forEach((entry, key) => {
        if (now - entry.ts >= cacheTtlMs) cacheRef.current.delete(key);
      });
    }, 60_000);
    return () => clearInterval(id);
  }, [cacheTtlMs]);

  return {
    query,
    debouncedQuery: effectiveQuery,
    setQuery,
    loading,
    error,
    items,
    pages,
    highlighted,
    loadMore,
    hasMore,
    lifted,
    reset: () => {
      setQuery("");
      setPages([]);
      setError(null);
    },
  };
}
