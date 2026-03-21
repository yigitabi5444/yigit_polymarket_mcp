import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {
  server.prompt(
    "analyze_market",
    "Analyze a Polymarket prediction market in depth — probability, liquidity, volume, order book depth, and top holders.",
    { slug: z.string().describe("Market slug to analyze") },
    (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Analyze the Polymarket prediction market with slug "${args.slug}" in depth. Follow these steps:

1. Use get_market(slug: "${args.slug}") to get the market details — question, outcomes, prices, volume, liquidity.
2. Parse the clobTokenIds from the market and use get_order_book for each token to see market depth.
3. Use the market's conditionId to call get_market_holders to see who holds the largest positions.
4. Use get_market_trades with the conditionId to see recent trading activity.

Synthesize your findings into a comprehensive analysis covering:
- Current implied probability and what the market is predicting
- Liquidity and trading volume assessment
- Order book depth and spread analysis
- Notable holders and position concentration
- Any interesting patterns in recent trades`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "compare_markets",
    "Compare two or more Polymarket prediction markets side-by-side.",
    {
      slugs: z
        .string()
        .describe("Comma-separated market slugs to compare"),
    },
    (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare these Polymarket prediction markets side-by-side: ${args.slugs}

For each market slug (separated by commas):
1. Use get_market(slug) to get full details
2. Use get_order_book for each token to compare spreads

Create a comparison table covering:
- Question and current implied probability
- Volume (total and 24hr)
- Liquidity
- Best bid/ask spreads
- Market age and time remaining
- Any notable differences in market structure or activity`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "trending_markets",
    "Find the hottest prediction markets on Polymarket right now.",
    {},
    () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find the most active and trending prediction markets on Polymarket right now.

1. Use get_markets(order: "volume", ascending: false, limit: 10, active: true) to find the top 10 markets by trading volume.
2. For the top 3 markets, use get_order_book to check liquidity depth.
3. Use get_market_trades on the top market to see recent trading activity.

Present the findings as:
- A ranked list of trending markets with their questions, implied probabilities, and volumes
- Highlight any markets with unusual activity (high volume relative to liquidity, tight spreads, etc.)
- Brief commentary on what topics are generating the most trading interest`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "sports_overview",
    "Overview of sports prediction markets on Polymarket.",
    {
      sport: z.string().optional().describe("Specific sport to focus on (e.g. 'nba', 'nfl')"),
    },
    (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Give me an overview of sports prediction markets on Polymarket${args.sport ? ` focused on ${args.sport}` : ""}.

1. Use get_sports() to see available sports.
2. ${args.sport ? `Use get_sports_teams(sport: "${args.sport}") to see teams.` : "Use get_sports_teams() to browse teams."}
3. Use get_markets(tag: "${args.sport || "sports"}", order: "volume", ascending: false, limit: 20) to find the most active sports markets.
4. Use get_series() to see if there are any sports event series.

Summarize:
- What sports markets are available
- Which games/events have the most trading activity
- Current odds/probabilities for top matchups
- Total volume and liquidity in the sports category`,
          },
        },
      ],
    }),
  );
}
