"use client";
import React, { useEffect, useRef, useCallback } from "react";
import styles from "./search.module.css";
import type { SearchResponse } from "@/entities/search/model/types";
import { useRouter, useSearchParams } from "next/navigation";
import ResultsList from "@/entities/search/ui/ResultList/ResultsList";
import Loader from "@/shared/ui/Loader/Loader";
import { SearchBar } from "@/features/search-bar";
import SearchIcon from "@/shared/ui/icons/SearchIcon";
import { useLocalSearchQuery } from "@/features/search-query";
import {
  EmptyState,
  EndOfResults,
  ErrorState,
} from "@/shared/ui/StatusIndicators/status";
import { useInfiniteScroll } from "@/shared/lib/hooks/useInfiniteScroll";

interface Props {
  initialQuery: string;
  initialData: SearchResponse | null;
}

export default function Search({ initialQuery, initialData }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const {
    query,
    debouncedQuery,
    setQuery,
    loading,
    error,
    highlighted,
    hasMore,
    loadMore,
    lifted,
  } = useLocalSearchQuery({
    initialQuery,
    initialData,
    debounceMs: 350,
    fuzzy: false,
    externalDebounce: true,
  });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = sp.get("q") || "";
    if (current !== debouncedQuery) {
      const p = new URLSearchParams(sp.toString());
      if (debouncedQuery) p.set("q", debouncedQuery);
      else p.delete("q");
      router.replace(`/?${p.toString()}`);
    }
  }, [debouncedQuery, sp, router]);

  const handleReachEnd = useCallback(() => {
    if (!loading && hasMore) loadMore();
  }, [loading, hasMore, loadMore]);

  useInfiniteScroll(sentinelRef, {
    hasMore,
    onReachEnd: handleReachEnd,
    disabled: !lifted,
    rootMargin: "300px 0px 0px 0px",
  });

  return (
    <div className={`${styles.stage} ${lifted ? styles.lifted : ""}`}>
      <div className={styles.centerWrap}>
        <h1 className={styles.title}>Search</h1>
        <p className={styles.subtitle}>Начните вводить запрос.</p>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Например: сыр, глина, океан..."
          leftAddon={<SearchIcon size={20} strokeWidth={2} />}
          variant="filled"
          size="lg"
          loading={loading && highlighted.length === 0}
          autoFocus
          ariaLabel="Поисковый запрос"
          className={styles.searchBox}
          inputClassName={styles.input}
          debounceMs={500}
        />
        {!lifted && <div className={styles.status}>Введите запрос</div>}
      </div>
      <div className={styles.resultsZone} aria-live="polite">
        {lifted && (
          <>
            {error && <ErrorState message={error} onRetry={() => loadMore()} />}
            {!error && highlighted.length > 0 && (
              <ResultsList className={styles.list} items={highlighted} />
            )}
            {loading && (
              <Loader
                label={highlighted.length ? "Загружаем ещё" : "Загрузка"}
              />
            )}
            {!loading && !error && highlighted.length === 0 && (
              <EmptyState query={debouncedQuery} />
            )}
            {!loading && !error && highlighted.length > 0 && !hasMore && (
              <EndOfResults />
            )}
            <div ref={sentinelRef} className={styles.sentinel} />
          </>
        )}
      </div>
    </div>
  );
}
