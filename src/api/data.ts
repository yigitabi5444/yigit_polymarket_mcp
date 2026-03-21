import type { ApiClient } from "./client.js";
import type { DataTrade, DataHolder } from "../types/data.js";

export class DataApi {
  constructor(private client: ApiClient) {}

  async getTrades(params: {
    conditionId: string;
    limit?: number;
    offset?: number;
  }): Promise<DataTrade[]> {
    const query: Record<string, string | undefined> = {
      conditionId: params.conditionId,
    };
    if (params.limit !== undefined) query.limit = String(params.limit);
    if (params.offset !== undefined) query.offset = String(params.offset);
    return this.client.data<DataTrade[]>("/trades", query);
  }

  async getHolders(params: {
    conditionId: string;
    limit?: number;
    offset?: number;
  }): Promise<DataHolder[]> {
    const query: Record<string, string | undefined> = {
      conditionId: params.conditionId,
    };
    if (params.limit !== undefined) query.limit = String(params.limit);
    if (params.offset !== undefined) query.offset = String(params.offset);
    return this.client.data<DataHolder[]>("/holders", query);
  }
}
