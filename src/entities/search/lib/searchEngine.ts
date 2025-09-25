import { SEARCH_ITEMS } from "@/entities/search/data/searchItems";
import type { SearchResponse } from "@/entities/search/model/types";

const FIELD_WEIGHTS = { title: 4, snippet: 1 } as const;
const FUZZY_THRESHOLD = 0.72;

function normalize(str: string) {
  return str.normalize("NFKC").toLowerCase();
}
function tokenize(q: string): string[] {
  return q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(normalize);
}
function splitWords(text: string): string[] {
  return normalize(text)
    .split(/[^a-zA-Zа-яА-ЯёЁ0-9]+/)
    .filter(Boolean);
}

function levenshtein(a: string, b: string, maxDistance = 5): number {
  if (a === b) return 0;
  const al = a.length,
    bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  if (Math.abs(al - bl) > maxDistance) return maxDistance + 1;
  const prev = new Array(bl + 1),
    curr = new Array(bl + 1);
  for (let j = 0; j <= bl; j++) prev[j] = j;
  for (let i = 1; i <= al; i++) {
    curr[0] = i;
    let minInRow = curr[0];
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= bl; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      minInRow = Math.min(minInRow, curr[j]);
    }
    if (minInRow > maxDistance) return maxDistance + 1;
    for (let j = 0; j <= bl; j++) prev[j] = curr[j];
  }
  return curr[bl];
}

function similarity(a: string, b: string): number {
  const dist = levenshtein(
    a,
    b,
    Math.max(5, Math.ceil(Math.max(a.length, b.length) * 0.5))
  );
  const denom = Math.max(a.length, b.length) || 1;
  const sim = 1 - dist / denom;
  return sim < 0 ? 0 : sim;
}

function computeScore(
  tokens: string[],
  item: (typeof SEARCH_ITEMS)[number],
  fuzzy: boolean
): number {
  if (!tokens.length) return 0;
  const titleNorm = normalize(item.title);
  const snippetNorm = normalize(item.snippet);
  const titleWords = splitWords(item.title);
  const snippetWords = splitWords(item.snippet);
  let score = 0;
  for (const token of tokens) {
    if (titleNorm.includes(token)) {
      score += FIELD_WEIGHTS.title;
      continue;
    }
    if (snippetNorm.includes(token)) {
      score += FIELD_WEIGHTS.snippet;
      continue;
    }
    if (!fuzzy || token.length < 3) continue;
    let bestTitle = 0;
    for (const w of titleWords) {
      const sim = similarity(token, w);
      if (sim > bestTitle) bestTitle = sim;
      if (bestTitle === 1) break;
    }
    let bestSnippet = 0;
    for (const w of snippetWords) {
      const sim = similarity(token, w);
      if (sim > bestSnippet) bestSnippet = sim;
      if (bestSnippet === 1) break;
    }
    if (bestTitle >= FUZZY_THRESHOLD) score += FIELD_WEIGHTS.title * bestTitle;
    else if (bestSnippet >= FUZZY_THRESHOLD)
      score += FIELD_WEIGHTS.snippet * bestSnippet;
  }
  return score;
}

export interface SearchEngineParams {
  q: string;
  page: number;
  perPage: number;
  fuzzy: boolean;
}

export function runSearch({
  q,
  page,
  perPage,
  fuzzy,
}: SearchEngineParams): SearchResponse {
  const started = performance.now();
  const query = q.trim();
  if (!query) {
    return {
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
  }
  const tokens = tokenize(normalize(query));
  const scored: {
    score: number;
    index: number;
    ref: (typeof SEARCH_ITEMS)[number];
  }[] = [];
  SEARCH_ITEMS.forEach((item, idx) => {
    const score = computeScore(tokens, item, fuzzy);
    if (score > 0) scored.push({ score, index: idx, ref: item });
  });
  const ordered = scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const t = a.ref.title.localeCompare(b.ref.title, "ru");
      if (t !== 0) return t;
      return a.index - b.index;
    })
    .map((s) => s.ref) as typeof SEARCH_ITEMS;
  const total = ordered.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);
  const safePage = Math.min(Math.max(1, page), totalPages || 1);
  const start = (safePage - 1) * perPage;
  const items = ordered.slice(start, start + perPage);
  return {
    meta: {
      query,
      page: safePage,
      perPage,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
      durationMs: performance.now() - started,
    },
    items,
  };
}

export function highlightText(source: string, q: string): string {
  const tokens = tokenize(normalize(q));
  if (!tokens.length) return source;
  let html = source;
  for (const t of [...new Set(tokens)].sort((a, b) => b.length - a.length)) {
    const re = new RegExp(
      `(${t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
      "ig"
    );
    html = html.replace(re, "<mark>$1</mark>");
  }
  return html;
}
