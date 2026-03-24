import type { ApiClient } from "./client.js";
import type {
  GammaMarket,
  GammaEvent,
  GammaTag,
  GammaSeries,
  GammaSearchResult,
  GammaSport,
  GammaSportsTeam,
} from "../types/gamma.js";
import { CACHE_TTLS } from "../config.js";

export class GammaApi {
  constructor(private client: ApiClient) {}

  async getEvents(params?: {
    limit?: number;
    offset?: number;
    order?: string;
    ascending?: boolean;
    slug?: string;
    tag?: string;
    closed?: boolean;
    active?: boolean;
    archived?: boolean;
  }): Promise<GammaEvent[]> {
    const query: Record<string, string | undefined> = {};
    if (params?.limit !== undefined) query.limit = String(params.limit);
    if (params?.offset !== undefined) query.offset = String(params.offset);
    if (params?.order) query.order = params.order;
    if (params?.ascending !== undefined) query.ascending = String(params.ascending);
    if (params?.slug) query.slug = params.slug;
    if (params?.tag) query.tag = params.tag;
    if (params?.closed !== undefined) query.closed = String(params.closed);
    if (params?.active !== undefined) query.active = String(params.active);
    if (params?.archived !== undefined) query.archived = String(params.archived);
    return this.client.gamma<GammaEvent[]>("/events", query);
  }

  async getEvent(params: { id?: string; slug?: string }): Promise<GammaEvent> {
    if (params.id) {
      return this.client.gamma<GammaEvent>(
        `/events/${params.id}`,
        undefined,
        CACHE_TTLS.eventById,
      );
    }
    const results = await this.client.gamma<GammaEvent[]>("/events", {
      slug: params.slug,
    });
    if (!results || results.length === 0) {
      throw new Error(`Event not found: ${params.slug}`);
    }
    return results[0];
  }

  async getMarkets(params?: {
    limit?: number;
    offset?: number;
    order?: string;
    ascending?: boolean;
    slug?: string;
    tag?: string;
    closed?: boolean;
    active?: boolean;
    liquidity_min?: number;
    liquidity_max?: number;
    volume_min?: number;
    volume_max?: number;
    start_date_min?: string;
    start_date_max?: string;
    end_date_min?: string;
    end_date_max?: string;
  }): Promise<GammaMarket[]> {
    const query: Record<string, string | undefined> = {};
    if (params?.limit !== undefined) query.limit = String(params.limit);
    if (params?.offset !== undefined) query.offset = String(params.offset);
    if (params?.order) query.order = params.order;
    if (params?.ascending !== undefined) query.ascending = String(params.ascending);
    if (params?.slug) query.slug = params.slug;
    if (params?.tag) query.tag = params.tag;
    if (params?.closed !== undefined) query.closed = String(params.closed);
    if (params?.active !== undefined) query.active = String(params.active);
    if (params?.liquidity_min !== undefined)
      query.liquidity_num_min = String(params.liquidity_min);
    if (params?.liquidity_max !== undefined)
      query.liquidity_num_max = String(params.liquidity_max);
    if (params?.volume_min !== undefined)
      query.volume_num_min = String(params.volume_min);
    if (params?.volume_max !== undefined)
      query.volume_num_max = String(params.volume_max);
    if (params?.start_date_min) query.start_date_min = params.start_date_min;
    if (params?.start_date_max) query.start_date_max = params.start_date_max;
    if (params?.end_date_min) query.end_date_min = params.end_date_min;
    if (params?.end_date_max) query.end_date_max = params.end_date_max;
    return this.client.gamma<GammaMarket[]>("/markets", query);
  }

  async getMarket(params: { id?: string; slug?: string }): Promise<GammaMarket> {
    if (params.id) {
      return this.client.gamma<GammaMarket>(
        `/markets/${params.id}`,
        undefined,
        CACHE_TTLS.marketById,
      );
    }
    const results = await this.client.gamma<GammaMarket[]>("/markets", {
      slug: params.slug,
    });
    if (!results || results.length === 0) {
      throw new Error(`Market not found: ${params.slug}`);
    }
    return results[0];
  }

  async search(query: string): Promise<GammaSearchResult> {
    return this.client.gamma<GammaSearchResult>(
      "/public-search",
      { q: query },
      CACHE_TTLS.search,
    );
  }


  async getTags(): Promise<GammaTag[]> {
    return this.client.gamma<GammaTag[]>("/tags", undefined, CACHE_TTLS.tags);
  }

  async getSeries(params?: {
    limit?: number;
    offset?: number;
  }): Promise<GammaSeries[]> {
    const query: Record<string, string | undefined> = {};
    if (params?.limit !== undefined) query.limit = String(params.limit);
    if (params?.offset !== undefined) query.offset = String(params.offset);
    return this.client.gamma<GammaSeries[]>("/series", query);
  }

  async getSeriesById(id: string): Promise<GammaSeries> {
    return this.client.gamma<GammaSeries>(`/series/${id}`);
  }

  async getSports(): Promise<GammaSport[]> {
    return this.client.gamma<GammaSport[]>("/sports", undefined, CACHE_TTLS.sports);
  }

  async getSportsTeams(sport?: string): Promise<GammaSportsTeam[]> {
    const query: Record<string, string | undefined> = {};
    if (sport) query.sport = sport;
    return this.client.gamma<GammaSportsTeam[]>("/sports/teams", query, CACHE_TTLS.sports);
  }
}
