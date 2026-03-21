import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClobApi } from "../../api/clob.js";
import { jsonResponse, errorResponse } from "../../format.js";

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
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
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
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
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
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );

  server.tool(
    "get_price_history",
    "Get historical price time series for a Polymarket token. Returns array of {t: unix_timestamp, p: price} points. Useful for charting price movements over time.",
    {
      token_id: z.string().describe("CLOB token ID (from market's clobTokenIds)"),
      interval: z
        .enum(["1d", "1w", "1m", "3m", "6m", "1y", "max"])
        .default("max")
        .describe("Time interval: 1d, 1w, 1m, 3m, 6m, 1y, or max"),
      fidelity: z
        .number()
        .min(1)
        .max(1440)
        .default(60)
        .describe("Resolution in minutes between data points (default: 60)"),
    },
    async (args) => {
      try {
        const data = await clob.getPriceHistory(args.token_id, args.interval, args.fidelity);
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
