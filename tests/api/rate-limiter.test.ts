import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TokenBucketRateLimiter } from "../../src/api/rate-limiter.js";

describe("TokenBucketRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within capacity", async () => {
    const limiter = new TokenBucketRateLimiter(10, 1000);
    // Should immediately resolve for first 10 requests
    for (let i = 0; i < 10; i++) {
      await limiter.acquire();
    }
  });

  it("refills tokens over time", async () => {
    const limiter = new TokenBucketRateLimiter(2, 1000);

    await limiter.acquire();
    await limiter.acquire();
    // Bucket is now empty

    // Advance time by 500ms (should refill 1 token: 2/1000 * 500 = 1)
    vi.advanceTimersByTime(500);

    // Should be able to acquire 1 more
    await limiter.acquire();
  });

  it("waits when bucket is exhausted", async () => {
    const limiter = new TokenBucketRateLimiter(1, 1000);
    await limiter.acquire();

    // Bucket empty, next acquire should wait
    let resolved = false;
    const promise = limiter.acquire().then(() => {
      resolved = true;
    });

    // Not yet resolved
    expect(resolved).toBe(false);

    // Advance time to refill
    vi.advanceTimersByTime(1000);
    await promise;

    expect(resolved).toBe(true);
  });
});
