import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";

export function register(server: McpServer, gamma: GammaApi) {
  server.tool(
    "get_markets",
    "List and filter Polymarket prediction markets. Supports rich filtering by volume, liquidity, dates, tags, and status. Sort by volume descending to find the most active markets.",
    {
      limit: z.number().min(1).max(100).default(20).describe("Number of results"),
      offset: z.number().min(0).default(0).describe("Pagination offset"),
      order: z
        .string()
        .optional()
        .describe("Sort field: volume, liquidity, startDate, endDate, createdAt"),
      ascending: z.boolean().optional().describe("Sort ascending (default: false)"),
      slug: z.string().optional().describe("Filter by market slug"),
      tag: z.string().optional().describe("Filter by tag label (e.g. 'politics', 'crypto')"),
      closed: z.boolean().optional().describe("Filter by closed status"),
      active: z.boolean().optional().describe("Filter by active status"),
      liquidity_min: z.number().optional().describe("Minimum liquidity (USD)"),
      liquidity_max: z.number().optional().describe("Maximum liquidity (USD)"),
      volume_min: z.number().optional().describe("Minimum volume (USD)"),
      volume_max: z.number().optional().describe("Maximum volume (USD)"),
      start_date_min: z.string().optional().describe("Minimum start date (ISO format)"),
      start_date_max: z.string().optional().describe("Maximum start date (ISO format)"),
      end_date_min: z.string().optional().describe("Minimum end date (ISO format)"),
      end_date_max: z.string().optional().describe("Maximum end date (ISO format)"),
    },
    async (args) => {
      try {
        const data = await gamma.getMarkets(args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_market",
    "Get a single Polymarket market by ID or slug. Returns full market details including outcomes, prices, volume, and liquidity.",
    {
      id: z.string().optional().describe("Market ID"),
      slug: z.string().optional().describe("Market slug"),
    },
    async (args) => {
      if (!args.id && !args.slug) {
        return {
          content: [{ type: "text", text: "Error: Either id or slug is required" }],
          isError: true,
        };
      }
      try {
        const data = await gamma.getMarket(args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    },
  );
}
