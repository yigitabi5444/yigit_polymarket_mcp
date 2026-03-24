import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";
import type { GammaSearchResult } from "../../types/gamma.js";
import { slimEvent, slimMarket, jsonResponse, errorResponse } from "../../format.js";

/** Check if an event has at least one active, non-closed sub-market */
function hasActiveMarkets(event: Record<string, unknown>): boolean {
  const markets = event.markets as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(markets)) return event.closed !== true;
  return markets.some((m) => m.active === true && m.closed !== true);
}

function isActive(item: Record<string, unknown>): boolean {
  return item.closed !== true;
}

function extractActive(raw: GammaSearchResult) {
  const events = (Array.isArray(raw.events) ? raw.events : []) as Array<Record<string, unknown>>;
  const markets = (Array.isArray(raw.markets) ? raw.markets : []) as Array<Record<string, unknown>>;
  const activeEvents = events.filter((e) => isActive(e) || hasActiveMarkets(e));
  const activeMarkets = markets.filter(isActive);
  return { events, markets, activeEvents, activeMarkets };
}

/**
 * Generate shorter sub-queries from a multi-word query.
 * "Federal Reserve interest rate" → ["Federal Reserve", "interest rate"]
 * Skips queries that are already 1-2 words.
 */
function generateSubQueries(query: string): string[] {
  const words = query.trim().split(/\s+/);
  if (words.length <= 2) return [];

  const subs: string[] = [];
  // Try pairs of consecutive words
  for (let i = 0; i < words.length - 1; i++) {
    subs.push(`${words[i]} ${words[i + 1]}`);
  }
  return subs;
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
        let { events, markets, activeEvents, activeMarkets } = extractActive(raw);
        let note: string | undefined;

        if (args.active_only) {
          if (activeEvents.length > 0 || activeMarkets.length > 0) {
            events = activeEvents;
            markets = activeMarkets;
          } else {
            // No active results — try shorter sub-queries as fallback
            const subQueries = generateSubQueries(args.query);
            for (const sub of subQueries) {
              const subRaw = await gamma.search(sub);
              const subResult = extractActive(subRaw);
              if (subResult.activeEvents.length > 0 || subResult.activeMarkets.length > 0) {
                events = subResult.activeEvents;
                markets = subResult.activeMarkets;
                note = `No active results for "${args.query}". Showing results for "${sub}" instead.`;
                break;
              }
            }

            // Still nothing active — show closed results from original query
            if (!note && (events.length > 0 || markets.length > 0)) {
              note = `No active/open results for "${args.query}". Showing ${events.length + markets.length} closed/resolved result(s).`;
            }
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
