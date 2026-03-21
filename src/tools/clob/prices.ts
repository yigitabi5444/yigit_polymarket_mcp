import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClobApi } from "../../api/clob.js";

export function register(server: McpServer, clob: ClobApi) {
  server.tool(
    "get_price",
    "Get the current price for a Polymarket token on the given side (buy or sell). Returns the best available price.",
    {
      token_id: z.string().describe("CLOB token ID (from market's clobTokenIds)"),
      side: z.enum(["buy", "sell"]).describe("Order side: buy or sell"),
    },
    async (args) => {
      try {
        const data = await clob.getPrice(args.token_id, args.side);
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
    "get_midpoint",
    "Get the midpoint price for a Polymarket token (average of best bid and ask).",
    {
      token_id: z.string().describe("CLOB token ID"),
    },
    async (args) => {
      try {
        const data = await clob.getMidpoint(args.token_id);
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
    "get_last_trade_price",
    "Get the last executed trade price for a Polymarket token.",
    {
      token_id: z.string().describe("CLOB token ID"),
    },
    async (args) => {
      try {
        const data = await clob.getLastTradePrice(args.token_id);
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
