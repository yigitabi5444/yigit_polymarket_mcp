import type { ApiClient } from "./client.js";
import type {
  ClobPrice,
  ClobMidpoint,
  ClobLastTradePrice,
  ClobOrderBook,
  ClobOrderBookSummary,
  ClobMarket,
  ClobTickSize,
  ClobTrade,
  ClobPriceHistory,
} from "../types/clob.js";
import { CACHE_TTLS } from "../config.js";

export class ClobApi {
  constructor(private client: ApiClient) {}

  async getPrice(tokenId: string, side: "buy" | "sell"): Promise<ClobPrice> {
    return this.client.clob<ClobPrice>("/price", {
      token_id: tokenId,
      side,
    });
  }

  async getMidpoint(tokenId: string): Promise<ClobMidpoint> {
    return this.client.clob<ClobMidpoint>("/midpoint", {
      token_id: tokenId,
    });
  }

  async getLastTradePrice(tokenId: string): Promise<ClobLastTradePrice> {
    return this.client.clob<ClobLastTradePrice>("/last-trade-price", {
      token_id: tokenId,
    });
  }

  async getOrderBook(tokenId: string): Promise<ClobOrderBook> {
    return this.client.clob<ClobOrderBook>(
      "/book",
      { token_id: tokenId },
      CACHE_TTLS.orderBook,
    );
  }

  async getOrderBooks(tokenIds: string[]): Promise<ClobOrderBook[]> {
    return this.client.clobPost<ClobOrderBook[]>("/books", tokenIds);
  }

  async getOrderBookSummary(tokenId: string): Promise<ClobOrderBookSummary> {
    return this.client.clob<ClobOrderBookSummary>("/order-book-summary", {
      token_id: tokenId,
    });
  }

  async getMarket(conditionId: string): Promise<ClobMarket> {
    return this.client.clob<ClobMarket>(`/markets/${conditionId}`);
  }

  async getSamplingMarkets(): Promise<ClobMarket[]> {
    return this.client.clob<ClobMarket[]>(
      "/sampling-markets",
      undefined,
      CACHE_TTLS.samplingMarkets,
    );
  }

  async getSamplingSimplifiedMarkets(): Promise<ClobMarket[]> {
    return this.client.clob<ClobMarket[]>(
      "/sampling-simplified-markets",
      undefined,
      CACHE_TTLS.samplingMarkets,
    );
  }

  async getPriceHistory(
    tokenId: string,
    interval: string = "max",
    fidelity: number = 60,
  ): Promise<ClobPriceHistory> {
    return this.client.clob<ClobPriceHistory>("/prices-history", {
      market: tokenId,
      interval,
      fidelity: String(fidelity),
    });
  }

  async getTickSize(tokenId: string): Promise<ClobTickSize> {
    return this.client.clob<ClobTickSize>("/tick-size", {
      token_id: tokenId,
    });
  }

  async getTrades(params?: {
    market?: string;
    limit?: number;
  }): Promise<ClobTrade[]> {
    const query: Record<string, string | undefined> = {};
    if (params?.market) query.market = params.market;
    if (params?.limit !== undefined) query.limit = String(params.limit);
    return this.client.clob<ClobTrade[]>("/trades", query);
  }
}
