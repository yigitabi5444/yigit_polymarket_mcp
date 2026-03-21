interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private sweepInterval: ReturnType<typeof setInterval> | null = null;
  private disabled: boolean;

  constructor() {
    this.disabled = process.env.POLYMARKET_CACHE_DISABLED === "true";
    if (!this.disabled) {
      this.sweepInterval = setInterval(() => this.sweep(), 60_000);
      this.sweepInterval.unref();
    }
  }

  get<T>(key: string): T | undefined {
    if (this.disabled) return undefined;
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set(key: string, value: unknown, ttlMs: number): void {
    if (this.disabled) return;
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  private sweep(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  destroy(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    this.store.clear();
  }
}
