import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataApi } from "../../api/data.js";
import { jsonResponse, errorResponse } from "../../format.js";

export function register(server: McpServer, dataApi: DataApi) {
  server.tool(
    "get_market_trades",
    "Get recent trades for a Polymarket market. Shows who traded, which side, size, price, and timestamp.",
    {
      condition_id: z.string().describe("Market condition ID"),
      limit: z.number().min(1).max(500).default(20).describe("Number of trades to return"),
      offset: z.number().min(0).default(0).describe("Pagination offset"),
    },
    async (args) => {
      try {
        const data = await dataApi.getTrades({
          conditionId: args.condition_id,
          limit: args.limit,
          offset: args.offset,
        });
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
