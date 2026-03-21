import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ClobApi } from "../../api/clob.js";

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
