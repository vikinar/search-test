let cachedSpec: Record<string, unknown> | null = null;

export async function GET(req: Request) {
  if (!cachedSpec) {
    const origin = (() => {
      try {
        const url = new URL(req.url);
        return `${url.protocol}//${url.host}`;
      } catch {
        return "http://localhost:3000";
      }
    })();

    cachedSpec = {
      openapi: "3.0.0",
      info: {
        title: "Search API",
        version: "1.0.0",
        description:
          "Поиск по локальному набору данных (пагинация, сортировка, fuzzy).",
      },
      servers: [{ url: origin, description: "Хост" }],
      tags: [{ name: "search", description: "Операции поиска" }],
      components: {
        schemas: {
          SearchItem: {
            type: "object",
            properties: {
              id: { type: "string", example: "42" },
              title: { type: "string", example: "Фрески эпохи Ренессанса" },
              snippet: {
                type: "string",
                example: "Техники слойного нанесения и перспектива.",
              },
            },
            required: ["id", "title", "snippet"],
          },
          SearchResponseMeta: {
            type: "object",
            properties: {
              query: { type: "string", example: "фрески" },
              page: { type: "integer", example: 1 },
              perPage: { type: "integer", example: 10 },
              total: { type: "integer", example: 1 },
              totalPages: { type: "integer", example: 1 },
              hasNextPage: { type: "boolean", example: false },
              hasPrevPage: { type: "boolean", example: false },
              durationMs: { type: "number", example: 187.42 },
            },
            required: [
              "query",
              "page",
              "perPage",
              "total",
              "totalPages",
              "hasNextPage",
              "hasPrevPage",
              "durationMs",
            ],
          },
          SearchResponse: {
            type: "object",
            properties: {
              meta: { $ref: "#/components/schemas/SearchResponseMeta" },
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/SearchItem" },
              },
            },
            required: ["meta", "items"],
          },
          ErrorResponse: {
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "Forced error for query testing",
              },
            },
            required: ["error"],
          },
        },
        parameters: {
          Q: {
            name: "q",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Поисковая строка. Пусто -> пустой список.",
          },
          Page: {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Номер страницы (>=1).",
          },
          PerPage: {
            name: "perPage",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
            description: "Количество результатов на страницу (1..50).",
          },
          Fuzzy: {
            name: "fuzzy",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["1", "true", "0", "false"] },
            description: "Включить fuzzy (1|true включает)",
          },
        },
        examples: {
          SearchOk: {
            summary: "Пример успешного ответа",
            value: {
              meta: {
                query: "фрески",
                page: 1,
                perPage: 10,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
                durationMs: 205.11,
              },
              items: [
                {
                  id: "13",
                  title: "Фрески эпохи Ренессанса",
                  snippet: "Техники слойного нанесения и перспектива.",
                },
              ],
            },
          },
          ErrForced: {
            summary: "Форсированная ошибка",
            value: { error: "Forced error for query testing" },
          },
        },
      },
      paths: {
        "/api/search": {
          get: {
            operationId: "searchList",
            tags: ["search"],
            summary: "Поиск элементов",
            description: "Пагинация, fuzzy (Левенштейн). Пустой q -> [].",
            parameters: [
              { $ref: "#/components/parameters/Q" },
              { $ref: "#/components/parameters/Page" },
              { $ref: "#/components/parameters/PerPage" },
              { $ref: "#/components/parameters/Fuzzy" },
            ],
            responses: {
              "200": {
                description: "Успешный ответ",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/SearchResponse" },
                    examples: {
                      success: { $ref: "#/components/examples/SearchOk" },
                    },
                  },
                },
              },
              "500": {
                description: "Серверная ошибка или форсированная (q=error)",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ErrorResponse" },
                    examples: {
                      error: { $ref: "#/components/examples/ErrForced" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  return Response.json(cachedSpec);
}
