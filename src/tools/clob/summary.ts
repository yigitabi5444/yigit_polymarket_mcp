import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClobApi } from "../../api/clob.js";
import type { GammaApi } from "../../api/gamma.js";
import { slimMarket, jsonResponse, errorResponse } from "../../format.js";

/**
 * Computes price change stats from a price history array.
 * Points are [{t: unix_seconds, p: price}, ...] sorted ascending by time.
 */
function computePriceChanges(
  history: Array<{ t: number; p: number }>,
  nowPrice: number,
) {
  if (!history.length) return {};

  const nowTs = Date.now() / 1000;
  const cutoffs = {
    "24h": nowTs - 86400,
    "7d": nowTs - 7 * 86400,
    "30d": nowTs - 30 * 86400,
  };

  const changes: Record<string, unknown> = {};

  for (const [label, cutoff] of Object.entries(cutoffs)) {
    // Find the first point at or after the cutoff
    const point = history.find((p) => p.t >= cutoff);
    if (point) {
      const change = nowPrice - point.p;
      const changePct = point.p !== 0 ? (change / point.p) * 100 : 0;
      changes[`price_change_${label}`] = Math.round(change * 10000) / 10000;
      changes[`price_change_${label}_pct`] = Math.round(changePct * 100) / 100;
    }
  }

  // Period high/low
  changes.period_high = Math.max(...history.map((p) => p.p));
  changes.period_low = Math.min(...history.map((p) => p.p));

  return changes;
}

export function register(server: McpServer, clob: ClobApi, gamma: GammaApi) {
  server.tool(
    "get_market_summary",
    "Get a compact market summary with current price and 24h/7d/30d price changes. Ideal for pipeline use — avoids fetching full price history separately. Takes a market slug or ID.",
    {
      slug: z.string().optional().describe("Market slug"),
      id: z.string().optional().describe("Market ID"),
    },
    async (args) => {
      if (!args.slug && !args.id) {
        return errorResponse(new Error("Either slug or id is required"));
      }
      try {
        const market = await gamma.getMarket(args);
        const slim = slimMarket(market as unknown as Record<string, unknown>);

        // Fetch 30d price history for each token to compute changes
        const tokenSummaries = await Promise.all(
          slim.clobTokenIds.map(async (tokenId, i) => {
            try {
              const history = await clob.getPriceHistory(tokenId, "1m", 360);
              const currentPrice = slim.outcomePrices[i] ?? 0;
              const points = history?.history ?? [];
              return {
                outcome: slim.outcomes[i] ?? `Token ${i}`,
                token_id: tokenId,
                current_price: currentPrice,
                ...computePriceChanges(points, currentPrice),
              };
            } catch {
              return {
                outcome: slim.outcomes[i] ?? `Token ${i}`,
                token_id: tokenId,
                current_price: slim.outcomePrices[i] ?? 0,
              };
            }
          }),
        );

        return jsonResponse({
          id: slim.id,
          question: slim.question,
          slug: slim.slug,
          volume: slim.volume,
          volume24hr: slim.volume24hr,
          liquidity: slim.liquidity,
          active: slim.active,
          closed: slim.closed,
          endDate: slim.endDate,
          tokens: tokenSummaries,
        });
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
