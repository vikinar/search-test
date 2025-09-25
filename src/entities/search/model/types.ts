export interface SearchItem {
  id: string;
  title: string;
  snippet: string;
}

export interface SearchMeta {
  query: string;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  durationMs: number;
}

export interface SearchResponse {
  meta: SearchMeta;
  items: SearchItem[];
}

export interface SearchError {
  error: string;
  code?: string;
}

export type SearchResult = SearchResponse | SearchError;
