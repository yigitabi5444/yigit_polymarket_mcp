import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";
import { slimEvent, jsonResponse, errorResponse } from "../../format.js";

export function register(server: McpServer, gamma: GammaApi) {
  server.tool(
    "get_events",
    "List and filter Polymarket prediction events. Defaults to active, non-closed events sorted by volume descending. Supports pagination, sorting, and filtering by status/tag.",
    {
      limit: z.number().min(1).max(100).default(20).describe("Number of results to return"),
      offset: z.number().min(0).default(0).describe("Pagination offset"),
      order: z
        .string()
        .default("volume")
        .describe("Sort field: volume, liquidity, startDate, endDate, createdAt"),
      ascending: z.boolean().default(false).describe("Sort ascending (default: false)"),
      slug: z.string().optional().describe("Filter by event slug"),
      tag: z.string().optional().describe("Filter by tag label"),
      closed: z.boolean().default(false).describe("Filter by closed status (default: false = open only)"),
      active: z.boolean().default(true).describe("Filter by active status (default: true = active only)"),
    },
    async (args) => {
      try {
        const data = await gamma.getEvents(args);
        return jsonResponse(data.map((e) => slimEvent(e as unknown as Record<string, unknown>, { activeOnly: args.active })));
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    "get_event",
    "Get a single Polymarket event by ID or slug. Returns event details with nested markets.",
    {
      id: z.string().optional().describe("Event ID"),
      slug: z.string().optional().describe("Event slug"),
      active_markets_only: z.boolean().default(true).describe("Only include active/open sub-markets (default: true)"),
    },
    async (args) => {
      if (!args.id && !args.slug) {
        return errorResponse(new Error("Either id or slug is required"));
      }
      try {
        const data = await gamma.getEvent(args);
        return jsonResponse(slimEvent(data as unknown as Record<string, unknown>, { activeOnly: args.active_markets_only }));
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
