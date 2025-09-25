export type SearchItem = {
  id: string;
  title: string;
  snippet: string;
};

/**
 * Параметры запроса для поискового эндпойнта
 */
export type SearchQueryParams = {
  q?: string;
  page?: number;
  perPage?: number;
};

/**
 * Метаданные ответа поиска
 */
export type SearchResponseMeta = {
  query: string;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  durationMs: number;
};

/**
 * Успешный ответ поискового эндпойнта
 */
export type SearchResponse = {
  meta: SearchResponseMeta;
  items: SearchItem[];
};

/**
 * Ошибка API
 */
export type ErrorResponse = {
  /** Сообщение об ошибке */
  error: string;
  code?: string;
};

export type SearchApiSuccess = SearchResponse;
export type SearchApiError = ErrorResponse;
export type SearchApiResult = SearchApiSuccess | SearchApiError;
