import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";
import { slimMarket, jsonResponse, errorResponse } from "../../format.js";

export function register(server: McpServer, gamma: GammaApi) {
  server.tool(
    "get_markets",
    "List and filter Polymarket prediction markets. Defaults to active, non-closed markets sorted by volume descending. Supports rich filtering by volume, liquidity, dates, tags, and status.",
    {
      limit: z.number().min(1).max(100).default(20).describe("Number of results"),
      offset: z.number().min(0).default(0).describe("Pagination offset"),
      order: z
        .string()
        .default("volume")
        .describe("Sort field: volume, liquidity, startDate, endDate, createdAt"),
      ascending: z.boolean().default(false).describe("Sort ascending (default: false)"),
      slug: z.string().optional().describe("Filter by market slug"),
      tag: z.string().optional().describe("Filter by tag label (e.g. 'politics', 'crypto')"),
      closed: z.boolean().default(false).describe("Filter by closed status (default: false = open only)"),
      active: z.boolean().default(true).describe("Filter by active status (default: true = active only)"),
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
        return jsonResponse(data.map((m) => slimMarket(m as unknown as Record<string, unknown>)));
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    "get_market",
    "Get a single Polymarket market by ID, slug, or condition ID. Returns clean market details with parsed outcomes and prices.",
    {
      id: z.string().optional().describe("Market ID"),
      slug: z.string().optional().describe("Market slug"),
    },
    async (args) => {
      if (!args.id && !args.slug) {
        return errorResponse(new Error("Either id or slug is required"));
      }
      try {
        const data = await gamma.getMarket(args);
        return jsonResponse(slimMarket(data as unknown as Record<string, unknown>));
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
