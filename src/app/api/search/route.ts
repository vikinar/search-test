import { NextRequest } from "next/server";
import { runSearch } from "@/entities/search/lib/searchEngine";
import type {
  SearchResponse,
  SearchError as ErrorResponse,
} from "@/entities/search/model/types";

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags:
 *       - search
 *     summary: Поиск элементов
 *     description: Поиск по title и snippet. Поддерживает пагинацию, сортировку и fuzzy.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поисковая строка
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Размер страницы
 *       - in: query
 *         name: fuzzy
 *         schema:
 *           type: string
 *           enum:
 *             - "1"
 *             - "true"
 *             - "0"
 *             - "false"
 *         description: Включить fuzzy (1|true включает)
 *     responses:
 *       200:
 *         description: Успешный ответ с результатами
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       500:
 *         description: Серверная ошибка или форсированная ошибка (q=error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export interface SearchEndpointQueryParams {
  q?: string;
  page?: number;
  perPage?: number;
  fuzzy?: string;
}

async function artificialDelay(min = 120, max = 650) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Поиск элементов
 * @description Выполняет полнотекстовый поиск по полям title и snippet с поддержкой пагинации, сортировки и опционального fuzzy.
 * @params SearchEndpointQueryParams
 * @response SearchResponse:Успешный ответ с метаданными и списком результатов
 * @add 500:ErrorResponse:Внутренняя ошибка или форсированная ошибка (q=error)
 * @openapi
 */
export async function GET(req: NextRequest) {
  const started = performance.now();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const pageParam = searchParams.get("page");
  const perPageParam = searchParams.get("perPage");
  const fuzzyParam = searchParams.get("fuzzy");
  const skipDelay = searchParams.get("skipDelay") === "1"; // недокументированный параметр для unit-тестов
  const fuzzy = fuzzyParam === "1" || fuzzyParam === "true";

  const page = Math.max(1, pageParam ? parseInt(pageParam, 10) || 1 : 1);
  const perPage = Math.min(
    50,
    Math.max(1, perPageParam ? parseInt(perPageParam, 10) || 10 : 10)
  );

  if (q.toLowerCase() === "error") {
    const err: ErrorResponse = {
      error: "Forced error for query testing",
      code: "INTERNAL_ERROR",
    };
    return Response.json(err, { status: 500 });
  }

  if (!skipDelay) {
    await artificialDelay();
  }

  if (!q) {
    const empty: SearchResponse = {
      meta: {
        query: "",
        page: 1,
        perPage,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        durationMs: performance.now() - started,
      },
      items: [],
    };
    return Response.json(empty);
  }

  const body = runSearch({ q, page, perPage, fuzzy });
  body.meta.durationMs = performance.now() - started;
  return Response.json(body as SearchResponse);
}
