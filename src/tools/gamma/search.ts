import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";
import { slimEvent, slimMarket, jsonResponse, errorResponse } from "../../format.js";

export function register(server: McpServer, gamma: GammaApi) {
  server.tool(
    "search",
    "Full-text search across Polymarket events, markets, and profiles. Use this to find markets on any topic.",
    {
      query: z.string().min(1).describe("Search query (e.g. 'election', 'bitcoin', 'AI')"),
    },
    async (args) => {
      try {
        const raw = await gamma.search(args.query);
        const result: Record<string, unknown> = {};
        if (Array.isArray(raw.events)) {
          result.events = raw.events.map((e) => slimEvent(e as unknown as Record<string, unknown>));
        }
        if (Array.isArray(raw.markets)) {
          result.markets = raw.markets.map((m) => slimMarket(m as unknown as Record<string, unknown>));
        }
        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
