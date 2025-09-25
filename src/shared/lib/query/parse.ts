export type QueryLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function getRaw(qs: QueryLike, key: string): string | string[] | undefined {
  if (qs instanceof URLSearchParams) {
    const all = qs.getAll(key);
    if (all.length === 0) return undefined;
    if (all.length === 1) return all[0];
    return all;
  }
  return qs[key];
}

export function parseStringParam(
  qs: QueryLike,
  key: string
): string | undefined {
  const raw = getRaw(qs, key);
  if (raw === undefined) return undefined;
  if (Array.isArray(raw)) return raw[0];
  const v = raw.trim();
  return v === "" ? undefined : v;
}

export function parseNumberParam(
  qs: QueryLike,
  key: string,
  {
    fallback,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
  }: { fallback: number; min?: number; max?: number }
): number {
  const s = parseStringParam(qs, key);
  if (!s) return fallback;
  const n = Number(s);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function parseBooleanParam(qs: QueryLike, key: string): boolean {
  const s = parseStringParam(qs, key);
  if (!s) return false;
  return ["1", "true", "on", "yes"].includes(s.toLowerCase());
}

export function getOr(qs: QueryLike, key: string, fallback = ""): string {
  return parseStringParam(qs, key) ?? fallback;
}

export const parseQueryParam = parseStringParam;
