import React from "react";
import { runSearch } from "@/entities/search/lib/searchEngine";
import type { SearchResponse } from "@/entities/search/model/types";
import { parseQueryParam } from "@/shared/lib/query/parse";
import Search from "@/app/search";

async function getInitial(q: string | null): Promise<SearchResponse | null> {
  if (!q) return null;
  return runSearch({
    q,
    page: 1,
    perPage: 10,
    fuzzy: false,
  });
}

type SP = { [key: string]: string | string[] | undefined };

export default async function Home(props: { searchParams: Promise<SP> }) {
  const sp = await props.searchParams; // required await for dynamic API
  const q = parseQueryParam(sp, "q");
  const initial = await getInitial(q || null);
  return <Search initialQuery={q || ""} initialData={initial} />;
}
