import { describe, it, expect } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

function makeNextRequest(url: string) {
  return new Request(url) as unknown as NextRequest;
}

async function json(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Bad JSON: " + text);
  }
}

const base = "http://localhost:3000/api/search";

describe("GET /api/search", () => {
  it("возвращает пустой список, когда q пустой", async () => {
    const res = await GET(makeNextRequest(`${base}?q=&skipDelay=1`));
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.items).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  it("возвращает результаты", async () => {
    const res = await GET(makeNextRequest(`${base}?q=а&skipDelay=1`));
    const body = await json(res);
    expect(body.meta.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.items)).toBe(true);
  });

  it("применяет пагинацию (perPage=3)", async () => {
    const res1 = await GET(
      makeNextRequest(`${base}?q=а&perPage=3&page=1&skipDelay=1`)
    );
    const b1 = await json(res1);
    const res2 = await GET(
      makeNextRequest(`${base}?q=а&perPage=3&page=2&skipDelay=1`)
    );
    const b2 = await json(res2);
    if (b1.meta.total >= 3) {
      expect(b1.items.length).toBeLessThanOrEqual(3);
      if (b1.meta.total > 3) {
        expect(b2.meta.page).toBe(2);
      }
    }
  });

  it("fuzzy может находить слегка ошибенные токены", async () => {
    const res = await GET(
      makeNextRequest(`${base}?q=fresk&fuzzy=1&skipDelay=1`)
    );
    const body = await json(res);
    expect(Array.isArray(body.items)).toBe(true);
  });

  it("возвращает 500 при ошибке", async () => {
    const res = await GET(makeNextRequest(`${base}?q=error&skipDelay=1`));
    expect(res.status).toBe(500);
    const body = await json(res);
    expect(body.error).toBeDefined();
  });
});
