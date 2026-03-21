import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DataApi } from "../../api/data.js";

export function register(server: McpServer, dataApi: DataApi) {
  server.tool(
    "get_market_holders",
    "Get top holders/positions for a Polymarket market. Shows the largest positions and who holds them.",
    {
      condition_id: z.string().describe("Market condition ID"),
      limit: z.number().min(1).max(500).default(20).describe("Number of holders to return"),
      offset: z.number().min(0).default(0).describe("Pagination offset"),
    },
    async (args) => {
      try {
        const data = await dataApi.getHolders({
          conditionId: args.condition_id,
          limit: args.limit,
          offset: args.offset,
        });
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
