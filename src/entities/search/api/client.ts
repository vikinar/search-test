import { SearchResponse, SearchError } from "../model/types";

export interface SearchQueryParams {
  q: string;
  page?: number;
  perPage?: number;
  sort?: "relevance" | "alpha" | "alpha-desc";
  fuzzy?: boolean;
  signal?: AbortSignal;
}

export async function fetchSearch(
  params: SearchQueryParams
): Promise<SearchResponse> {
  const { q, page, perPage, sort, fuzzy, signal } = params;
  const sp = new URLSearchParams();
  sp.set("q", q);
  if (page) sp.set("page", String(page));
  if (perPage) sp.set("perPage", String(perPage));
  if (sort) sp.set("sort", sort);
  if (fuzzy) sp.set("fuzzy", "1");

  sp.set("skipDelay", "1");
  const res = await fetch(`/api/search?${sp.toString()}`, { signal });
  if (!res.ok) {
    const err: SearchError = await res
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw err;
  }
  return res.json();
}
