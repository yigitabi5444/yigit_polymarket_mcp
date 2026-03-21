import {
  GAMMA_BASE_URL,
  CLOB_BASE_URL,
  DATA_BASE_URL,
  RATE_LIMITS,
  REQUEST_TIMEOUT_MS,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
} from "../config.js";
import { TokenBucketRateLimiter } from "./rate-limiter.js";
import { TTLCache } from "./cache.js";

export class ApiClient {
  readonly cache: TTLCache;
  private rateLimiters: Map<string, TokenBucketRateLimiter>;

  constructor(cache?: TTLCache) {
    this.cache = cache ?? new TTLCache();
    this.rateLimiters = new Map();
    for (const [baseUrl, config] of Object.entries(RATE_LIMITS)) {
      this.rateLimiters.set(
        baseUrl,
        new TokenBucketRateLimiter(config.capacity, config.windowMs),
      );
    }
  }

  async request<T>(
    baseUrl: string,
    path: string,
    params?: Record<string, string | string[] | undefined>,
    options?: { cacheTtlMs?: number; method?: string; body?: unknown },
  ): Promise<T> {
    const url = this.buildUrl(baseUrl, path, params);
    const cacheKey = url.toString();

    if (options?.cacheTtlMs) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached !== undefined) return cached;
    }

    const limiter = this.rateLimiters.get(baseUrl);
    if (limiter) await limiter.acquire();

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const fetchOptions: RequestInit = {
          method: options?.method ?? "GET",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        };

        if (options?.body) {
          fetchOptions.headers = {
            ...fetchOptions.headers,
            "Content-Type": "application/json",
          };
          fetchOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url.toString(), fetchOptions);
        clearTimeout(timeout);

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const delay = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          throw new Error(`Rate limited after ${MAX_RETRIES} retries`);
        }

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}${body ? ` - ${body}` : ""}`,
          );
        }

        const data = (await response.json()) as T;

        if (options?.cacheTtlMs) {
          this.cache.set(cacheKey, data, options.cacheTtlMs);
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        if (
          lastError.name === "AbortError" ||
          (lastError.message && /ECONNRESET|ETIMEDOUT|ENOTFOUND/.test(lastError.message))
        ) {
          if (attempt < MAX_RETRIES) {
            await new Promise((r) =>
              setTimeout(r, RETRY_BASE_DELAY_MS * Math.pow(2, attempt)),
            );
            continue;
          }
        }
        if (attempt >= MAX_RETRIES || !this.isRetryable(lastError)) {
          break;
        }
      }
    }

    throw lastError ?? new Error("Request failed");
  }

  private buildUrl(
    baseUrl: string,
    path: string,
    params?: Record<string, string | string[] | undefined>,
  ): URL {
    const url = new URL(path, baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(key, v);
          }
        } else {
          url.searchParams.set(key, value);
        }
      }
    }
    return url;
  }

  private isRetryable(error: Error): boolean {
    if (error.name === "AbortError") return true;
    if (error.message && /429|ECONNRESET|ETIMEDOUT/.test(error.message)) return true;
    return false;
  }

  async gamma<T>(
    path: string,
    params?: Record<string, string | string[] | undefined>,
    cacheTtlMs?: number,
  ): Promise<T> {
    return this.request<T>(GAMMA_BASE_URL, path, params, { cacheTtlMs });
  }

  async clob<T>(
    path: string,
    params?: Record<string, string | string[] | undefined>,
    cacheTtlMs?: number,
  ): Promise<T> {
    return this.request<T>(CLOB_BASE_URL, path, params, { cacheTtlMs });
  }

  async clobPost<T>(path: string, body: unknown, cacheTtlMs?: number): Promise<T> {
    return this.request<T>(CLOB_BASE_URL, path, undefined, {
      method: "POST",
      body,
      cacheTtlMs,
    });
  }

  async data<T>(
    path: string,
    params?: Record<string, string | string[] | undefined>,
    cacheTtlMs?: number,
  ): Promise<T> {
    return this.request<T>(DATA_BASE_URL, path, params, { cacheTtlMs });
  }
}
