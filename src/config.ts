export const GAMMA_BASE_URL = "https://gamma-api.polymarket.com";
export const CLOB_BASE_URL = "https://clob.polymarket.com";
export const DATA_BASE_URL = "https://data-api.polymarket.com";

export const RATE_LIMITS = {
  [GAMMA_BASE_URL]: { capacity: 4000, windowMs: 10_000 },
  [CLOB_BASE_URL]: { capacity: 9000, windowMs: 10_000 },
  [DATA_BASE_URL]: { capacity: 1000, windowMs: 10_000 },
} as const;

export const CACHE_TTLS = {
  tags: 5 * 60 * 1000,
  sports: 5 * 60 * 1000,
  marketById: 30 * 1000,
  eventById: 30 * 1000,
  orderBook: 5 * 1000,
  samplingMarkets: 60 * 1000,
  search: 15 * 1000,
} as const;

export const REQUEST_TIMEOUT_MS = 15_000;
export const MAX_RETRIES = 3;
export const RETRY_BASE_DELAY_MS = 1000;
