import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";

export function register(server: McpServer, gamma: GammaApi) {
  server.tool(
    "get_events",
    "List and filter Polymarket prediction events. Supports pagination, sorting, and filtering by status/tag.",
    {
      limit: z.number().min(1).max(100).default(20).describe("Number of results to return"),
      offset: z.number().min(0).default(0).describe("Pagination offset"),
      order: z
        .string()
        .optional()
        .describe("Sort field: volume, liquidity, startDate, endDate, createdAt"),
      ascending: z.boolean().optional().describe("Sort ascending (default: false)"),
      slug: z.string().optional().describe("Filter by event slug"),
      tag: z.string().optional().describe("Filter by tag label"),
      closed: z.boolean().optional().describe("Filter by closed status"),
      active: z.boolean().optional().describe("Filter by active status"),
    },
    async (args) => {
      try {
        const data = await gamma.getEvents(args);
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
    "get_event",
    "Get a single Polymarket event by ID or slug. Returns full event details including nested markets.",
    {
      id: z.string().optional().describe("Event ID"),
      slug: z.string().optional().describe("Event slug"),
    },
    async (args) => {
      if (!args.id && !args.slug) {
        return {
          content: [{ type: "text", text: "Error: Either id or slug is required" }],
          isError: true,
        };
      }
      try {
        const data = await gamma.getEvent(args);
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
