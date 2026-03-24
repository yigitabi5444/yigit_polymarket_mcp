import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";
import { slimEvent, slimMarket, jsonResponse, errorResponse } from "../../format.js";

function filterActive(items: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return items.filter((i) => i.active === true && i.closed !== true);
}

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

        // Normalize: always return both arrays for consistent schema
        const rawEvents = (Array.isArray(raw.events) ? raw.events : []) as Array<Record<string, unknown>>;
        const rawMarkets = (Array.isArray(raw.markets) ? raw.markets : []) as Array<Record<string, unknown>>;

        let events = rawEvents;
        let markets = rawMarkets;
        let note: string | undefined;

        if (args.active_only) {
          const activeEvents = filterActive(events);
          const activeMarkets = filterActive(markets);

          // If filtering removes everything, return unfiltered with a note
          if (activeEvents.length === 0 && activeMarkets.length === 0 && (events.length > 0 || markets.length > 0)) {
            note = "No active/open results found. Showing all results including closed/resolved markets.";
          } else {
            events = activeEvents;
            markets = activeMarkets;
          }
        }

        const result: Record<string, unknown> = {
          events: events.map((e) => slimEvent(e, { activeOnly: args.active_only })),
          markets: markets.map((m) => slimMarket(m)),
        };

        if (note) result.note = note;

        return jsonResponse(result);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
