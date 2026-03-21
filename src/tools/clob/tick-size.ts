import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClobApi } from "../../api/clob.js";
import { jsonResponse, errorResponse } from "../../format.js";

export function register(server: McpServer, clob: ClobApi) {
  server.tool(
    "get_tick_size",
    "Get the minimum tick size (price increment) for a Polymarket token.",
    {
      token_id: z.string().describe("CLOB token ID"),
    },
    async (args) => {
      try {
        const data = await clob.getTickSize(args.token_id);
        return jsonResponse(data);
      } catch (error) {
        return errorResponse(error);
      }
    },
  );
}
