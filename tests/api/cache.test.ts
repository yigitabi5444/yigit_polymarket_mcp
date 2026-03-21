import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TTLCache } from "../../src/api/cache.js";

describe("TTLCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined for missing keys", () => {
    const cache = new TTLCache();
    expect(cache.get("nonexistent")).toBeUndefined();
    cache.destroy();
  });

  it("stores and retrieves values within TTL", () => {
    const cache = new TTLCache();
    cache.set("key1", { data: "test" }, 5000);
    expect(cache.get("key1")).toEqual({ data: "test" });
    cache.destroy();
  });

  it("returns undefined after TTL expiry", () => {
    const cache = new TTLCache();
    cache.set("key1", "value", 1000);

    vi.advanceTimersByTime(1001);

    expect(cache.get("key1")).toBeUndefined();
    cache.destroy();
  });

  it("clears all entries", () => {
    const cache = new TTLCache();
    cache.set("a", 1, 5000);
    cache.set("b", 2, 5000);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
    cache.destroy();
  });

  it("respects POLYMARKET_CACHE_DISABLED", () => {
    const original = process.env.POLYMARKET_CACHE_DISABLED;
    process.env.POLYMARKET_CACHE_DISABLED = "true";

    const cache = new TTLCache();
    cache.set("key", "value", 60000);
    expect(cache.get("key")).toBeUndefined();

    cache.destroy();
    process.env.POLYMARKET_CACHE_DISABLED = original;
  });
});
