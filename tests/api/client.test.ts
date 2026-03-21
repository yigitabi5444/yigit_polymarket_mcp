import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClient } from "../../src/api/client.js";
import { TTLCache } from "../../src/api/cache.js";
import { GAMMA_BASE_URL } from "../../src/config.js";

describe("ApiClient", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("makes successful GET request and returns parsed JSON", async () => {
    const mockData = { id: "1", question: "Test?" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const client = new ApiClient();
    const result = await client.gamma("/events");

    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("builds URL with query parameters", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    const client = new ApiClient();
    await client.gamma("/markets", { limit: "10", slug: "test-market" });

    const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledUrl).toContain("limit=10");
    expect(calledUrl).toContain("slug=test-market");
  });

  it("throws on non-retryable HTTP errors", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: () => Promise.resolve("Not found"),
    });

    const client = new ApiClient();
    await expect(client.gamma("/markets/nonexistent")).rejects.toThrow("HTTP 404");
  });

  it("retries on 429 status", async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
          headers: new Map(),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: "ok" }),
      });
    });

    const client = new ApiClient();
    const result = await client.gamma("/events");

    expect(result).toEqual({ data: "ok" });
    expect(callCount).toBe(2);
  });

  it("uses cache when cacheTtlMs is provided", async () => {
    const mockData = { cached: true };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const cache = new TTLCache();
    const client = new ApiClient(cache);

    // First call hits the API
    const result1 = await client.gamma("/tags", undefined, 60000);
    expect(result1).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledOnce();

    // Second call should hit cache
    const result2 = await client.gamma("/tags", undefined, 60000);
    expect(result2).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledOnce(); // Still only once

    cache.destroy();
  });
});
