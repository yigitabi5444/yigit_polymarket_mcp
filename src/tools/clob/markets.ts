import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClobApi } from "../../api/clob.js";

export function register(server: McpServer, clob: ClobApi) {
  server.tool(
    "get_clob_market",
    "Get CLOB-specific market details by condition ID. Returns tokens, rewards, tick sizes, and trading parameters.",
    {
      condition_id: z.string().describe("Market condition ID"),
    },
    async (args) => {
      try {
        const data = await clob.getMarket(args.condition_id);
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
    "get_sampling_markets",
    "Get currently sampled Polymarket markets that are eligible for liquidity rewards.",
    {},
    async () => {
      try {
        const data = await clob.getSamplingMarkets();
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
    "get_sampling_simplified_markets",
    "Get simplified view of currently sampled Polymarket markets.",
    {},
    async () => {
      try {
        const data = await clob.getSamplingSimplifiedMarkets();
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
