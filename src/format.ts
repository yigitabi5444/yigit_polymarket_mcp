/**
 * Response formatting utilities.
 *
 * Polymarket API responses contain dozens of fields that are irrelevant for
 * an LLM context window (mailchimpTag, pagerDutyNotificationEnabled, …).
 * These helpers strip the noise, parse embedded JSON strings, and return
 * a clean, predictable shape.
 */

// ── Market (Gamma) ──────────────────────────────────────────────────────────

const MARKET_FIELDS = [
  "id",
  "question",
  "conditionId",
  "slug",
  "endDate",
  "startDate",
  "liquidity",
  "volume",
  "volume24hr",
  "active",
  "closed",
  "bestBid",
  "bestAsk",
  "lastTradePrice",
  "spread",
  "description",
  "groupItemTitle",
  "enableOrderBook",
  "acceptingOrders",
  "negRisk",
] as const;

export interface SlimMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  endDate: string;
  startDate: string;
  liquidity: string;
  volume: string;
  volume24hr: string;
  active: boolean;
  closed: boolean;
  bestBid: string;
  bestAsk: string;
  lastTradePrice: string;
  spread: string;
  description: string;
  groupItemTitle?: string;
  enableOrderBook?: boolean;
  acceptingOrders?: boolean;
  negRisk?: boolean;
  outcomes: string[];
  outcomePrices: number[];
  clobTokenIds: string[];
  tags?: Array<{ label: string; slug: string }>;
}

// ── Event (Gamma) ───────────────────────────────────────────────────────────

const EVENT_FIELDS = [
  "id",
  "ticker",
  "slug",
  "title",
  "description",
  "startDate",
  "endDate",
  "active",
  "closed",
  "archived",
  "liquidity",
  "volume",
] as const;

export interface SlimEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  liquidity: string;
  volume: string;
  markets?: SlimMarket[];
  tags?: Array<{ label: string; slug: string }>;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function tryParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function pick<T extends Record<string, unknown>>(
  obj: T,
  keys: readonly string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      result[key] = obj[key];
    }
  }
  return result;
}

// ── Public API ──────────────────────────────────────────────────────────────

export function slimMarket(raw: Record<string, unknown>): SlimMarket {
  const base = pick(raw, MARKET_FIELDS) as unknown as SlimMarket;

  // Parse JSON-encoded strings into real arrays
  base.outcomes = tryParseJson(raw.outcomes) as string[] ?? [];
  base.outcomePrices = ((tryParseJson(raw.outcomePrices) as string[]) ?? []).map(Number);
  base.clobTokenIds = tryParseJson(raw.clobTokenIds) as string[] ?? [];

  // Slim tags
  if (Array.isArray(raw.tags)) {
    base.tags = (raw.tags as Array<Record<string, unknown>>).map((t) => ({
      label: String(t.label ?? ""),
      slug: String(t.slug ?? ""),
    }));
  }

  return base;
}

export function slimEvent(
  raw: Record<string, unknown>,
  options?: { activeOnly?: boolean },
): SlimEvent {
  const base = pick(raw, EVENT_FIELDS) as unknown as SlimEvent;

  if (Array.isArray(raw.markets)) {
    let markets = raw.markets as Array<Record<string, unknown>>;
    if (options?.activeOnly) {
      markets = markets.filter(
        (m) => m.active === true && m.closed !== true,
      );
    }
    base.markets = markets.map(slimMarket);
  }

  if (Array.isArray(raw.tags)) {
    base.tags = (raw.tags as Array<Record<string, unknown>>).map((t) => ({
      label: String(t.label ?? ""),
      slug: String(t.slug ?? ""),
    }));
  }

  return base;
}

/** Format any data as a compact JSON MCP text response. */
export function jsonResponse(data: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

export function errorResponse(error: unknown) {
  return jsonResponse(`Error: ${(error as Error).message}`, true);
}
