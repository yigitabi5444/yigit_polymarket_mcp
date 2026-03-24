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
      active_only: z.boolean().default(true).describe("Only return active/open markets and filter closed sub-markets from events (default: true)"),
    },
    async (args) => {
      try {
        const raw = await gamma.search(args.query);
        const result: Record<string, unknown> = {};
        let hasResults = false;

        if (Array.isArray(raw.events)) {
          let events = raw.events as Array<Record<string, unknown>>;
          if (args.active_only) {
            events = events.filter((e) => e.active === true && e.closed !== true);
          }
          if (events.length > 0) {
            result.events = events.map((e) => slimEvent(e, { activeOnly: args.active_only }));
            hasResults = true;
          }
        }
        if (Array.isArray(raw.markets)) {
          let markets = raw.markets as Array<Record<string, unknown>>;
          if (args.active_only) {
            markets = markets.filter((m) => m.active === true && m.closed !== true);
          }
          if (markets.length > 0) {
            result.markets = markets.map((m) => slimMarket(m));
            hasResults = true;
          }
        }

        // Fallback: if public-search returned nothing useful, try the markets
        // endpoint with a text query filter. Gamma supports `_q` for text search.
        if (!hasResults) {
          const fallbackParams: Record<string, unknown> = {
            active: args.active_only ? true : undefined,
            closed: args.active_only ? false : undefined,
            order: "volume",
            ascending: false,
            limit: 20,
          };
          const markets = await gamma.searchMarkets(args.query, fallbackParams);
          if (Array.isArray(markets) && markets.length > 0) {
            result.markets = (markets as Array<Record<string, unknown>>).map((m) => slimMarket(m));
          }
        }

        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
