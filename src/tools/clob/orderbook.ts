import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClobApi } from "../../api/clob.js";
import { jsonResponse, errorResponse } from "../../format.js";

export function register(server: McpServer, clob: ClobApi) {
  server.tool(
    "get_order_book",
    "Get the full order book (bids and asks) for a Polymarket token. Shows market depth and liquidity at each price level.",
    {
      token_id: z.string().describe("CLOB token ID"),
    },
    async (args) => {
      try {
        const data = await clob.getOrderBook(args.token_id);
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    "get_order_books",
    "Get order books for multiple Polymarket tokens in a single batch request.",
    {
      token_ids: z
        .array(z.string())
        .min(1)
        .max(20)
        .describe("Array of CLOB token IDs"),
    },
    async (args) => {
      try {
        const data = await clob.getOrderBooks(args.token_ids);
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    "get_order_book_summary",
    "Get a summarized order book for a Polymarket token: best bid, best ask, and spread.",
    {
      token_id: z.string().describe("CLOB token ID"),
    },
    async (args) => {
      try {
        const data = await clob.getOrderBookSummary(args.token_id);
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
