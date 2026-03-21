import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GammaApi } from "../../api/gamma.js";

export function register(server: McpServer, gamma: GammaApi) {
  server.tool(
    "get_series",
    "List Polymarket event series (grouped collections of related events).",
    {
      limit: z.number().min(1).max(100).default(20).describe("Number of results"),
      offset: z.number().min(0).default(0).describe("Pagination offset"),
    },
    async (args) => {
      try {
        const data = await gamma.getSeries(args);
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
    "get_series_by_id",
    "Get a specific Polymarket event series by ID, including all events in the series.",
    {
      id: z.string().describe("Series ID"),
    },
    async (args) => {
      try {
        const data = await gamma.getSeriesById(args.id);
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
